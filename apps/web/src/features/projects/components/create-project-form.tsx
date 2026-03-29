import { createProjectAction } from "@/features/projects/actions/create-project"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type CreateProjectFormProps = {
  errorMessage?: string
}

export function CreateProjectForm({ errorMessage }: CreateProjectFormProps) {
  return (
    <SurfaceCard className="p-8">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        New project
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
        Create the first working project flow
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
        This phase creates the real project spine. Start with a project name, then
        continue into the persisted brief and asset intake flow.
      </p>

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <form action={createProjectAction} className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Project name</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder="Luxe serum launch"
          />
        </label>

        <div className="flex items-center gap-3">
          <FormSubmitButton size="lg" pendingLabel="Creating project…">
            Create project
          </FormSubmitButton>
          <p className="text-sm text-slate-400">
            You will be redirected to the project detail workspace.
          </p>
        </div>
      </form>
    </SurfaceCard>
  )
}
