import { type NextRequest, NextResponse } from "next/server"

const disabledQueries = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const { queryType, enabled } = await request.json()

    if (enabled) {
      disabledQueries.delete(queryType)
    } else {
      disabledQueries.add(queryType)
    }

    return NextResponse.json({ success: true, queryType, enabled })
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle query" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ disabledQueries: Array.from(disabledQueries) })
}
