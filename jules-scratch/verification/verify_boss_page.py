
import re
from playwright.sync_api import sync_playwright, expect, TimeoutError

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to login page...")
            page.goto("http://localhost:3000/boss/login", timeout=60000)

            print("Filling login form...")
            # Using demo@example.com as it's a pre-configured Firebase account from memory
            page.get_by_label("E-posta").fill("demo@example.com")
            # The user said demo/demo. Let's try demo as password.
            page.get_by_label("Şifre").fill("demo")

            print("Submitting login form...")
            page.get_by_role("button", name="Giriş Yap").click()

            print("Waiting for navigation to admin panel...")
            # Expect navigation to the main admin page, handle potential redirects
            expect(page).to_have_url("http://localhost:3000/boss", timeout=60000)
            print("Successfully logged in.")

            # Wait for the page to settle and dashboard data to load
            page.wait_for_timeout(2000)

            print("Looking for 'Yeni Kullanıcı Ekle' accordion trigger...")
            # Correctly using a case-insensitive regex with re.compile()
            accordion_trigger = page.get_by_role("button", name=re.compile("Yeni Kullanıcı Ekle", re.IGNORECASE))

            expect(accordion_trigger).to_be_visible()
            print("Accordion trigger found. Clicking it...")
            accordion_trigger.click()

            print("Waiting for accordion content to become visible...")
            accordion_content = page.locator('[data-slot="accordion-content"]')
            expect(accordion_content).to_be_visible()
            print("Accordion content is visible.")

            print("Taking screenshot...")
            page.screenshot(path="jules-scratch/verification/verification.png")
            print("Screenshot saved to jules-scratch/verification/verification.png")

        except TimeoutError as e:
            print(f"A timeout error occurred: {e}")
            print("The page might have been slow to load, or the selector is incorrect.")
            page.screenshot(path="jules-scratch/verification/error.png")
            print("Error screenshot saved.")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            print("Error screenshot saved.")
        finally:
            print("Closing browser.")
            browser.close()

if __name__ == "__main__":
    run_verification()
