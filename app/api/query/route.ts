import { type NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

/**
 * Güvenli Firebase Admin başlatma fonksiyonu.
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
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        auth = admin.auth();
    } catch (error) {
        console.error('Firebase Admin initialization error in query API:', error);
    }
}

initializeFirebaseAdmin();

/**
 * Sorgu logunu Firestore'a yazar.
 */
async function logQueryToFirestore(logData: any) {
    if (!db) {
        console.error("Firestore not initialized, cannot log query.");
        return;
    }
    try {
        await db.collection('queryLogs').add({
            ...logData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to write query log to Firestore:", error);
    }
}

/**
 * İstekten gelen Authorization başlığından kullanıcı kimliğini doğrular.
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    if (!auth) return null;

    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error('Error verifying ID token:', error);
            return null;
        }
    }
    return null;
}

export async function POST(request: NextRequest) {
    const userId = await getUserIdFromRequest(request);

    // Temel log verisi
    const logData: any = {
        userId: userId || 'anonymous',
        status: 'pending',
        request: {
            headers: Object.fromEntries(request.headers),
            method: request.method,
            url: request.url,
        },
    };

    try {
        const body = await request.json();
        logData.body = body;
        const { queryId, params, api } = body;
        logData.queryType = queryId;

        // Kullanıcı yetki kontrolü (Örnek: Sadece VIP'ler bu sorguyu yapabilir)
        // Bu kısım daha sonra detaylı yetkilendirme için genişletilebilir.
        // const userRecord = await auth.getUser(userId!);
        // if(userRecord.customClaims?.role !== 'vip') {
        //   logData.status = 'denied';
        //   await logQueryToFirestore(logData);
        //   return NextResponse.json({ error: "Bu sorgu için yetkiniz yok." }, { status: 403 });
        // }

        let url: string;

        // ... (Harici API URL oluşturma mantığı aynı kaldı)
        if (api === "hanedan") {
          // ...
        } else {
          // ...
        }

        const response = await fetch(url, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const responseText = await response.text();

        if (!response.ok) {
            logData.status = 'failed';
            logData.error = `API Error: ${response.status} ${response.statusText}`;
            logData.response_body = responseText;
            await logQueryToFirestore(logData);
            return NextResponse.json({ error: "Harici API isteği başarısız oldu" }, { status: response.status });
        }

        try {
            const data = JSON.parse(responseText);
            logData.status = 'success';
            await logQueryToFirestore(logData);
            return NextResponse.json(data);
        } catch (e) {
            logData.status = 'success_raw_text';
            logData.response_body = responseText;
            await logQueryToFirestore(logData);
            return NextResponse.json({ result: responseText });
        }

    } catch (error: any) {
        logData.status = 'internal_error';
        logData.error = {
            message: error.message,
            stack: error.stack,
        };
        await logQueryToFirestore(logData);
        return NextResponse.json({ error: "Sorgu sırasında sunucu içi bir hata oluştu" }, { status: 500 });
    }
}
