const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // local testing ke liye false rakh sakta hai
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // Facebook Post URL
  const postUrl = "https://www.facebook.com/61550558518720/posts/122228523338018617/?substory_index=1815342132376864&app=fbl";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  // Take screenshot to confirm post opened
  await page.screenshot({ path: "post-opened.png" });
  console.log("📸 Screenshot saved: post-opened.png");

  // Read lines from np.txt
  const lines = fs.readFileSync("np.txt", "utf8").split("\n").filter(Boolean);

  const delayInMs = 30000; // 30 sec delay between comments

  for (const line of lines) {
    try {
      await page.waitForSelector('div[contenteditable="true"]', { timeout: 15000 });
      await page.type('div[contenteditable="true"]', line);
      await page.keyboard.press("Enter");
      console.log("✅ Commented:", line);
      await delay(delayInMs);
    } catch (err) {
      console.error("❌ Failed to comment:", line, err.message);
    }
  }

  await browser.close();
})();
