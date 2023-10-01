const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload");
const multer = require("multer");
const path = require('path');

const {
  uploadVideo,
  getAllVideos,
  getSingleVideo,
  deleteVideo,
  searchVideo,
  deleteAllVideos,
} = uploadController;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = '/home/eriq/projects/chrome_ext/server/uploads';
    cb(null, destinationPath); // Uploads will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// upload video: POST
router.post("/upload", upload.single("video"), uploadVideo);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/videos/:videoId", getSingleVideo);

router.get("/videos", getAllVideos);

router.delete("/videos/:videoId", deleteVideo);

router.get("/search", searchVideo);

router.delete("/videos", deleteAllVideos);

module.exports = router;