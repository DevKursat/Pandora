import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

/**
 * Firebase Admin SDK'sını yalnızca bir kez başlatan ve
 * başlatma başarısız olursa servisleri (db, auth) tanımsız bırakan güvenli fonksiyon.
 */
function initializeFirebaseAdmin() {
    if (admin.apps.length) {
        db = admin.firestore();
        auth = admin.auth();
        return;
    }
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });
        db = admin.firestore();
        auth = admin.auth();
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        // Başlatma başarısız olursa, servislerin kullanılması engellenir.
    }
}

// Modül yüklendiğinde başlatmayı bir kez dene
initializeFirebaseAdmin();

// --- Firebase Fonksiyonları ---

export const getAllUsers = async () => {
  if (!auth) {
    console.warn("Firebase Admin not initialized. Skipping getAllUsers.");
    return [];
  }
  try {
    const userRecords = await auth.listUsers(1000);
    return userRecords.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || 'user',
      vipExpiry: user.customClaims?.vipExpiry || null,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const addUser = async (email: string, password_hash: string, role: string, vipExpiry?: string | null) => {
  if (!auth) {
    console.warn("Firebase Admin not initialized. Skipping addUser.");
    return null;
  }
  try {
    const userRecord = await auth.createUser({ email, password: password_hash });
    await auth.setCustomUserClaims(userRecord.uid, { role, vipExpiry });
    return { uid: userRecord.uid, email: userRecord.email, role, vipExpiry };
  } catch (error) {
    console.error('Error adding user:', error);
    return null;
  }
};

export const updateUserRole = async (userId: string, role: string, vipExpiry?: string | null) => {
  if (!auth) {
    console.warn("Firebase Admin not initialized. Skipping updateUserRole.");
    return false;
  }
  try {
    await auth.setCustomUserClaims(userId, { role, vipExpiry });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

export const deleteUser = async (userId: string) => {
  if (!auth) {
    console.warn("Firebase Admin not initialized. Skipping deleteUser.");
    return false;
  }
  try {
    await auth.deleteUser(userId);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const getActiveUsers = async () => {
    if (!db) {
        console.warn("Firestore not initialized. Skipping getActiveUsers.");
        return [];
    }
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const snapshot = await db.collection('loginHistory').where('timestamp', '>=', twentyFourHoursAgo).get();
        const activeUserIds = [...new Set(snapshot.docs.map(doc => doc.data().userId))];
        return activeUserIds;
    } catch (error) {
        console.error('Error fetching active users:', error);
        return [];
    }
};

export const getUserDevices = async (userId: string) => {
    if (!db) {
        console.warn("Firestore not initialized. Skipping getUserDevices.");
        return [];
    }
    try {
        const snapshot = await db.collection('devices').where('userId', '==', userId).get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error(`Error fetching devices for user ${userId}:`, error);
        return [];
    }
};

export const getUserLoginHistory = async (userId: string) => {
    if (!db) {
        console.warn("Firestore not initialized. Skipping getUserLoginHistory.");
        return [];
    }
    try {
        const snapshot = await db.collection('loginHistory').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error(`Error fetching login history for user ${userId}:`, error);
        return [];
    }
};

export const getAllUsersWithDevices = async () => {
    if (!db || !auth) {
        console.warn("Firebase Admin not initialized. Skipping getAllUsersWithDevices.");
        return [];
    }
    try {
        const devicesSnapshot = await db.collection('devices').get();
        const devicesByUserId = devicesSnapshot.docs.reduce((acc, doc) => {
            const device = doc.data();
            if (!acc[device.userId]) {
                acc[device.userId] = [];
            }
            acc[device.userId].push(device);
            return acc;
        }, {} as { [key: string]: any[] });

        const users = await getAllUsers();
        return users.map(user => ({
            ...user,
            devices: devicesByUserId[user.uid] || [],
        }));
    } catch (error) {
        console.error('Error fetching all users with devices:', error);
        return [];
    }
};

export const getQueryLogs = async (limit: number) => {
    if (!db) {
        console.warn("Firestore not initialized. Skipping getQueryLogs.");
        return [];
    }
    try {
        const snapshot = await db.collection('queryLogs').orderBy('timestamp', 'desc').limit(limit).get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error fetching query logs:', error);
        return [];
    }
};
