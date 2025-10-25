import { NextResponse } from "next/server";
import { isMaintenanceMode } from "@/lib/maintenance";

export async function GET() {
  try {
    const enabled = await isMaintenanceMode();
    return NextResponse.json({ maintenanceMode: enabled });
  } catch (error) {
    console.error("Failed to get maintenance mode:", error);
    return NextResponse.json({ error: "Failed to get maintenance mode" }, { status: 500 });
  }
}
