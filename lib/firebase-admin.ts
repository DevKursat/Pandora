import admin from 'firebase-admin';

// This function ensures Firebase Admin is initialized only once.
const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return;
  }

  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    console.error("Firebase Admin SDK Error: GOOGLE_APPLICATION_CREDENTIALS_JSON is not set.");
    throw new Error("Sunucu yapılandırma hatası: Firebase Admin kimlik bilgileri eksik.");
  }

  try {
    const serviceAccount = JSON.parse(credentialsJson);

    // The crucial fix for Vercel environments where the private key newlines are double-escaped.
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
     console.log("Firebase Admin SDK successfully initialized.");
  } catch (error: any) {
    console.error("Firebase Admin SDK Initialization Error:", error.message);
    // Throw a more descriptive error to aid in debugging.
    throw new Error(`Firebase Admin kimlik bilgileri ayrıştırılamadı: ${error.message}`);
  }
};

// Run the initialization function.
initializeFirebaseAdmin();

// Export the initialized services.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
