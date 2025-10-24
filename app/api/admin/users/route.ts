import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, addUser, updateUserRole, deleteUser } from "@/lib/users"

export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, vipExpiry } = await request.json()
    const user = await addUser(email, password, role, vipExpiry)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, role, vipExpiry } = await request.json()
    const success = await updateUserRole(userId, role, vipExpiry)
    return NextResponse.json({ success })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }
    const success = await deleteUser(userId)
    return NextResponse.json({ success })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
