import { type NextRequest, NextResponse } from "next/server";
import { setMaintenanceMode, isMaintenanceMode } from "@/lib/maintenance";

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();
    await setMaintenanceMode(enabled);
    return NextResponse.json({ success: true, maintenanceMode: enabled });
  } catch (error) {
    console.error("Failed to toggle maintenance mode:", error);
    return NextResponse.json({ error: "Failed to toggle maintenance mode" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const enabled = await isMaintenanceMode();
    return NextResponse.json({ maintenanceMode: enabled });
  } catch (error) {
    console.error("Failed to get maintenance mode:", error);
    return NextResponse.json({ error: "Failed to get maintenance mode" }, { status: 500 });
  }
}
