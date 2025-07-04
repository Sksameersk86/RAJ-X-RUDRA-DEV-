const puppeteer = require("puppeteer");
const fs = require("fs");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // Local testing ke liye false rakh sakta hai
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  // Facebook Post URL
  const postUrl = "https://www.facebook.com/61550558518720/posts/122228523338018617/?substory_index=1815342132376864&app=fbl";
  await page.goto(postUrl, { waitUntil: "networkidle2" });

  // Screenshot to verify post loaded
  await page.screenshot({ path: "post-opened.png" });
  console.log("📸 Screenshot saved: post-opened.png");

  // Read comment lines
  const comments = fs.readFileSync("np.txt", "utf8").split("\n").map(c => c.trim()).filter(Boolean);

  // Optional name list
  const names = fs.existsSync("names.txt")
    ? fs.readFileSync("names.txt", "utf8").split("\n").map(n => n.trim()).filter(Boolean)
    : [];

  const delayInMs = 5000; // 5 sec delay

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

  await browser.close();
})();
