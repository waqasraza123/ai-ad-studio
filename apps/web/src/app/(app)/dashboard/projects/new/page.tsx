import { CreateProjectForm } from "@/features/projects/components/create-project-form"
import { getFormErrorMessage } from "@/lib/form-error-messages"

type NewProjectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export default async function NewProjectPage({
  searchParams
}: NewProjectPageProps) {
  const params = await searchParams
  const errorMessage = getFormErrorMessage(readSearchParam(params, "error"))

  return (
    <div className="mx-auto max-w-4xl">
      <CreateProjectForm errorMessage={errorMessage ?? undefined} />
    </div>
  )
}
