import { type NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Function to write query logs to Firestore
async function writeToLog(logData: any) {
  try {
    await adminDb.collection("queryLogs").add({
      ...logData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to write to log file:", error);
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

  try {
    // 1. Authenticate the user
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    logData.uid = uid;

    // 2. Get user data and permissions from Firestore
    const userDocRef = adminDb.collection("users").doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userDoc.data();
    const userRole = userData?.role || "user";

    // 3. Check against disabled queries
    const settingsDoc = await adminDb.collection("settings").doc("disabledQueries").get();
    const disabledQueries = settingsDoc.exists ? settingsDoc.data()?.queries || [] : [];

    const body = await request.json();
    const { queryId, params, api } = body;
    logData.body = body;

    if (disabledQueries.includes(queryId)) {
        return NextResponse.json({ error: "Bu sorgu tipi geçici olarak devre dışı bırakılmıştır." }, { status: 403 });
    }

    // 4. Enforce query limits based on role
    const queryLimits: Record<string, number> = {
        user: 50,
        vip: 500,
        admin: Infinity
    };
    const queryLimit = queryLimits[userRole] || 50;
    const queryCount = userData?.queryCount || 0;

    if (queryCount >= queryLimit) {
        return NextResponse.json({ error: "Sorgu limitinizi aştınız. Daha fazla sorgu için lütfen yetkinizi yükseltin." }, { status: 429 });
    }

    // 5. Make the external API call
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
      }
      const endpoint = endpointMap[queryId]
      if (!endpoint) {
        return NextResponse.json({ error: "Geçersiz sorgu türü" }, { status: 400 })
      }
      const queryParams = new URLSearchParams(params)
      url = `https://hanedansystem.alwaysdata.net/hanesiz/${endpoint}?${queryParams}`
    } else {
      const queryParams = new URLSearchParams({
        api_key: "207736",
        ...params,
      })
      url = `https://x.sorgu-api.rf.gd/pandora/${queryId}?${queryParams}`
    }
    logData.external_url = url;

    const response = await fetch(url, { method: "GET", headers: { "User-Agent": "Mozilla/5.0" } });
    const responseText = await response.text();

    if (!response.ok) {
        logData.step = "api_error";
        logData.response_body = responseText;
        await writeToLog(logData);
        return NextResponse.json({ error: "API isteği başarısız oldu" }, { status: response.status });
    }

    // 6. Increment query count and log on success
    if (userRole !== 'admin') {
        await userDocRef.update({ queryCount: queryCount + 1 });
    }

    logData.step = "success";
    logData.response_body = responseText;
    await writeToLog(logData);

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ result: responseText });
    }

  } catch (error: any) {
    logData.step = "internal_error";
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: " oturumun süresi doldu, lütfen tekrar giriş yapın." }, { status: 401 });
    }
    logData.error = { message: error.message, stack: error.stack };
    await writeToLog(logData);
    return NextResponse.json({ error: "Sorgu sırasında bir hata oluştu" }, { status: 500 });
  }
}
