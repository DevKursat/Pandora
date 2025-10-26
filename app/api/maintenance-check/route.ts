import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 0; // Don't cache this response

export async function GET() {
  try {
    const maintenanceRef = adminDb.collection('settings').doc('maintenance');
    const doc = await maintenanceRef.get();

    if (doc.exists) {
      return NextResponse.json({ isEnabled: doc.data()?.enabled || false });
    }
    // If the document doesn't exist, assume maintenance is off
    return NextResponse.json({ isEnabled: false });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    // In case of error, fail open (assume maintenance is off) to not lock out users
    return NextResponse.json({ isEnabled: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}
