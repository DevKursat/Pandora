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
    return NextResponse.json({ error: "Unauthorized", message: "Kimlik doğrulama başlığı eksik." }, { status: 401 });
  }
  const idToken = authorization.split("Bearer ")[1];

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token", message: "Geçersiz veya süresi dolmuş kimlik doğrulama anahtarı." }, { status: 401 });
  }

  const uid = decodedToken.uid;
  logData.uid = uid;

  try {
    const body = await request.json();
    logData.body = body;
    const { queryId, params, api } = body;

    // 2. Fetch user data from Firestore and Auth
    let userDoc, userAuth, userData, userRole;
    try {
      logData.step = "fetch_user_data_start";
      const userDocRef = adminDb.collection("users").doc(uid);
      userDoc = await userDocRef.get();
      userAuth = await adminAuth.getUser(uid);
      userData = userDoc.data();
      userRole = userAuth.customClaims?.role || "demo";
      logData.step = "fetch_user_data_success";
    } catch (dbError: any) {
      console.error("Firestore/Auth Error:", dbError);
      logData.step = "fetch_user_data_error";
      logData.error = { message: dbError.message, code: dbError.code };
      await writeToLog(logData);
      // Check for specific Firestore index error
      if (dbError.code === 'failed-precondition') {
          return NextResponse.json({ error: "Veritabanı hatası", message: "Gerekli veritabanı indeksi eksik. Lütfen yöneticiyle iletişime geçin." }, { status: 500 });
      }
      return NextResponse.json({ error: "Kullanıcı verileri alınamadı", message: "Kullanıcı bilgileriniz getirilirken bir sorun oluştu." }, { status: 500 });
    }

    // 3. Check permissions and query limits
    if (userRole === "demo") {
      try {
        logData.step = "check_query_limit_start";
        const today = new Date().toISOString().split('T')[0];
        const queryLogsSnapshot = await adminDb.collection("queryLogs")
          .where("uid", "==", uid)
          .where("timestamp", ">=", `${today}T00:00:00.000Z`)
          .where("timestamp", "<=", `${today}T23:59:59.999Z`)
          .get();

        const dailyQueryCount = queryLogsSnapshot.size;
        const dailyLimit = userData?.queryLimit || 10;

        if (dailyQueryCount >= dailyLimit) {
          return NextResponse.json({ error: "Limit aşıldı", message: "Günlük sorgu limitinizi aştınız." }, { status: 429 });
        }
        logData.step = "check_query_limit_success";
      } catch (limitError: any) {
         console.error("Query Limit Check Error:", limitError);
         logData.step = "check_query_limit_error";
         logData.error = { message: limitError.message };
         await writeToLog(logData);
         return NextResponse.json({ error: "Sorgu limiti kontrol edilemedi", message: "Limitleriniz kontrol edilirken bir hata oluştu." }, { status: 500 });
      }
    }

    if (userRole !== "admin" && userRole !== "vip") {
      if (!userData?.permissions || !userData.permissions[queryId]) {
        return NextResponse.json({ error: "Yetki reddedildi", message: "Bu sorguyu yapma yetkiniz yok." }, { status: 403 });
      }
    }

    // 4. Construct the external API URL
    let url: string;
    const endpointMap: Record<string, string> = {
      hanedan_ad_soyad: "adsoyad.php", hanedan_ad_soyad_pro: "adsoyadpro.php", hanedan_ad_il_ilce: "adililce.php",
      hanedan_tcpro: "tcpro.php", hanedan_tc: "tc.php", hanedan_tc_gsm: "tcgsm.php", hanedan_gsm_tc: "gsmtc.php",
      hanedan_adres: "adres.php", hanedan_hane: "hane.php", hanedan_aile: "aile.php", hanedan_sulale: "sulale.php",
      hanedan_ogretmen: "ogretmen.php", hanedan_okulno: "okulno.php", hanedan_lgs: "lgs.php", hanedan_uni: "uni.php",
      hanedan_sertifika: "sertifika.php", hanedan_vesika: "vesika.php", hanedan_tapu: "tapu.php", hanedan_is_kaydi: "iskaydi.php",
      hanedan_secmen: "secmen.php", hanedan_facebook: "facebook.php", hanedan_instagram: "insta.php", hanedan_log: "log.php",
      hanedan_internet_ariza: "İnternetAriza.php", hanedan_plaka: "plaka.php", hanedan_isim_plaka: "plakaismi.php",
      hanedan_plaka_borc: "plakaborc.php", hanedan_plaka_parca: "PlakaParca.php", hanedan_papara: "papara.php",
      hanedan_ininal: "ininal.php", hanedan_firma: "firma.php", hanedan_operator: "operator.php", hanedan_yabanci: "yabanci.php",
      hanedan_craftrise: "craftrise.php", hanedan_akp: "akp.php", hanedan_smsbomber: "smsbomber.php", hanedan_aifoto: "AiFoto.php",
    };

    if (api === "hanedan") {
      const endpoint = endpointMap[queryId];
      if (!endpoint) {
        return NextResponse.json({ error: "Geçersiz sorgu", message: `Sorgu türü '${queryId}' bulunamadı.` }, { status: 400 });
      }
      const queryParams = new URLSearchParams(params);
      url = `https://hanedansystem.alwaysdata.net/hanesiz/${endpoint}?${queryParams}`;
    } else {
      const queryParams = new URLSearchParams({ api_key: "207736", ...params });
      url = `https://x.sorgu-api.rf.gd/pandora/${queryId}?${queryParams}`;
    }

    logData.step = "url_created";
    logData.external_url = url;

    // 5. Call the external API
    let responseText;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      responseText = await response.text();
      logData.response_body = responseText;

      if (!response.ok) {
        logData.step = "api_error";
        await writeToLog(logData);
        return NextResponse.json({ error: "Harici API hatası", message: `Sorgu API'si ${response.status} durum kodu ile başarısız oldu.` }, { status: 502 }); // Bad Gateway
      }
    } catch (fetchError: any) {
        console.error("External API Fetch Error:", fetchError);
        logData.step = "api_fetch_error";
        logData.error = { message: fetchError.message, name: fetchError.name };
        await writeToLog(logData);
        if (fetchError.name === 'TimeoutError') {
             return NextResponse.json({ error: "Harici API zaman aşımı", message: "Sorgu API'si zamanında yanıt vermedi. Lütfen tekrar deneyin." }, { status: 504 }); // Gateway Timeout
        }
        return NextResponse.json({ error: "Harici API'ye ulaşılamadı", message: "Sorgu API'sine bağlanırken bir ağ hatası oluştu." }, { status: 503 }); // Service Unavailable
    }

    logData.step = "success";
    await writeToLog(logData);

    // 6. Parse and return the result
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      // If parsing fails, return the raw text. It might be a non-JSON success response.
      return NextResponse.json({ result: responseText });
    }

  } catch (error: any) {
    console.error("Unhandled Error in /api/query:", error);
    logData.step = "unhandled_internal_error";
    logData.error = { message: error.message, stack: error.stack };
    await writeToLog(logData);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu", message: "Sorgunuz işlenirken sunucuda beklenmedik bir sorun meydana geldi." }, { status: 500 });
  }
}
