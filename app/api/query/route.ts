import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Helper function to write logs
async function writeToLog(logData: any) {
  const logFilePath = path.join(process.cwd(), "query_debug.log")
  const timestamp = new Date().toISOString()
  const logContent = `[${timestamp}] ${JSON.stringify(logData, null, 2)}\n\n`

  try {
    await fs.appendFile(logFilePath, logContent)
  } catch (error) {
    console.error("Failed to write to log file:", error)
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
  }

  try {
    const body = await request.json()
    logData.body = body
    const { queryId, params, api } = body

    let url: string

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

    logData.step = "url_created"
    logData.external_url = url

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    logData.step = "api_response_received"
    logData.response = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
    }

    const responseText = await response.text()
    logData.response_body = responseText

    if (!response.ok) {
      await writeToLog(logData)
      return NextResponse.json({ error: "API isteği başarısız oldu" }, { status: response.status })
    }

    try {
      const data = JSON.parse(responseText)
      logData.step = "success"
      await writeToLog(logData)
      return NextResponse.json(data)
    } catch (e) {
      logData.step = "json_parse_error"
      await writeToLog(logData)
      // Return the raw text if it's not JSON
      return NextResponse.json({ result: responseText })
    }
  } catch (error: any) {
    logData.step = "internal_error"
    logData.error = {
      message: error.message,
      stack: error.stack,
    }
    await writeToLog(logData)
    return NextResponse.json({ error: "Sorgu sırasında bir hata oluştu" }, { status: 500 })
  }
}
