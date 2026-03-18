"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createProjectSchema } from "@/features/projects/schemas/project-schema"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createProject } from "@/server/projects/project-repository"

export async function createProjectAction(formData: FormData) {
  // #region agent log
  fetch('http://127.0.0.1:7682/ingest/8799e641-d605-442c-ab12-29862cd0eef4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'42c6b9'},body:JSON.stringify({sessionId:'42c6b9',runId:'create-project-pre',hypothesisId:'CP1',location:'src/features/projects/actions/create-project.ts:10',message:'createProjectAction:start',data:{hasNameField:formData.has('name'),nameLength:typeof formData.get('name')==='string'?(formData.get('name') as string).length:null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const user = await getAuthenticatedUser()

  if (!user) {
    // #region agent log
    fetch('http://127.0.0.1:7682/ingest/8799e641-d605-442c-ab12-29862cd0eef4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'42c6b9'},body:JSON.stringify({sessionId:'42c6b9',runId:'create-project-pre',hypothesisId:'CP2',location:'src/features/projects/actions/create-project.ts:16',message:'createProjectAction:no_user_redirect',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    redirect("/login")
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name")
  })

  if (!parsed.success) {
    // #region agent log
    fetch('http://127.0.0.1:7682/ingest/8799e641-d605-442c-ab12-29862cd0eef4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'42c6b9'},body:JSON.stringify({sessionId:'42c6b9',runId:'create-project-pre',hypothesisId:'CP3',location:'src/features/projects/actions/create-project.ts:25',message:'createProjectAction:validation_failed',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    redirect("/dashboard/projects/new?error=Please%20enter%20a%20valid%20project%20name.")
  }

  const project = await createProject({
    name: parsed.data.name,
    ownerId: user.id
  })

  // #region agent log
  fetch('http://127.0.0.1:7682/ingest/8799e641-d605-442c-ab12-29862cd0eef4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'42c6b9'},body:JSON.stringify({sessionId:'42c6b9',runId:'create-project-pre',hypothesisId:'CP4',location:'src/features/projects/actions/create-project.ts:37',message:'createProjectAction:created',data:{projectIdPresent:Boolean(project?.id)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  revalidatePath("/dashboard")
  redirect(`/dashboard/projects/${project.id}`)
}
