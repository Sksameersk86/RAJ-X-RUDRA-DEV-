const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: "new", // Use "new" for Puppeteer 20+ compatibility
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for GitHub Actions / Render
  });

  const page = await browser.newPage();

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // Facebook Post URL
  const postUrl = "https://www.facebook.com/61550558518720/posts/122228523338018617/";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  // Read lines from np.txt
  const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);

  // Delay between each comment (in milliseconds)
  const delayInMs = 30000;

  for (const line of lines) {
    try {
      await page.waitForSelector("div[aria-label='Write a comment']", { timeout: 10000 });
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
