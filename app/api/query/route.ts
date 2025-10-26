import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Helper function to write simplified logs to Firestore
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

  // 1. Authenticate the user
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authorization.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    uid = decodedToken.uid;

    // Make demo@demo.demo an admin automatically
    if (decodedToken.email === 'demo@demo.demo' && !decodedToken.admin) {
        await adminAuth.setCustomUserClaims(uid, { role: 'admin' });
    }

  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    body = await request.json();
    const { queryId, params, api } = body;

    // 2. Fetch user data from Firestore and Auth, create if it doesn't exist
    const userDocRef = adminDb.collection("users").doc(uid);
    let userDoc = await userDocRef.get();
    const userAuth = await adminAuth.getUser(uid);

    if (!userDoc.exists) {
      // Create a default user document if it doesn't exist
      const defaultUserData = {
        email: userAuth.email,
        queryLimit: 10, // Default query limit
        permissions: {}, // No permissions by default
        createdAt: new Date(),
      };
      await userDocRef.set(defaultUserData);
      userDoc = await userDocRef.get(); // Re-fetch the document
      await writeToLog(uid, queryId, true, "User document created automatically.");
    }

    const userData = userDoc.data();
    const userRole = userAuth.customClaims?.role || "demo";

    // 3. Check permissions and query limits
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

    // 3.5. Check permissions ONLY for non-admin/non-vip users
    if (userRole !== "admin" && userRole !== "vip") {
        if (!userData?.permissions || !userData.permissions[queryId]) {
            const errorMessage = "Bu sorguyu yapma yetkisi yok.";
            await writeToLog(uid, queryId, false, errorMessage);
            return NextResponse.json({ error: errorMessage }, { status: 403 });
        }
    }

    // 4. Proceed with the external API call
    let url: string;
    if (api === "hanedan") {
      const endpointMap: Record<string, string> = {
        hanedan_ad_soyad: "adsoyad.php",
        hanedan_ad_soyad_pro: "adsoyadpro.php",
        hanedan_ad_il_ilce: "adililce.php",
        hanedan_tcpro: "tcpro.php",
        hanedan_tc: "tc.php",
        hanedan_tc_gsm: "tcgsm.php",
        hanedan_gsm_tc: "gsmtc.php",
        hanedan_adres: "adres.php",
        hanedan_hane: "hane.php",
        hanedan_aile: "aile.php",
        hanedan_sulale: "sulale.php",
        hanedan_ogretmen: "ogretmen.php",
        hanedan_okulno: "okulno.php",
        hanedan_lgs: "lgs.php",
        hanedan_uni: "uni.php",
        hanedan_sertifika: "sertifika.php",
        hanedan_vesika: "vesika.php",
        hanedan_tapu: "tapu.php",
        hanedan_is_kaydi: "iskaydi.php",
        hanedan_secmen: "secmen.php",
        hanedan_facebook: "facebook.php",
        hanedan_instagram: "insta.php",
        hanedan_log: "log.php",
        hanedan_internet_ariza: "İnternetAriza.php",
        hanedan_plaka: "plaka.php",
        hanedan_isim_plaka: "plakaismi.php",
        hanedan_plaka_borc: "plakaborc.php",
        hanedan_plaka_parca: "PlakaParca.php",
        hanedan_papara: "papara.php",
        hanedan_ininal: "ininal.php",
        hanedan_firma: "firma.php",
        hanedan_operator: "operator.php",
        hanedan_yabanci: "yabanci.php",
        hanedan_craftrise: "craftrise.php",
        hanedan_akp: "akp.php",
        hanedan_smsbomber: "smsbomber.php",
        hanedan_aifoto: "AiFoto.php",
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
