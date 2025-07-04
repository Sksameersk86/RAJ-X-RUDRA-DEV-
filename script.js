const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Mobile user-agent
  await page.setUserAgent(
    "Mozilla/5.0 (Linux; Android 10; SM-M305F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36"
  );

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // Use m.facebook.com
  const postUrl = "https://m.facebook.com/61550558518720/posts/122228523338018617";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  // Read comments from file
  const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);
  const delayInMs = 15000;

  for (const line of lines) {
    try {
      await page.waitForSelector('textarea[name="comment_text"]', { timeout: 10000 });
      await page.type('textarea[name="comment_text"]', line);
      await page.click('button[type="submit"]'); // Click the Post button
      console.log("✅ Commented:", line);
      await delay(delayInMs);
    } catch (err) {
      console.error("❌ Failed to comment:", line, err.message);
    }
  }

  await browser.close();
})();
