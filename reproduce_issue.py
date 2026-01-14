from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # iPhone SE viewport size
    context = browser.new_context(viewport={"width": 375, "height": 667})
    page = context.new_page()

    # Mock API responses
    page.route("**/api/v1/admin/blogs*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{
            "data": [
                {
                    "id": "1",
                    "name": "Very Long Blog Name That Might Cause Issues on Mobile",
                    "url": "https://example.com/very/long/url/that/might/overflow/on/mobile"
                },
                {
                    "id": "2",
                    "name": "Short Name",
                    "url": "https://short.com"
                },
                {
                    "id": "3",
                    "name": "Another Blog",
                    "url": "https://another-blog.com"
                }
            ],
            "total": 3
        }'''
    ))

    page.route("**/api/v1/admin/posts*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"data": [], "total": 0}'
    ))

    # Go to Admin page
    page.goto("http://localhost:5173/admin")

    # Inject auth token (though we are mocking APIs, the app might check token existence)
    page.evaluate("localStorage.setItem('TECHLETTER_ACCESS_TOKEN', 'fake-token')")

    # Reload to apply token
    page.reload()

    # Click on "Blogs" tab if not already selected (default is posts)
    # The tabs might be buttons with text "Blogs" or "블로그"
    # Looking at BlogsTab.jsx, the header says "블로그 관리"
    # Looking at Admin/index.jsx, it uses AdminTabs.
    # I should find the button for Blogs tab.

    # Wait for page load
    page.wait_for_timeout(2000)

    # Try to find tab button.
    # Since I don't see AdminTabs.jsx content, I assume it has text "Blogs" or "블로그".
    # I'll try to click by text.
    try:
        page.get_by_text("블로그", exact=True).click()
    except:
        # Maybe it's "Blogs" or has icon
        pass

    # Wait for table to appear
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path="verification/issue_repro.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
