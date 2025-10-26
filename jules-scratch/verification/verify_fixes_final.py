from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    BASE_URL = "http://localhost:3002"

    try:
        # --- Senaryo 1: Cihaz Kaydını Doğrulama ---
        print("Senaryo 1: Cihaz Kaydını Doğrulama Başlatılıyor...")

        page.goto(f"{BASE_URL}/boss/login")
        page.get_by_label("E-posta").fill("demo@demo.demo")
        page.get_by_label("Şifre").fill("demodemo")
        page.get_by_role("button", name="Giriş Yap").click()
        expect(page).to_have_url(f"{BASE_URL}/boss", timeout=15000)

        page.goto(f"{BASE_URL}/")
        page.wait_for_load_state('networkidle', timeout=15000)

        expect(page.get_by_placeholder("Ad Soyad")).to_be_visible(timeout=10000)
        page.get_by_placeholder("Ad Soyad").fill("test")
        page.get_by_role("button", name="Sorgula").click()
        time.sleep(3)

        page.goto(f"{BASE_URL}/boss")
        page.wait_for_load_state('networkidle', timeout=15000)
        expect(page.get_by_text("Hoş Geldiniz, Yönetici")).to_be_visible(timeout=10000)

        page.get_by_role("tab", name="Cihazlar & IP").click()
        page.wait_for_timeout(3000)

        expect(page.locator('text="IP Adresine Göre Gruplandırılmış Cihazlar"')).to_be_visible()

        page.screenshot(path="jules-scratch/verification/cihaz_kaydi_dogrulama.png")
        print("Ekran görüntüsü 'cihaz_kaydi_dogrulama.png' başarıyla alındı.")

        # --- Senaryo 2: Bakım Modunu Doğrulama ---
        print("\nSenaryo 2: Bakım Modunu Doğrulama Başlatılıyor...")

        page.get_by_role("tab", name="Sistem").click()

        maintenance_switch = page.get_by_role('switch')
        if not maintenance_switch.is_checked():
            maintenance_switch.click()
            time.sleep(2)

        page.get_by_role("button", name="Çıkış").click()
        expect(page).to_have_url(f"{BASE_URL}/boss/login", timeout=10000)

        page.goto(f"{BASE_URL}/login")
        page.get_by_label("E-posta").fill("demo@example.com")
        page.get_by_label("Şifre").fill("demo")
        page.get_by_role("button", name="Giriş Yap").click()

        expect(page.get_by_text("Sistem Şu Anda Bakımda")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/bakim_modu_dogrulama.png")
        print("Ekran görüntüsü 'bakim_modu_dogrulama.png' başarıyla alındı.")

        print("\nTemizlik: Bakım modu kapatılıyor...")
        page.goto(f"{BASE_URL}/boss/login")
        page.get_by_label("E-posta").fill("demo@demo.demo")
        page.get_by_label("Şifre").fill("demodemo")
        page.get_by_role("button", name="Giriş Yap").click()
        expect(page).to_have_url(f"{BASE_URL}/boss", timeout=15000)
        page.get_by_role("tab", name="Sistem").click()
        page.wait_for_timeout(1000)

        maintenance_switch_after = page.get_by_role('switch')
        if maintenance_switch_after.is_checked():
            maintenance_switch_after.click()
            print("Bakım modu kapatıldı.")

    except Exception as e:
        print(f"Bir hata oluştu: {e}")
        page.screenshot(path="jules-scratch/verification/hata.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
