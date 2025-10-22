let maintenanceMode = false

export function isMaintenanceMode(): boolean {
  return maintenanceMode
}

export function setMaintenanceMode(enabled: boolean): void {
  maintenanceMode = enabled
}
