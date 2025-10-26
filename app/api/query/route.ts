import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Helper function to write logs to Firestore
async function writeToLog(logData: any) {
  try {
    await adminDb.collection("queryLogs").add({
      ...logData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to write to log collection:", error);
  }
}

export async function POST(request: NextRequest) {
  const logData: any = {
    step: "start",
    request: {
      headers: Object.fromEntries(request.headers),
      method: request.method,
      url: request.url,
    },
  };

  // 1. Authenticate the user
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authorization.split("Bearer ")[1];

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const uid = decodedToken.uid;
  logData.uid = uid;

  try {
    const body = await request.json();
    logData.body = body;
    const { queryId, params, api } = body;

    // 2. Fetch user data from Firestore and Auth
    const userDocRef = adminDb.collection("users").doc(uid);
    const userDoc = await userDocRef.get();
    const userAuth = await adminAuth.getUser(uid);

    const userData = userDoc.data();
    const userRole = userAuth.customClaims?.role || "demo";

    // 3. Check permissions and query limits
    if (userRole === "demo") {
      const today = new Date().toISOString().split('T')[0];
      const queryLogsSnapshot = await adminDb.collection("queryLogs")
        .where("uid", "==", uid)
        .where("timestamp", ">=", `${today}T00:00:00.000Z`)
        .where("timestamp", "<=", `${today}T23:59:59.999Z`)
        .get();

      const dailyQueryCount = queryLogsSnapshot.size;
      const dailyLimit = userData?.queryLimit || 10;

      if (dailyQueryCount >= dailyLimit) {
        return NextResponse.json({ error: "Günlük sorgu limitinizi aştınız." }, { status: 429 });
      }
    }

    // 3.5. Check permissions ONLY for non-admin/non-vip users
    if (userRole !== "admin" && userRole !== "vip") {
      if (userData?.permissions && !userData.permissions[queryId]) {
        return NextResponse.json({ error: "Bu sorguyu yapma yetkiniz yok." }, { status: 403 });
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

    logData.step = "url_created";
    logData.external_url = url;

    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const responseText = await response.text();
    logData.response_body = responseText;

    if (!response.ok) {
      logData.step = "api_error";
      await writeToLog(logData);
      return NextResponse.json({ error: "API isteği başarısız oldu" }, { status: response.status });
    }

    // Increment query count for demo users
    if (userRole === "demo") {
        // This is a simplified way to track. A more robust way would be a transaction.
    }

    logData.step = "success";
    await writeToLog(logData);

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ result: responseText });
    }
  } catch (error: any) {
    console.error("Error in /api/query:", error);
    logData.step = "internal_error";
    logData.error = { message: error.message, stack: error.stack };
    await writeToLog(logData);
    return NextResponse.json({ error: "Sorgu sırasında bir hata oluştu" }, { status: 500 });
  }
}
