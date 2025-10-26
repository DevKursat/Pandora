import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Kullanıcı tarafından sağlanan ve soruna neden olabilecek servis hesabı bilgileri
const serviceAccount = {
  projectId: "pandora-43736",
  clientEmail: "firebase-adminsdk-fbsvc@pandora-43736.iam.gserviceaccount.com",
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1zSKfgxMolojW
9DNoZmFS+0YaOuknvZkHPPvs6D8txZ8x9BeSopg13U16Fol2PnbwMgnqvSCek18l
LNhpsGfp8lsfXSgR1X8FegmmZ9qfmASP1Ac3J2FIX+3s8ozWR3XSfUBKt1izOawd
7J+Mou1sSNRzhCVQKdDJZhytdBieDhVpK9FrzuPV8wzvbo6xCW4cYJEtI1apLH9a
aIxFKqVogbwk08czzwT7xPuGXTOChOjOeQ6S5E3202LMAspMYrsdoYOOcU8SD7kZ
IZ58NE8zA5qbHT19tBSZknfTBDpPBAL76KWrczD4KPZXmXX+eJuKy6eXX+0e5Go5
n8K5THLdAgMBAAECggEASW6/7u1LRkgzopuFzkQYSKPdJ4gnGBnBn4ZW/dS7fDoI
OO2uvdh2Ib+vZUKIKJ5HfXLAxbO54sOFGWd5TItoFbuCafM/VaDGS0iFcFUfnfoR
0aSje3gpF8pDuMMp9v1rTmewGd3f8pi3eGjU80H2I5hxU+2LAsu5HThlGfy8Ws6H
UVRT9Pu3/vrgh2Q5p+Qb//2NhcG7k2edTRbF/Xs7QsaZIpovQqXv40B8VVLXi6mo
CFlfBxJRqnotDm7Qig91kX+5K618SxJZto5tuK0ow1HJHiJmURMsJLWGAPyG9rVl
1D7+spU6DPwLiquIVM5T+mUJ2TLMRl6EwH0ZHJsa8wKBgQDu24t4/2pmhQ6B+9dp
DbvjpPqAl4CJTz2UqLKonWAbWGltmE2zpAcdfoqesWCNVy0vzTFWWgX8Wy2WqLcd
bYwVGszRGN/DUjfy6nGTpEQmFSMHKT8TqAfT6ZJfx8M0ps+uEOwV2p40ViahUqzW
93UhsBnFtHsIT8V2c87vdPxouwKBgQDC2VAzbf8GHyl4njMn0ocPE3NgYUQmqhjr
eICWiIm0Pe0Wx8r3r+8uiKGMi2trYW8obUPWhq0Y2OsbiK4yVBKOxcf/a5Y3l/43
suj2PSiSIwCWOxKyD/Qzf2mq8WdZDjkJQxRSzBbVeUyOGVL3j2JvebJgyLHO431U
BCeusKNFRwKBgQCvB4I0sDWv2mC/L2SyPrYoIoTOJjayZ7agcN46YNhEMY1QGgMW
WGQ+YLQDhcdSy0b5eEtnE6C/Q7EsbYWBsvyrmm/r6WZPIriM8O85WW322hZI8Rif
tsnFp6rzNNb+hh45V30opoK3p0m3fXXaMItMnFbGYXKmrI3uNv60ye0McQKBgFcd
e+sSkcO16P/Bk1OJn9LQunPr6OF0iWG15Z/n+dE5IqhduVRWN5TRh5DjwKoozN8B
QyRF4FxMl4ke6eschZOJv+pluqqubP2QIvH81AfKWHfSf4BW+7KOk7rW5YL+heer
Mwn1r3vQGLcrgVmnpLX8bhExibXbJeyLUwaaeNT/AoGBANxlxBY1ldQN5g1bhyH7
3tCm8/eWyg7kFTZuZCktMeuNrBTlQ9Fg1y9vR555WwRVrJCeF4wjw+q1/29pHZ4t
zbBY9pmUzA08E1ylnPTzc6JSgz81zT6SNPKi/1gKmYsvPcu3WD+Twpeq9KfFH13y
YvG+e5wlyEyNZ3S6u6GT/O3B
-----END PRIVATE KEY-----`.replace(/\\n/g, '\n'),
};

export async function GET() {
  try {
    // Firebase'in zaten başlatılıp başlatılmadığını kontrol et
    if (!admin.apps.length) {
      console.log('Firebase Admin SDK başlatılıyor...');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });
      console.log('Firebase Admin SDK başarıyla başlatıldı.');
    } else {
      console.log('Firebase Admin SDK zaten başlatılmış.');
    }

    // Firestore'a erişerek bağlantıyı doğrula
    const db = admin.firestore();
    console.log('Firestore örneği alındı. Koleksiyonlar listeleniyor...');
    const collections = await db.listCollections();
    const collectionIds = collections.map(col => col.id);
    console.log('Koleksiyonlar başarıyla listelendi:', collectionIds);

    return NextResponse.json({
      status: 'success',
      message: 'Firebase Admin SDK başarıyla başlatıldı ve Firestore bağlantısı doğrulandı.',
      collections: collectionIds,
    });
  } catch (error: any) {
    console.error('TEST API HATASI: Firebase işlemi başarısız oldu.', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Firebase Admin SDK başlatılamadı veya Firestore ile iletişim kurulamadı.',
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      },
      { status: 500 }
    );
  }
}
