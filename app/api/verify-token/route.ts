import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return NextResponse.json({ role: decodedToken.role || 'demo' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
