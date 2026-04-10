import { describe, expect, it } from "vitest"
import {
  getServerEnvironment,
  getWebRuntimeReadiness,
  getWebRuntimeStatus
} from "./env"

describe("getWebRuntimeReadiness", () => {
  it("reports all readiness flags when the expected environment is present", () => {
    expect(
      getWebRuntimeReadiness({
        NEXT_PUBLIC_APP_URL: "https://app.example.com",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "https://supabase.example.com",
        R2_ACCESS_KEY_ID: "access-key",
        R2_ACCOUNT_ID: "account-id",
        R2_BUCKET_NAME: "bucket-name",
        R2_SECRET_ACCESS_KEY: "secret-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role"
      })
    ).toEqual({
      publicAppUrlConfigured: true,
      r2Configured: true,
      serviceRoleConfigured: true,
      supabaseAuthConfigured: true
    })
  })

  it("reports missing readiness flags independently", () => {
    expect(
      getWebRuntimeReadiness({
        NEXT_PUBLIC_APP_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        NEXT_PUBLIC_SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: ""
      })
    ).toEqual({
      publicAppUrlConfigured: false,
      r2Configured: false,
      serviceRoleConfigured: false,
      supabaseAuthConfigured: false
    })
  })
})

describe("getWebRuntimeStatus", () => {
  it("returns ok only when all critical readiness flags are present", () => {
    expect(
      getWebRuntimeStatus({
        publicAppUrlConfigured: true,
        r2Configured: true,
        serviceRoleConfigured: true,
        supabaseAuthConfigured: true
      })
    ).toBe("ok")

    expect(
      getWebRuntimeStatus({
        publicAppUrlConfigured: true,
        r2Configured: false,
        serviceRoleConfigured: true,
        supabaseAuthConfigured: true
      })
    ).toBe("degraded")
  })
})

describe("getServerEnvironment", () => {
  it("treats blank optional server values as undefined", () => {
    expect(getServerEnvironment({
      SUPABASE_SERVICE_ROLE_KEY: "",
      R2_ACCOUNT_ID: "",
      R2_ACCESS_KEY_ID: "",
      R2_SECRET_ACCESS_KEY: "",
      R2_BUCKET_NAME: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      STRIPE_BILLING_PORTAL_CONFIGURATION_ID: "",
      STRIPE_PRICE_STARTER_MONTHLY: "",
      STRIPE_PRICE_GROWTH_MONTHLY: "",
      STRIPE_PRICE_SCALE_MONTHLY: "",
      BILLING_OPERATOR_SECRET: "",
      CREATIVE_PERFORMANCE_OPERATOR_SECRET: ""
    })).toEqual({
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      R2_ACCOUNT_ID: undefined,
      R2_ACCESS_KEY_ID: undefined,
      R2_SECRET_ACCESS_KEY: undefined,
      R2_BUCKET_NAME: undefined,
      STRIPE_SECRET_KEY: undefined,
      STRIPE_WEBHOOK_SECRET: undefined,
      STRIPE_BILLING_PORTAL_CONFIGURATION_ID: undefined,
      STRIPE_PRICE_STARTER_MONTHLY: undefined,
      STRIPE_PRICE_GROWTH_MONTHLY: undefined,
      STRIPE_PRICE_SCALE_MONTHLY: undefined,
      BILLING_OPERATOR_SECRET: undefined,
      CREATIVE_PERFORMANCE_OPERATOR_SECRET: undefined
    })
  })
})
