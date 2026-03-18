"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "@/server/notifications/notification-repository"

export async function markNotificationReadAction(notificationId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  await markNotificationAsRead({
    notificationId,
    ownerId: user.id
  })

  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
}

export async function markAllNotificationsReadAction() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  await markAllNotificationsAsRead(user.id)

  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
}
