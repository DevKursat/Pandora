import * as admin from 'firebase-admin';

// DİKKAT: Bu bilgileri doğrudan koda eklemek güvenlik riski oluşturur.
// Bu, kullanıcının özel talebi üzerine yapılmıştır.
const serviceAccount = {
  "type": "service_account",
  "project_id": "pandora-31",
  "private_key_id": "a634a7b1edd7d44ac88d301af64d60239319f8e0",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCiO0S8oXtDK/av\nwNMnhTLAi3d/kFZtJ2RYnUu+0BI0f7KDmqcLiEvVM8eSz4iwlKbm+nFyAlLnH89H\n7YRmZXEFJhGhRaQDtGHyRlDX5q3a2Lpjc8ZxtXVSjV56tuRHqHkc13m9F/bIFxwv\naZ2N65FfMMpFBw86Zoe19rGwxzgTmsU5ahKZCxYmrAfxo/jnyCogg0x+nJLIPH1l\ngWHlRvzvjcE30LM8smJVnTxTdtega6cOZxbZ8Wppl61XOJ1nrBc8sqHSknUHjHP3\nqmtIbMLqc4iyWyjJ2sbVQX/vkrEvbduCGGbrMeqDZ5qg7lLv980XuH+PhLE9PU7Q\nspJHOQTFAgMBAAECggEACBlU3mTiYjFW7KG/+NxbswSTZ+UlB2h8yDa8Eg/RpNjO\nKOdG2RrKDF/8Id5l+MjHB0dv8+zdRigOoUzge/sq+AKVRTuUi1HNRPrRLOIZglAp\nB+9+8+zG6WLg2Vf5kAE/YJr6OyAv4//RWqWXZb8hoAKvyl/mmPgG5OTmrIhZipLu\nS+0p02MpCl6HET5/4S6DUyrt7m8TqY4DpGDXXLaKSiuPVTsPeOusSZYoPRgqJguZ\ntv4HQYl0soUHsyHeoteIUt1ZZtgr0+MQJDNEBgnJRIRwwRQSsaJW2+RiVRtlsXqK\nIyAMBwKJUBYFhFQ4HKIha3AIJgH7tPHqtIBbDyezgQKBgQDY8Gg36dg0PKItnD4m\n5+qd5UM2NySRx0H2qetcMTw1hztz+n0DMIDn/qeqpDvXU805y43absDNv8nzcTUC\n0BRJjCdkFCzGttMD66apoSYOJBG1u25fiN2+zyyx+vETpWoxS++iryV/x7jEihfV\nDm3fmqQaS3pSNH5SRv1JFB1UgQKBgQC/cSuAEm9QMvVCegzxdacqpSLGu9G+fBqS\ncFqsesEhS5P4FetFyqa2bnn0aSZJRDUgg7b27ngrNYhOHz7Lk6/j4VsKZkRzw3Xj\n1G2u99NKHzu3f7Y1RnaHGJY+iDlAW7u/hUVLcEC866kTwihcXUPkzEmdinOEOdrj\ni3vFS9o+RQKBgQCbh1egZnVLlgDLZE2mxPQOeVRDZStBnDItbkq/kMjSs34rOvUv\nOTHhoU+BZjdEu97RRZ8QcACoQYy+jHXt61HwHJwNAu3LFT2ZfPPCfzbyQmez+4k4\n0r3vU0Z+3yLA7AGDECbgYmMnBf/wX/SQGcUp3wsxktVCZEIAKMbkApi4gQKBgHjc\nmsj1Wn84XKzGXyuFyq7aqJTs+KMYuLHg6u3fZdR+YYGLXQinww6Dusy6Iai5vgyz\n+yv0K7ujxVUE1uExcSceHBr5q5emO+RFNaXz4dn20/2qTD9gJ+5scFY0LGjcQTDN\nk4zn5ocfBJRrzI1beESXUJZ8VSeSWwWzBsXteHA9AoGASnXW7SkfWRgqjN4wLbhg\nDsTxXEO5dXlv3ZX54mwlmlY47EIPJ0cUiSjJOFGV7XPSSYiEuth8saGyC+HuM/Cp\nZqwiPE7ZlBpz3FnOY1/ow2jrCUgcIzmoeaot6lD3YtxSunKRJ8kT3j9btIcKWrcg\nnnb+jOnoxVX0lNydrb3l308=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "pandora-server@pandora-31.iam.gserviceaccount.com",
  "client_id": "112934119394382650538",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/pandora-server%40pandora-31.iam.gserviceaccount.com"
};

let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any)
  });
  adminAuth = admin.auth();
  adminDb = admin.firestore();
} else {
  adminAuth = admin.auth();
  adminDb = admin.firestore();
}

export { adminAuth, adminDb };
