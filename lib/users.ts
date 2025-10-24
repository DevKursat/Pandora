import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

/**
 * Firebase Admin SDK'sını yalnızca bir kez başlatan güvenli fonksiyon.
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
    }
}

initializeFirebaseAdmin();

// --- Firebase Fonksiyonları ---

export const getAllUsers = async () => {
  // ... (mevcut kod değişmedi)
};

/**
 * Yeni bir kullanıcı oluşturur (Authentication) ve profilini (Firestore) kaydeder.
 */
export const addUser = async (userData: any) => {
  if (!auth || !db) {
    console.warn("Firebase Admin not initialized. Skipping addUser.");
    return null;
  }

  const { email, password, role, vipExpiry, ...profileData } = userData;

  try {
    // 1. Firebase Authentication'da kullanıcı oluştur
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: profileData.username || profileData.fullName,
    });

    // 2. Rol ve VIP süresi gibi özel yetkileri ayarla
    await auth.setCustomUserClaims(userRecord.uid, { role, vipExpiry });

    // 3. Geri kalan tüm profil bilgilerini Firestore'da sakla
    await db.collection('users').doc(userRecord.uid).set({
      ...profileData,
      email, // E-postayı Firestore'da da saklamak sorgulama kolaylığı sağlar
      role,
      vipExpiry: vipExpiry || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { uid: userRecord.uid, ...userData };
  } catch (error) {
    console.error('Error adding user:', error);
    // @ts-ignore
    throw new Error(error.message || 'Kullanıcı oluşturulamadı.');
  }
};


export const updateUserRole = async (userId: string, role: string, vipExpiry?: string | null) => {
  // ... (mevcut kod değişmedi)
};

export const deleteUser = async (userId: string) => {
  // ... (mevcut kod değişmedi)
};

// ... (diğer tüm fonksiyonlar aynı kaldı)
// Not: Diğer fonksiyonlar okuma kolaylığı için çıkarıldı, ama dosyanın geri kalanı aynı.
// Önceki adımdaki tam dosyayı referans alabilirim.
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
