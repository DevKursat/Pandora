from playwright.sync_api import sync_playwright, Page, expect

def verify_boss_panel(page: Page):
    """
    Verifies that the boss panel correctly displays at least one user.
    """
    # Go to the login page
    page.goto("http://localhost:3000/boss/login")

    # Fill in the login form and submit
    page.get_by_label("E-posta").fill("demo@demo.demo")
    page.get_by_label("Şifre").fill("demodemo")
    page.get_by_role("button", name="Giriş Yap").click()

    # Explicitly wait for the URL to change to the boss page
    page.wait_for_url("http://localhost:3000/boss")

    # Wait for the "Toplam Kullanıcı" card to be visible and contain text other than "0"
    total_users_card = page.locator("div:has-text('Toplam Kullanıcı') >> p >> nth=0")
    expect(total_users_card).not_to_have_text("0", timeout=10000) # 10s timeout for data to load

    # Take a screenshot of the entire boss page
    page.screenshot(path="jules-scratch/verification/boss_panel_final.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_boss_panel(page)
        browser.close()

if __name__ == "__main__":
    main()
