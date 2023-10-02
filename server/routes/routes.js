const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload");
const multer = require("multer");
const path = require('path');
const upload = require("../middlewares/uploadmiddleware");

const {
  getAllVideos,
  getSingleVideo,
  deleteVideo,
  searchVideo,
  deleteAllVideos,
} = uploadController;

const {
  startSession,
  stopSession,
  uploadVideo,
} = require("../controllers/stream");

// stream: POST
router.get("/startstream", startSession);
router.post("/stream/:sessionId", upload.single('video'),  uploadVideo);
router.get("/stopstream", stopSession);


router.post("/upload", upload.single('video'), uploadVideo);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/videos/:videoId", getSingleVideo);

router.get("/videos", getAllVideos);

router.delete("/videos/:videoId", deleteVideo);

router.get("/search", searchVideo);

router.delete("/videos", deleteAllVideos);

module.exports = router;