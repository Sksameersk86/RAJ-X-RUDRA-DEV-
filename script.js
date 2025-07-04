const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Use false to debug
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  const postUrl = "https://www.facebook.com/61550558518720/posts/122228523338018617/";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);

  const delayInMs = 15000; // Delay per comment

  for (const line of lines) {
    try {
      await page.waitForSelector("div[role='textbox']", { timeout: 10000 });
      await page.type("div[role='textbox']", line);
      await page.keyboard.press("Enter");
      console.log("✅ Commented:", line);
      await delay(delayInMs);
    } catch (err) {
      console.error("❌ Failed to comment:", line, err.message);
    }
  }

  await browser.close();
})();
