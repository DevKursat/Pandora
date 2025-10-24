import { NextResponse } from "next/server"
import { getUserDevices, getUserLoginHistory, getAllUsersWithDevices } from "@/lib/users"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const type = searchParams.get("type")

  if (userId && type === "devices") {
    const devices = await getUserDevices(userId)
    return NextResponse.json(devices)
  }

  if (userId && type === "history") {
    const history = await getUserLoginHistory(userId)
    return NextResponse.json(history)
  }

  const usersWithDevices = await getAllUsersWithDevices()
  return NextResponse.json(usersWithDevices)
}
