import admin from 'firebase-admin';

// Check for the environment variable and throw a clear error if it's missing.
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.error("Firebase Admin SDK initialization failed: GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.");
  // In a local development environment, you might want to throw an error to halt execution.
  // In production, you should have robust error handling and logging.
  throw new Error("Missing Firebase Admin credentials. The service cannot start.");
}

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Make sure it's a valid JSON string.", error);
    throw new Error("Invalid Firebase Admin credentials format.");
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
