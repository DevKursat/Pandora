from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000")

    # Check if we need to log in
    try:
        page.get_by_label("E-posta").fill("demo", timeout=5000)
        page.get_by_label("Şifre").fill("demo")
        page.get_by_role("button", name="Giriş Yap").click()
        page.wait_for_url("http://localhost:3000/")
    except:
        # Already logged in
        pass

    # Go to the profile page
    page.goto("http://localhost:3000/profile")

    # Wait for the email to be visible
    expect(page.get_by_text("demo@example.com")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/profile_page.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
