from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:3000/boss/login")
    page.get_by_label("E-posta").fill("admin@example.com")
    page.get_by_label("Şifre").fill("adminpassword")
    page.get_by_role("button", name="Giriş Yap").click()

    # Go to the boss page
    page.wait_for_url("http://localhost:3000/boss")

    # Wait for the welcome message to be visible
    expect(page.get_by_text("Hoş Geldiniz, Yönetici")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/boss_page.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
