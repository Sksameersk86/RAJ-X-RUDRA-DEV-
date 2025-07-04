const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'] // 🔐 Render / CI ke liye zaruri
  });
  const page = await browser.newPage();

  // ⏺ Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // 📌 Target post
  const postUrl = "https://www.facebook.com/61550558518720/posts/122228523338018617";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  // 📸 Screenshot le — sab kuch visible hoga
  await page.screenshot({ path: 'post-opened.png', fullPage: true });
  console.log("📸 Screenshot saved: post-opened.png");

  // 📝 Read comments from file
  const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);
  const delayInMs = 30000;

  for (const line of lines) {
    try {
      await page.waitForSelector("textarea[name='comment_text']", { timeout: 15000 });
      await page.type("textarea[name='comment_text']", line);
      await page.keyboard.press("Enter");
      console.log("✅ Commented:", line);
      await delay(delayInMs);
    } catch (err) {
      console.error("❌ Failed to comment:", line, err.message);
    }
  }

  await browser.close();
})();
