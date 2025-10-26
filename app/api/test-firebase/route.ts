import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Kullanıcı tarafından sağlanan YENİ servis hesabı bilgileri
const serviceAccount = {
  projectId: "pandora-7c682",
  clientEmail: "firebase-adminsdk-fbsvc@pandora-7c682.iam.gserviceaccount.com",
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmbrRcBqeOXiUP
wO0NW50VuYsRLYwsYpGkVA9Pe2EHtscq60yVQcS4Ru2fMp2X6fBQ9JCJj+fDPHa+
Hhih7TyruNbviAilPa39r0TAYDhjqldLQihhcavGO8Matm3T6V1UvecIWvRC9jWU
19n+7fwA70Ip6vPoCtAjLp60Q3BiGMC0PZvS1e7fkt7QhG6tQSHl8ibw8xCMQ4+e
fzaWQlPxi/feIu7XUycJ0wwdRGkEZR4K3G/7vsa+ckGzjpaxT9hfwWNFjnoqzkiF
wjHjRITXZrhvfWGoPjS9bbdrenp2L8Bq7YwY0XsDKlOaNOmXwYDich4nsCHh1Y/1
L6YFwO/DAgMBAAECggEACV7Sl8XQzugHtScwZt/2wao0ernyRO4jHg8/h22Tt8qi
KbfyvrU5Eq5STZ7HbFisV5qAEsaqjqhLqoY+Q8umw/0AWPRzQX5uBTTw2CtIBtB9
4WEEWKwnjDMsLR0CpPuOw358+1BHpVzVr8oms2mJwTG3VhiCNVklK9NBoIuVexMA
xCBwop8DBXfcgVzwMheQ+BKwAB+hmLoS4Ar9y6Iu3LNTS+Yj9GOnB05NVonjyr00
PA1MauvYCrckE82BjzCwcb5qXIV0ZNFcY0tdDvUCLVDgOT1C4uaxjmd0jUkGPj6I
lFQ+yLiWBn1uE4KmTTl8vgof6TobZdsRNMqFAAM+RQKBgQDXdK4GZvOQi7TJWdP5
yPDORt4jgTXj5lTpdx5kfioPYXK1V4O+JsfXVB6ydyna3Y8HMilHTj0nGTk81kan
aAboxVDuDUqt8Cjaz/effuYJ4wA+jCsxlQHrZBK2qGQaPBvvQa5jOLNCd199fAyx
8tbRzZW/Otl/1TK5u9YRYIJznQKBgQDFwGKJugfJ+716JyM90FBwI261/KzJFh6A
omXcp4EfycB6HkRzl8Sl3vB+FZTQdVQJ4Lj0R96wCb3NoWCV7z9RSH0CInUn5Uef
04a3jrKbCCt9LO8guChI8vkiXCJOp7aJWdkPNQ89qdBTClJp0IZow18zkrOBr65c
cvoyp+MC3wKBgFpP5255kxkA5qwMAkXOy9m7bPv2+m7oKqmeK9g15k2CLIIFCA0Z
1mTVNvTZ7Gp4uq5qgVEJY6rS8OImc4FSoqrJou3WFnqok4d86zApEiYMyBpvyN9E
tYRE828rUKKKla8Jmh6vMrzmqtk/uVaSEyfohB+ffHIQHO4r5URtbuElAoGAUPaD
YYAY0EmROgHsG9K+HCtlmHzrASldM61Jpx2tcCZZ96WMwQbSLFcqf3S2iOKAlcq7
7se+FLToUNhRgxGBCvZyt/0DmmH1ASrJbT2vQmoF5CoRfYPoenWAKuEt6qYfxfxT
Mja3Frf/4v/G3ivR2/Khd6wIcoBLEu7AIR07hGECgYEAkudcD/d/mfPTrJv+xqDG
siaEH9vEexqFpUnTL8Ju7iv83Ro+ha0i3t3MqIJkV2FgIowXOFqPrL9aeg2jzaOP
Pn7k2DuccHkPUsvkUYBLkLUs5hiEcQ3BUmd1xHmhCyTwqaEI1ddm6FUYyvh/qpjd
tF9KCK/c3xLbZvBW3KdhEMs=
-----END PRIVATE KEY-----`.replace(/\\n/g, '\n'),
};

export async function GET() {
  try {
    // Firebase'in zaten başlatılıp başlatılmadığını kontrol et
    if (admin.apps.length > 0) {
        // Mevcut app'i silerek yeniden başlatmayı garantile
        await admin.app().delete();
    }

    console.log('Firebase Admin SDK (Yeni Proje) başlatılıyor...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log('Firebase Admin SDK (Yeni Proje) başarıyla başlatıldı.');

    // Firestore'a erişerek bağlantıyı doğrula
    const db = admin.firestore();
    console.log('Firestore örneği alındı. Koleksiyonlar listeleniyor...');
    const collections = await db.listCollections();
    const collectionIds = collections.map(col => col.id);
    console.log('Koleksiyonlar başarıyla listelendi:', collectionIds);

    return NextResponse.json({
      status: 'success',
      message: 'YENİ PROJE: Firebase Admin SDK başarıyla başlatıldı ve Firestore bağlantısı doğrulandı.',
      collections: collectionIds,
    });
  } catch (error: any) {
    console.error('YENİ PROJE TEST API HATASI: Firebase işlemi başarısız oldu.', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'YENİ PROJE: Firebase Admin SDK başlatılamadı veya Firestore ile iletişim kurulamadı.',
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      },
      { status: 500 }
    );
  }
}
