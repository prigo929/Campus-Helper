from playwright.sync_api import sync_playwright

def verify_chat_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the AI Assistant page directly
        try:
            page.goto("http://localhost:3000/ai-assistant", timeout=60000)

            # Wait for the chat panel to be visible.
            page.wait_for_selector("text=Campus Helper AI", timeout=30000)

            # Take a screenshot of the initial state
            page.screenshot(path="verification/chat_initial.png")
            print("Initial screenshot taken.")

            # Type a message
            page.fill("textarea", "Hello")

            # Click send
            page.click("button[type='submit']")

            # Wait for user message "Hello" to appear
            page.wait_for_selector("text=Hello", timeout=10000)

            # Wait for AI response (might be immediate or take time)
            # We look for "Campus Helper AI" label in message list
            # We already have one in header, but there are multiple "Campus Helper AI" texts now?
            # The header says "Campus Helper AI", the message says "Campus Helper AI"

            # Take a screenshot after interaction
            page.screenshot(path="verification/chat_interaction.png")
            print("Interaction screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_chat_ui()
