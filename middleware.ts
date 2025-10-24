import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Bakım modunun durumunu kontrol etmek için API'mize bir istek atıyoruz.
  // URL'yi dinamik olarak oluşturarak hem yerel hem de canlı ortamda çalışmasını sağlıyoruz.
  const statusUrl = new URL('/api/admin/maintenance/status', request.url);

  try {
    const response = await fetch(statusUrl);
    const { enabled } = await response.json();

    // Bakım modu aktifse ve kullanıcı admin değilse yönlendir.
    if (enabled) {
        // Hangi yolların yönlendirmeden muaf tutulacağını belirle
        const isExcluded = request.nextUrl.pathname.startsWith('/maintenance') ||
                             request.nextUrl.pathname.startsWith('/api') ||
                             request.nextUrl.pathname.startsWith('/_next') ||
                             request.nextUrl.pathname.startsWith('/boss/login') || // Login sayfası her zaman erişilebilir olmalı
                             request.nextUrl.pathname.endsWith('.png') ||
                             request.nextUrl.pathname.endsWith('.ico');

        // Kullanıcının admin olup olmadığını cookie'den kontrol edebiliriz (ideal çözüm)
        // Şimdilik, sadece /boss yoluna erişimi olanları admin varsayalım
        const isAdminPath = request.nextUrl.pathname.startsWith('/boss');

        if (!isExcluded && !isAdminPath) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
        }
    }
  } catch (error) {
    // API'ye ulaşılamazsa, bir sorun olduğunu varsayıp devam et.
    console.error("Could not fetch maintenance status:", error);
  }

  return NextResponse.next();
}

// Middleware'in hangi yollarda çalışacağını belirtir.
export const config = {
  matcher: '/:path*',
}
