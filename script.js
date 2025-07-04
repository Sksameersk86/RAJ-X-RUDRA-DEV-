const puppeteer = require("puppeteer");
const fs = require("fs");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // ✅ Desktop user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  // ✅ Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // ✅ Correct post URL
  const postUrl = "https://www.facebook.com/61550558518720/posts/122228523338018617";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  // ✅ Read comments from np.txt
  const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);
  const delayInMs = 30000;

  for (const line of lines) {
    try {
      await page.waitForSelector("div[aria-label='Write a comment']", {
        visible: true,
        timeout: 15000,
      });
      await page.type("div[aria-label='Write a comment']", line);
      await page.keyboard.press("Enter");
      console.log("✅ Commented:", line);
      await delay(delayInMs);
    } catch (err) {
      console.error("❌ Failed to comment:", line, err.message);
    }
  }

  await browser.close();
})();
