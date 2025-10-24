import { NextResponse } from "next/server"
import { getQueryLogs } from "@/lib/users"

export async function GET() {
  try {
    const logs = await getQueryLogs(100)
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
