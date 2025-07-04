const express = require("express");
const fs = require("fs");
const multer = require("multer");
const bodyParser = require("body-parser");
const login = require("fca-smart-shankar");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 10000;

// 👇 Set your Facebook UID here
const OWNER_UID = "61550558518720";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post("/send", upload.single("npFile"), async (req, res) => {
  const { password, ownerUID, postID, appstate, interval } = req.body;

  // ✅ Password check
  if (password !== "RUDRA") return res.send("❌ Incorrect Password");

  // ✅ Owner UID check
  if (ownerUID !== OWNER_UID) return res.send("❌ You are not authorized to use this tool!");

  let messageList = [];
  try {
    messageList = fs.readFileSync(req.file.path, "utf-8").split("\n").filter(Boolean);
  } catch (err) {
    return res.send("❌ Error reading message file.");
  }

  let credentials;
  try {
    credentials = JSON.parse(appstate);
  } catch (err) {
    return res.send("❌ Invalid Appstate JSON.");
  }

  login({ appState: credentials }, (err, api) => {
    if (err) return res.send("❌ Login failed.");

    api.setOptions({ listenEvents: false });

    let index = 0;
    const commentLoop = setInterval(() => {
      if (index >= messageList.length) {
        clearInterval(commentLoop);
        return;
      }

      api.post(`${postID}/comments`, { message: messageList[index++] }, (err) => {
        if (err) console.log("❌ Comment error:", err);
      });
    }, parseInt(interval) * 1000);

    res.send("✅ Commenting started on the post!");
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
