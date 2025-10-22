export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "vip" | "demo"
  vipExpiryDate?: string
  createdAt: string
  lastLogin?: string
  devices?: DeviceInfo[]
  loginHistory?: LoginHistory[]
}

export interface QueryLog {
  id: string
  userId: string
  username: string
  queryType: string
  timestamp: string
  status: "success" | "failed" | "denied"
  params: Record<string, string>
}

export interface DeviceInfo {
  id: string
  deviceName: string
  deviceType: string
  browser: string
  os: string
  ipAddress: string
  lastSeen: string
  firstSeen: string
}

export interface LoginHistory {
  id: string
  ipAddress: string
  deviceId: string
  timestamp: string
  location?: string
  success: boolean
}

const users: User[] = [
  {
    id: "1",
    username: "pandora",
    password: "192621",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    username: "demo",
    password: "demo",
    role: "demo",
    createdAt: "2024-01-01T00:00:00Z",
  },
]

let queryLogs: QueryLog[] = []
const activeUsers: Set<string> = new Set()

export function getAllUsers(): User[] {
  return users.map((u) => ({ ...u, password: "***" }))
}

export function addUser(username: string, password: string, role: "vip" | "demo", vipExpiryDate?: string): User {
  const newUser: User = {
    id: Date.now().toString(),
    username,
    password,
    role,
    vipExpiryDate,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  return { ...newUser, password: "***" }
}

export function updateUserRole(userId: string, role: "admin" | "vip" | "demo", vipExpiryDate?: string): boolean {
  const user = users.find((u) => u.id === userId)
  if (user) {
    user.role = role
    if (vipExpiryDate) {
      user.vipExpiryDate = vipExpiryDate
    }
    return true
  }
  return false
}

export function deleteUser(userId: string): boolean {
  const index = users.findIndex((u) => u.id === userId)
  if (index !== -1 && users[index].username !== "pandora") {
    users.splice(index, 1)
    return true
  }
  return false
}

export function addQueryLog(log: Omit<QueryLog, "id" | "timestamp">): void {
  queryLogs.push({
    ...log,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  })
  if (queryLogs.length > 1000) {
    queryLogs = queryLogs.slice(-1000)
  }
}

export function getQueryLogs(limit = 50): QueryLog[] {
  return queryLogs.slice(-limit).reverse()
}

export function addActiveUser(username: string): void {
  activeUsers.add(username)
}

export function removeActiveUser(username: string): void {
  activeUsers.delete(username)
}

export function getActiveUsers(): string[] {
  return Array.from(activeUsers)
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function authenticateUser(username: string, password: string): User | null {
  const user = users.find((u) => u.username === username && u.password === password)
  if (user) {
    user.lastLogin = new Date().toISOString()
    addActiveUser(username)
    return user
  }
  return null
}

export function trackDeviceLogin(
  username: string,
  deviceInfo: {
    deviceName: string
    deviceType: string
    browser: string
    os: string
    ipAddress: string
    location?: string
  },
): void {
  const user = users.find((u) => u.username === username)
  if (!user) return

  if (!user.devices) user.devices = []
  if (!user.loginHistory) user.loginHistory = []

  const existingDevice = user.devices.find(
    (d) => d.ipAddress === deviceInfo.ipAddress && d.deviceName === deviceInfo.deviceName,
  )

  const deviceId = existingDevice?.id || Date.now().toString()

  if (existingDevice) {
    existingDevice.lastSeen = new Date().toISOString()
  } else {
    user.devices.push({
      id: deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ipAddress: deviceInfo.ipAddress,
      lastSeen: new Date().toISOString(),
      firstSeen: new Date().toISOString(),
    })
  }

  user.loginHistory.push({
    id: Date.now().toString(),
    ipAddress: deviceInfo.ipAddress,
    deviceId: deviceId,
    timestamp: new Date().toISOString(),
    location: deviceInfo.location,
    success: true,
  })

  if (user.loginHistory.length > 100) {
    user.loginHistory = user.loginHistory.slice(-100)
  }
}

export function getUserDevices(userId: string): DeviceInfo[] {
  const user = users.find((u) => u.id === userId)
  return user?.devices || []
}

export function getUserLoginHistory(userId: string): LoginHistory[] {
  const user = users.find((u) => u.id === userId)
  return user?.loginHistory || []
}

export function getAllUsersWithDevices(): (User & { deviceCount: number; uniqueIPs: number })[] {
  return users.map((u) => {
    const devices = u.devices || []
    const uniqueIPs = new Set(devices.map((d) => d.ipAddress)).size
    return {
      ...u,
      password: "***",
      deviceCount: devices.length,
      uniqueIPs,
    }
  })
}
