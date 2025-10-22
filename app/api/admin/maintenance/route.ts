import { type NextRequest, NextResponse } from "next/server"
import { setMaintenanceMode } from "@/lib/maintenance"

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json()
    setMaintenanceMode(enabled)
    return NextResponse.json({ success: true, maintenanceMode: enabled })
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle maintenance mode" }, { status: 500 })
  }
}

export async function GET() {
  const { isMaintenanceMode } = await import("@/lib/maintenance")
  return NextResponse.json({ maintenanceMode: isMaintenanceMode() })
}
