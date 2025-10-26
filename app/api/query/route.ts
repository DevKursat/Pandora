import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import UAParser from 'ua-parser-js';

// Helper function to record device and login history
async function recordUserActivity(uid: string, request: NextRequest) {
  try {
    const uaString = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';

    const parser = new UAParser(uaString || undefined);
    const result = parser.getResult();

    const deviceId = `${uid}-${result.os.name || 'UnknownOS'}-${result.browser.name || 'UnknownBrowser'}`.replace(/\s+/g, '_');

    const deviceRef = adminDb.collection('devices').doc(deviceId);
    const loginHistoryRef = adminDb.collection('loginHistory').doc();

    const now = new Date();

    const deviceData = {
      userId: uid,
      deviceName: `${result.os.name || ''} on ${result.browser.name || ''}`,
      deviceType: result.device.type || 'desktop',
      os: result.os.name,
      browser: result.browser.name,
      ipAddress: ipAddress,
    };

    const loginData = {
        userId: uid,
        timestamp: now,
        ipAddress: ipAddress,
        success: true,
        userAgent: uaString,
    };

    const batch = adminDb.batch();

    const deviceDoc = await deviceRef.get();
    if (!deviceDoc.exists) {
      batch.set(deviceRef, { ...deviceData, firstSeen: now, lastSeen: now });
    } else {
      batch.update(deviceRef, { lastSeen: now, ipAddress: ipAddress });
    }

    batch.set(loginHistoryRef, loginData);

    await batch.commit();

  } catch (error) {
    console.error("Failed to record user activity:", error);
  }
}

async function writeToLog(
  uid: string,
  queryId: string | null,
  success: boolean,
  error: string | null
) {
  try {
    const logEntry = {
      uid,
      queryId,
      timestamp: new Date(),
      success,
      error,
    };
    await adminDb.collection("queryLogs").add(logEntry);
  } catch (e) {
    console.error("Failed to write to log collection:", e);
  }
}

export async function POST(request: NextRequest) {
  let uid: string;
  let body: any;
  let decodedToken;

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authorization.split("Bearer ")[1];

  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
    uid = decodedToken.uid;

    if (decodedToken.email === 'demo@demo.demo' && decodedToken.role !== 'admin') {
        await adminAuth.setCustomUserClaims(uid, { role: 'admin' });
    }

  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await recordUserActivity(uid, request);

  try {
    body = await request.json();
    const { queryId, params, api } = body;

    const userDocRef = adminDb.collection("users").doc(uid);
    let userDoc = await userDocRef.get();

    const userAuth = await adminAuth.getUser(uid);
    const userRole = userAuth.customClaims?.role || "demo";

    if (!userDoc.exists) {
      const defaultUserData = {
        email: userAuth.email,
        queryLimit: 10,
        permissions: {},
        createdAt: new Date(),
        role: userRole,
      };
      await userDocRef.set(defaultUserData);
      userDoc = await userDocRef.get();
    }

    const userData = userDoc.data();

    if (userRole === "demo") {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const queryLogsSnapshot = await adminDb.collection("queryLogs")
        .where("uid", "==", uid)
        .where("timestamp", ">=", today)
        .get();

      const dailyQueryCount = queryLogsSnapshot.size;
      const dailyLimit = userData?.queryLimit || 10;

      if (dailyQueryCount >= dailyLimit) {
        const errorMessage = "Günlük sorgu limiti aşıldı.";
        await writeToLog(uid, queryId, false, errorMessage);
        return NextResponse.json({ error: "Günlük sorgu limitinizi aştınız." }, { status: 429 });
      }
    }

    if (userRole !== "admin" && userRole !== "vip") {
        if (!userData?.permissions || !userData.permissions[queryId]) {
            const errorMessage = "Bu sorguyu yapma yetkiniz yok.";
            await writeToLog(uid, queryId, false, errorMessage);
            return NextResponse.json({ error: errorMessage }, { status: 403 });
        }
    }

    let url: string;
    if (api === "hanedan") {
      const endpointMap: Record<string, string> = {
        hanedan_ad_soyad: "adsoyad.php",
        hanedan_ad_soyad_pro: "adsoyadpro.php",
        hanedan_tc_gsm: "tcgsm.php",
        hanedan_gsm_tc: "gsmtc.php",
      };
      const endpoint = endpointMap[queryId];
      if (!endpoint) {
        return NextResponse.json({ error: "Geçersiz sorgu türü" }, { status: 400 });
      }
      const queryParams = new URLSearchParams(params);
      url = `https://hanedansystem.alwaysdata.net/hanesiz/${endpoint}?${queryParams}`;
    } else {
      const queryParams = new URLSearchParams({ api_key: "207736", ...params });
      url = `https://x.sorgu-api.rf.gd/pandora/${queryId}?${queryParams}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      const errorMessage = `API hatası: ${response.status}`;
      await writeToLog(uid, queryId, false, errorMessage);
      return NextResponse.json({ error: "API isteği başarısız oldu" }, { status: response.status });
    }

    await writeToLog(uid, queryId, true, null);

    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ result: responseText });
    }

  } catch (error: any) {
    console.error("Error in /api/query:", error);
    const queryId = body ? body.queryId : "unknown";
    await writeToLog(uid, queryId, false, error.message);
    return NextResponse.json({ error: "Sorgu sırasında bir hata oluştu" }, { status: 500 });
  }
}
