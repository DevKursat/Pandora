"use client"

import { authenticateUser, trackDeviceLogin } from "./users"

export type UserRole = "demo" | "vip" | "admin"

export interface User {
  username: string
  role: UserRole
}

function getDeviceInfo(): {
  deviceName: string
  deviceType: string
  browser: string
  os: string
} {
  const ua = navigator.userAgent

  let deviceType = "Desktop"
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? "Tablet" : "Mobile"
  }

  let browser = "Unknown"
  if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Chrome")) browser = "Chrome"
  else if (ua.includes("Safari")) browser = "Safari"
  else if (ua.includes("Edge")) browser = "Edge"
  else if (ua.includes("Opera")) browser = "Opera"

  let os = "Unknown"
  if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac")) os = "macOS"
  else if (ua.includes("Linux")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"

  const deviceName = `${browser} on ${os}`

  return { deviceName, deviceType, browser, os }
}

async function getIPAddress(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    return data.ip
  } catch {
    return "Unknown"
  }
}

export async function login(username: string, password: string): Promise<User | null> {
  const user = authenticateUser(username, password)
  if (user) {
    const userData = { username: user.username, role: user.role }
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData))

      const deviceInfo = getDeviceInfo()
      const ipAddress = await getIPAddress()

      trackDeviceLogin(username, {
        ...deviceInfo,
        ipAddress,
      })
    }
    return userData
  }
  return null
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      return JSON.parse(userStr)
    }
  }
  return null
}

export function isVipOrAdmin(user: User | null): boolean {
  return user?.role === "vip" || user?.role === "admin"
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin"
}
