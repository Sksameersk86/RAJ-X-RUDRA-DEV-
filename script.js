const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // false karo agar local me dekhna ho
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // Facebook Post URL
  const postUrl = "https://www.facebook.com/rudra.461718/videos/1361526665145629/";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  // Screenshot only once to confirm login/post open
  await page.screenshot({ path: "post-opened.png" });
  console.log("📸 Screenshot saved: post-opened.png");

  // Read names/comments once
  const comments = fs.readFileSync("np.txt", "utf8").split("\n").map(c => c.trim()).filter(Boolean);
  const names = fs.existsSync("names.txt")
    ? fs.readFileSync("names.txt", "utf8").split("\n").map(n => n.trim()).filter(Boolean)
    : [];

  const delayInMs = 5000; // 5 second delay between comments

  let cycle = 1;

  // Infinite loop
  while (true) {
    console.log(`🔁 Starting comment cycle ${cycle}...`);
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const name = names.length ? names[i % names.length] : "";
      const finalComment = name ? `${name} ${comment}` : comment;

      try {
        await page.waitForSelector('div[contenteditable="true"]', { timeout: 15000 });
        await page.type('div[contenteditable="true"]', finalComment);
        await page.keyboard.press("Enter");
        console.log("✅ Commented:", finalComment);
        await delay(delayInMs);
      } catch (err) {
        console.error("❌ Failed to comment:", finalComment, err.message);
      }
    }
    cycle++;
  }

  // Note: browser.close() will never hit unless loop breaks
})();
