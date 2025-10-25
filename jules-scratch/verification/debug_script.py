from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000")

    # Keep the browser open for a long time
    time.sleep(300)


    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
