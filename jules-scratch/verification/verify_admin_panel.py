import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_password = os.environ.get("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        raise ValueError("ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set.")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Login
            page.goto("http://localhost:3000/auth/login")
            page.fill('input[name="email"]', admin_email)
            page.fill('input[name="password"]', admin_password)
            page.click('button[type="submit"]')
            page.wait_for_url("http://localhost:3000/dashboard", timeout=15000)

            # Navigate to the boss page
            page.goto("http://localhost:3000/boss")

            # Wait for the main heading to be visible
            heading = page.locator('h1:has-text("Pandora Yönetim Paneli")')
            expect(heading).to_be_visible(timeout=20000)

            # Take a screenshot
            screenshot_path = "jules-scratch/verification/admin_panel.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
