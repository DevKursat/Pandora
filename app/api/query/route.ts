import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queryId, params, api } = body

    let url: string

    if (api === "hanedan") {
      // Hanedan API endpoint mapping
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
      // Pandora API
      const queryParams = new URLSearchParams({
        api_key: "207736",
        ...params,
      })
      url = `https://x.sorgu-api.rf.gd/pandora/${queryId}?${queryParams}`
    }

    console.log("[v0] Making request to:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    if (!response.ok) {
      console.log("[v0] API response not OK:", response.status, response.statusText)
      return NextResponse.json({ error: "API isteği başarısız oldu" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] API response received successfully")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Query error:", error)
    return NextResponse.json({ error: "Sorgu sırasında bir hata oluştu" }, { status: 500 })
  }
}
