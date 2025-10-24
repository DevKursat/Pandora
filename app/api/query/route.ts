import { type NextRequest, NextResponse } from "next/server";
import { getFirestore, getFirebaseAuth } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

async function logQuery(logData: any) {
    const db = getFirestore();
    try {
        await db.collection('queryLogs').add({
            ...logData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to write query log to Firestore:", error);
    }
}

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    const auth = getFirebaseAuth();
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
    let logData: any;

    try {
        const body = await request.json();
        const { queryId, params, api } = body;

        logData = {
            userId: userId || 'anonymous',
            queryType: queryId,
            params: params,
            status: 'pending',
        };

        let url: string;
        // ... (Harici API URL oluşturma mantığı aynı kaldı)
        if (api === "hanedan") {
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
            const endpoint = endpointMap[queryId];
            if (!endpoint) {
                return NextResponse.json({ error: "Geçersiz sorgu türü" }, { status: 400 });
            }
            const queryParams = new URLSearchParams(params as Record<string, string>);
            url = `https://hanedansystem.alwaysdata.net/hanesiz/${endpoint}?${queryParams.toString()}`;
        } else {
            const queryParams = new URLSearchParams({ api_key: "207736", ...(params as Record<string, string>) });
            url = `https://x.sorgu-api.rf.gd/pandora/${queryId}?${queryParams.toString()}`;
        }

        const response = await fetch(url, { method: "GET", headers: { "User-Agent": "Mozilla/5.0" } });

        if (!response.ok) {
            logData.status = 'failed';
            await logQuery(logData);
            return NextResponse.json({ error: "Harici API isteği başarısız oldu" }, { status: response.status });
        }

        logData.status = 'success';
        await logQuery(logData);

        const responseText = await response.text();
        try {
            return NextResponse.json(JSON.parse(responseText));
        } catch (e) {
            return NextResponse.json({ result: responseText });
        }

    } catch (error: any) {
        if (logData) {
            logData.status = 'internal_error';
            await logQuery(logData);
        }
        return NextResponse.json({ error: "Sorgu sırasında sunucu içi bir hata oluştu" }, { status: 500 });
    }
}
