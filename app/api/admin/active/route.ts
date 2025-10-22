import { NextResponse } from "next/server"
import { getActiveUsers } from "@/lib/users"

export async function GET() {
  try {
    const activeUsers = getActiveUsers()
    return NextResponse.json(activeUsers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch active users" }, { status: 500 })
  }
}
