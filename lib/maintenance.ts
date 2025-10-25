import { adminDb } from './firebase-admin';

const settingsRef = adminDb.collection('settings').doc('maintenance');

export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const doc = await settingsRef.get();
    if (doc.exists) {
      return doc.data()?.enabled || false;
    }
    return false;
  } catch (error) {
    console.error("Error getting maintenance mode:", error);
    return false;
  }
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  try {
    await settingsRef.set({ enabled });
  } catch (error) {
    console.error("Error setting maintenance mode:", error);
  }
}
