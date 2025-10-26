import { adminDb } from '@/lib/firebase-admin';

/**
 * Fetches the current maintenance mode status from Firestore.
 * @returns {Promise<{isEnabled: boolean}>} The maintenance status.
 */
export async function getMaintenanceStatus() {
  try {
    const maintenanceRef = adminDb.collection('settings').doc('maintenance');
    const doc = await maintenanceRef.get();

    if (doc.exists) {
      return { isEnabled: doc.data()?.enabled || false };
    }
    // If the document doesn't exist, assume maintenance is off.
    return { isEnabled: false };
  } catch (error) {
    console.error('Error fetching maintenance status directly:', error);
    // In case of error, fail open (assume maintenance is off) to not lock out users.
    return { isEnabled: false };
  }
}
