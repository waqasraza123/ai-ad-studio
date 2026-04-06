from __future__ import annotations

import base64
import io
import os
import tempfile
import time
import urllib.request
from pathlib import Path
from typing import Any
from uuid import uuid4

import imageio.v2 as imageio
import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from PIL import Image

APP_NAME = "AI Ad Studio Local Inference"
ARTIFACT_TTL_SECONDS = int(os.getenv("LOCAL_ARTIFACT_TTL_SECONDS", "21600"))
ARTIFACT_ROOT = Path(tempfile.gettempdir()) / "ai-ad-studio-local-inference"
ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)

SUPPORTED_IMAGE_MODELS = {"flux-schnell", "sdxl-turbo"}
SUPPORTED_VIDEO_MODELS = {
    "cogvideox1.5-5b-i2v",
    "wan2.1-i2v-14b-480p",
    "svd-img2vid",
}
MODEL_REPOSITORIES = {
    "flux-schnell": "black-forest-labs/FLUX.1-schnell",
    "sdxl-turbo": "stabilityai/sdxl-turbo",
    "cogvideox1.5-5b-i2v": "THUDM/CogVideoX1.5-5B-I2V",
    "wan2.1-i2v-14b-480p": "Wan-AI/Wan2.1-I2V-14B-480P-Diffusers",
    "svd-img2vid": "stabilityai/stable-video-diffusion-img2vid-xt",
}
PIPELINE_CACHE: dict[tuple[str, str, str, bool], Any] = {}

app = FastAPI(title=APP_NAME)


class ReferenceImage(BaseModel):
    tag: str | None = None
    uri: str


class PreviewRequest(BaseModel):
    model: str = Field(..., examples=["flux-schnell"])
    promptText: str
    referenceImages: list[ReferenceImage] = Field(default_factory=list)
    targetWidth: int = 1080
    targetHeight: int = 1920


class SceneVideoRequest(BaseModel):
    aspectRatio: str = "9:16"
    durationSeconds: float = 3.0
    model: str = Field(..., examples=["cogvideox1.5-5b-i2v"])
    promptImage: str
    promptText: str


def parse_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


def current_settings() -> dict[str, Any]:
    return {
        "device": os.getenv("LOCAL_DEVICE", "cuda"),
        "dtype": os.getenv("LOCAL_DTYPE", "bf16"),
        "enable_cpu_offload": parse_bool_env("LOCAL_ENABLE_CPU_OFFLOAD", False),
    }


def cleanup_expired_artifacts() -> None:
    now = time.time()

    for artifact in ARTIFACT_ROOT.glob("*"):
        try:
            if artifact.is_file() and now - artifact.stat().st_mtime > ARTIFACT_TTL_SECONDS:
                artifact.unlink(missing_ok=True)
        except OSError:
            continue


def data_uri_to_image(value: str) -> Image.Image:
    if value.startswith("data:"):
        try:
            _, payload = value.split(",", 1)
        except ValueError as error:
            raise HTTPException(status_code=400, detail="Invalid data URI") from error

        return Image.open(io.BytesIO(base64.b64decode(payload))).convert("RGB")

    with urllib.request.urlopen(value) as response:
        return Image.open(io.BytesIO(response.read())).convert("RGB")


def image_to_data_url(image: Image.Image, mime_type: str = "image/png") -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:{mime_type};base64,{encoded}"


def get_torch_components():
    try:
        import torch  # type: ignore
    except ImportError as error:
        raise HTTPException(
            status_code=500,
            detail="torch is not installed. Install services/local-inference/requirements.txt first.",
        ) from error

    dtype_name = os.getenv("LOCAL_DTYPE", "bf16")
    dtype = {
        "bf16": torch.bfloat16,
        "fp16": torch.float16,
        "fp32": torch.float32,
    }.get(dtype_name, torch.bfloat16)

    return torch, dtype


def configure_pipeline_for_device(pipeline: Any) -> Any:
    settings = current_settings()

    if settings["enable_cpu_offload"] and hasattr(pipeline, "enable_model_cpu_offload"):
        pipeline.enable_model_cpu_offload()
        return pipeline

    if hasattr(pipeline, "to"):
        pipeline.to(settings["device"])

    return pipeline


def get_pipeline(model: str) -> Any:
    settings = current_settings()
    cache_key = (
        model,
        str(settings["device"]),
        str(settings["dtype"]),
        bool(settings["enable_cpu_offload"]),
    )

    cached = PIPELINE_CACHE.get(cache_key)
    if cached is not None:
        return cached

    torch, torch_dtype = get_torch_components()

    if model == "flux-schnell":
        from diffusers import FluxPipeline  # type: ignore

        pipeline = FluxPipeline.from_pretrained(
            MODEL_REPOSITORIES[model], torch_dtype=torch_dtype
        )
    elif model == "sdxl-turbo":
        from diffusers import AutoPipelineForText2Image  # type: ignore

        pipeline = AutoPipelineForText2Image.from_pretrained(
            MODEL_REPOSITORIES[model], torch_dtype=torch_dtype
        )
    elif model == "cogvideox1.5-5b-i2v":
        from diffusers import CogVideoXImageToVideoPipeline  # type: ignore

        pipeline = CogVideoXImageToVideoPipeline.from_pretrained(
            MODEL_REPOSITORIES[model], torch_dtype=torch_dtype
        )
    elif model == "wan2.1-i2v-14b-480p":
        from diffusers import WanImageToVideoPipeline  # type: ignore

        pipeline = WanImageToVideoPipeline.from_pretrained(
            MODEL_REPOSITORIES[model], torch_dtype=torch_dtype
        )
    elif model == "svd-img2vid":
        from diffusers import StableVideoDiffusionPipeline  # type: ignore

        pipeline = StableVideoDiffusionPipeline.from_pretrained(
            MODEL_REPOSITORIES[model], torch_dtype=torch_dtype
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported model '{model}'.")

    pipeline = configure_pipeline_for_device(pipeline)

    if hasattr(pipeline, "set_progress_bar_config"):
        pipeline.set_progress_bar_config(disable=True)

    PIPELINE_CACHE[cache_key] = pipeline
    return pipeline


def generate_preview_image(request: PreviewRequest) -> Image.Image:
    pipeline = get_pipeline(request.model)

    if request.model == "flux-schnell":
        result = pipeline(
            prompt=request.promptText,
            guidance_scale=0.0,
            height=request.targetHeight,
            num_inference_steps=4,
            width=request.targetWidth,
        )
        return result.images[0].convert("RGB")

    if request.model == "sdxl-turbo":
        result = pipeline(
            prompt=request.promptText,
            guidance_scale=0.0,
            height=request.targetHeight,
            num_inference_steps=1,
            width=request.targetWidth,
        )
        return result.images[0].convert("RGB")

    raise HTTPException(status_code=400, detail="Unsupported preview model.")


def aspect_ratio_to_frame_size(aspect_ratio: str) -> tuple[int, int]:
    if aspect_ratio == "16:9":
        return (1024, 576)

    if aspect_ratio == "1:1":
        return (768, 768)

    return (720, 1280)


def normalize_frame(frame: Any) -> np.ndarray:
    if isinstance(frame, Image.Image):
        return np.asarray(frame.convert("RGB"))

    return np.asarray(frame)


def write_video_artifact(frames: list[Any], duration_seconds: float) -> str:
    cleanup_expired_artifacts()
    artifact_id = f"{uuid4()}.mp4"
    output_path = ARTIFACT_ROOT / artifact_id
    fps = max(1, round(len(frames) / max(duration_seconds, 1)))
    normalized_frames = [normalize_frame(frame) for frame in frames]
    imageio.mimsave(output_path, normalized_frames, fps=fps)
    return artifact_id


def generate_video_frames(request: SceneVideoRequest) -> list[Any]:
    pipeline = get_pipeline(request.model)
    prompt_image = data_uri_to_image(request.promptImage)
    width, height = aspect_ratio_to_frame_size(request.aspectRatio)
    prompt_image = prompt_image.resize((width, height))

    if request.model == "cogvideox1.5-5b-i2v":
        result = pipeline(
            image=prompt_image,
            num_frames=max(16, int(round(request.durationSeconds * 8))),
            num_inference_steps=30,
            prompt=request.promptText,
        )
        return list(result.frames[0])

    if request.model == "wan2.1-i2v-14b-480p":
        result = pipeline(
            image=prompt_image,
            num_frames=max(16, int(round(request.durationSeconds * 8))),
            num_inference_steps=30,
            prompt=request.promptText,
        )
        return list(result.frames[0])

    if request.model == "svd-img2vid":
        result = pipeline(
            image=prompt_image,
            decode_chunk_size=8,
            motion_bucket_id=127,
            noise_aug_strength=0.02,
        )
        return list(result.frames[0])

    raise HTTPException(status_code=400, detail="Unsupported video model.")


@app.get("/health")
def health() -> dict[str, Any]:
    cleanup_expired_artifacts()
    return {
        "device": current_settings()["device"],
        "dtype": current_settings()["dtype"],
        "name": APP_NAME,
        "status": "ok",
        "supportedImageModels": sorted(SUPPORTED_IMAGE_MODELS),
        "supportedVideoModels": sorted(SUPPORTED_VIDEO_MODELS),
    }


@app.post("/v1/preview")
def create_preview(request: PreviewRequest) -> dict[str, Any]:
    if request.model not in SUPPORTED_IMAGE_MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported image model '{request.model}'.")

    image = generate_preview_image(request)

    return {
        "imageDataUrl": image_to_data_url(image),
        "metadata": {
            "referenceImagesAccepted": len(request.referenceImages),
            "referenceImagesUsed": 0,
            "repoModelId": MODEL_REPOSITORIES[request.model],
        },
        "model": request.model,
        "provider": "local_http",
    }


@app.post("/v1/scene-video")
def create_scene_video(request: SceneVideoRequest, http_request: Request) -> dict[str, Any]:
    if request.model not in SUPPORTED_VIDEO_MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported video model '{request.model}'.")

    frames = generate_video_frames(request)
    artifact_id = write_video_artifact(frames, request.durationSeconds)
    artifact_url = str(http_request.base_url).rstrip("/") + f"/v1/artifacts/{artifact_id}"

    return {
        "artifactUrl": artifact_url,
        "externalJobId": artifact_id,
        "metadata": {
            "aspectRatio": request.aspectRatio,
            "durationSeconds": request.durationSeconds,
            "frameCount": len(frames),
            "repoModelId": MODEL_REPOSITORIES[request.model],
        },
        "model": request.model,
        "provider": "local_http",
    }


@app.get("/v1/artifacts/{artifact_id}")
def read_artifact(artifact_id: str) -> FileResponse:
    cleanup_expired_artifacts()
    artifact_path = ARTIFACT_ROOT / artifact_id

    if not artifact_path.exists() or not artifact_path.is_file():
        raise HTTPException(status_code=404, detail="Artifact not found.")

    return FileResponse(artifact_path, media_type="video/mp4", filename=artifact_id)
