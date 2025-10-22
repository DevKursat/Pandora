import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, recipients } = await request.json()

    // In a real application, this would send notifications to users
    // For now, we'll just log it
    console.log(`[v0] Notification sent to ${recipients}: ${message}`)

    return NextResponse.json({ success: true, message: "Notification sent successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
