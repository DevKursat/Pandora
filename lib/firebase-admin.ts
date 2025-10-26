import admin from 'firebase-admin';

// DİKKAT: Kimlik bilgilerini koda gömmek ciddi bir güvenlik açığıdır.
// Bu işlem, kullanıcının açık talebi ve riskleri anladığını belirtmesi üzerine yapılmıştır.
const serviceAccount = {
  "type": "service_account",
  "project_id": "pandora-7c682",
  "private_key_id": "3118a53c18c96949516c82176f660a55d52b2469",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmbrRcBqeOXiUP\nwO0NW50VuYsRLYwsYpGkVA9Pe2EHtscq60yVQcS4Ru2fMp2X6fBQ9JCJj+fDPHa+\nHhih7TyruNbviAilPa39r0TAYDhjqldLQihhcavGO8Matm3T6V1UvecIWvRC9jWU\n19n+7fwA70Ip6vPoCtAjLp60Q3BiGMC0PZvS1e7fkt7QhG6tQSHl8ibw8xCMQ4+e\nfzaWQlPxi/feIu7XUycJ0wwdRGkEZR4K3G/7vsa+ckGzjpaxT9hfwWNFjnoqzkiF\nwjHjRITXZrhvfWGoPjS9bbdrenp2L8Bq7YwY0XsDKlOaNOmXwYDich4nsCHh1Y/1\nL6YFwO/DAgMBAAECggEACV7Sl8XQzugHtScwZt/2wao0ernyRO4jHg8/h22Tt8qi\nKbfyvrU5Eq5STZ7HbFisV5qAEsaqjqhLqoY+Q8umw/0AWPRzQX5uBTTw2CtIBtB9\n4WEEWKwnjDMsLR0CpPuOw358+1BHpVzVr8oms2mJwTG3VhiCNVklK9NBoIuVexMA\nxCBwop8DBXfcgVzwMheQ+BKwAB+hmLoS4Ar9y6Iu3LNTS+Yj9GOnB05NVonjyr00\nPA1MauvYCrckE82BjzCwcb5qXIV0ZNFcY0tdDvUCLVDgOT1C4uaxjmd0jUkGPj6I\nlFQ+yLiWBn1uE4KmTTl8vgof6TobZdsRNMqFAAM+RQKBgQDXdK4GZvOQi7TJWdP5\nyPDORt4jgTXj5lTpdx5kfioPYXK1V4O+JsfXVB6ydyna3Y8HMilHTj0nGTk81kan\naAboxVDuDUqt8Cjaz/effuYJ4wA+jCsxlQHrZBK2qGQaPBvvQa5jOLNCd199fAyx\n8tbRzZW/Otl/1TK5u9YRYIJznQKBgQDFwGKJugfJ+716JyM90FBwI261/KzJFh6A\nomXcp4EfycB6HkRzl8Sl3vB+FZTQdVQJ4Lj0R96wCb3NoWCV7z9RSH0CInUn5Uef\n04a3jrKbCCt9LO8guChI8vkiXCJOp7aJWdkPNQ89qdBTClJp0IZow18zkrOBr65c\ncvoyp+MC3wKBgFpP5255kxkA5qwMAkXOy9m7bPv2+m7oKqmeK9g15k2CLIIFCA0Z\n1mTVNvTZ7Gp4uq5qgVEJY6rS8OImc4FSoqrJou3WFnqok4d86zApEiYMyBpvyN9E\ntYRE828rUKKKla8Jmh6vMrzmqtk/uVaSEyfohB+ffHIQHO4r5URtbuElAoGAUPaD\nYYAY0EmROgHsG9K+HCtlmHzrASldM61Jpx2tcCZZ96WMwQbSLFcqf3S2iOKAlcq7\n7se+FLToUNhRgxGBCvZyt/0DmmH1ASrJbT2vQmoF5CoRfYPoenWAKuEt6qYfxfxT\nMja3Frf/4v/G3ivR2/Khd6wIcoBLEu7AIR07hGECgYEAkudcD/d/mfPTrJv+xqDG\nsiaEH9vEexqFpUnTL8Ju7iv83Ro+ha0i3t3MqIJkV2FgIowXOFqPrL9aeg2jzaOP\nPn7k2DuccHkPUsvkUYBLkLUs5hiEcQ3BUmd1xHmhCyTwqaEI1ddm6FUYyvh/qpjd\ntF9KCK/c3xLbZvBW3KdhEMs=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@pandora-7c682.iam.gserviceaccount.com",
  "client_id": "101860857973742433920",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pandora-7c682.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK başlatılamadı:', error);
    throw new Error(`Firebase Admin SDK başlatma hatası: ${error.message}`);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
