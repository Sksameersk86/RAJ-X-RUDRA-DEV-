const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"] // 💥 Important for CI like Replit/GitHub
  });

  const page = await browser.newPage();

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // ✅ M.facebook URL
  const postUrl = "https://m.facebook.com/61550558518720/posts/122228523338018617";
  await page.goto(postUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // Load np.txt messages
  const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);
  const delayInMs = 30000; // 30 sec

  for (const line of lines) {
    try {
      // ✅ Mobile selector for comment box
      await page.waitForSelector('textarea[name="comment_text"]', { timeout: 15000 });
      await page.type('textarea[name="comment_text"]', line);
      await delay(1000);
      await page.keyboard.press("Enter");
      console.log("✅ Commented:", line);
      await delay(delayInMs);
    } catch (err) {
      await page.screenshot({ path: "error.png", fullPage: true });
      console.error("❌ Failed to comment:", line, err.message);
    }
  }

  await browser.close();
})();
