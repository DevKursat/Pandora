import * as admin from 'firebase-admin';

// Bu fonksiyon, Firebase Admin'i yalnızca bir kez başlatır ve
// başlatılmış uygulamayı döndürür. Bu "tembel" yaklaşım, derleme hatalarını önler.
const initializeFirebaseAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        // Hata yalnızca runtime'da oluşursa logla, derlemeyi kırma.
        if (process.env.NODE_ENV !== 'production') {
            console.error('Firebase Admin initialization error:', error.message);
        }
        // Başlatma başarısız olursa, null veya tanımsız bir uygulama döndürmek yerine,
        // sonraki adımlarda hata yönetimi yapılmasını bekleriz.
    }

    return admin.app();
};

// Bu fonksiyonlar, servisleri kullanmadan önce başlatmayı dener.
export const getFirebaseAuth = () => {
    initializeFirebaseAdmin();
    return admin.auth();
};

export const getFirestore = () => {
    initializeFirebaseAdmin();
    return admin.firestore();
};
