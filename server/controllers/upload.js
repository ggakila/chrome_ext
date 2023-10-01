const multer = require('multer');
const prisma = require('../utils/client');
const streamifier = require("streamifier");
const fs = require("fs");



const uploadVideo = async (req, res) => {
    try {
        
        console.log(req.file);
        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).json({ msg: "No file uploaded" });
        }
        //upload to local storage
        const { originalname, path, encoding } = req.file;
        const directoryPath = path
        console.log('Received a chunk of data.');
        // Save the received chunk to a file (you may need to handle file naming and storage better)
        const data = fs.readFileSync(directoryPath);

        const video = await prisma.video.create({
            data: {
                title: originalname,
                description: encoding,
                url: path,
            },
        });
        
        fs.appendFile(directoryPath, data, (err) => {
            if (err) {
                console.error('Error appending chunk:', err);
                res.status(500).json({ error: 'Error appending chunk' });
            } else {
                console.log('Data received and merged')
                
                res.status(200).json({ success: true });
            }
          });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
};

const getAllVideos = async (req, res) => {
    try {
        const videos = await prisma.video.findMany();
        res.status(200).json({ videos });
    } catch (error) {
        res.status(500).json({ error });
    }
};

const getSingleVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await prisma.video.findFirst({ where: { id: videoId } });
        res.status(200).json({ video });
    } catch (error) {
        res.status(500).json({ error });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await prisma.video.findFirst({ where: { id: videoId } });
        if (!video) {
            return res.status(404).json({ msg: "No video found" });
        }
        const publicId = video.url.split("/").slice(-1)[0].split(".")[0];
        await prisma.video.delete({ where: { id: videoId } });
        res.status(200).json({ msg: "Video deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

const searchVideo = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res
                .status(400)
                .json({ msg: "Name parameter is required for search." });
        }
        // Perform the search in the database
        const videos = await prisma.video.findMany({
            where: {
                title: {
                    contains: name,
                    mode: "insensitive",
                },
            },
        });

        if (videos.length === 0) {
            return res.status(404).json({ msg: "No videos found with that name." });
        }
        res.status(200).json({ videos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
};

const deleteAllVideos = async (req, res) => {
    try {
        const videos = await prisma.video.findMany();
        if (videos.length === 0) {
            return res.status(404).json({ msg: "No videos found" });
        }
        console.log(videos);
        videos.forEach(async (video) => {
            const publicId = video.url.split("/").slice(-1)[0].split(".")[0];
            await cloudinary.v2.uploader.destroy(publicId);
            await prisma.video.delete({ where: { id: video.id } });
        });
        res.status(200).json({ msg: "All videos deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

module.exports = {
    uploadVideo,
    getAllVideos,
    getSingleVideo,
    deleteVideo,
    searchVideo,
    deleteAllVideos,
};
