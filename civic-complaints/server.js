const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Endpoint to receive complaint
app.post("/submit", upload.fields([{ name: "image" }, { name: "voice" }]), (req, res) => {
  const { name, email, problem } = req.body;
  const image = req.files["image"] ? req.files["image"][0].filename : null;
  const voice = req.files["voice"] ? req.files["voice"][0].filename : null;

  const complaint = { name, email, problem, image, voice, date: new Date() };

  // Save complaint in JSON file
  const complaintsFile = path.join(__dirname, "complaints.json");
  let complaints = [];
  if (fs.existsSync(complaintsFile)) {
    complaints = JSON.parse(fs.readFileSync(complaintsFile));
  }
  complaints.push(complaint);
  fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2));

  res.json({ success: true, message: "Complaint submitted successfully!" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
