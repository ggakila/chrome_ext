const multer = require('multer');
const prisma = require('../utils/client');
const fs = require("fs");


const startSession = async (req, res) => {
    try {
        session = await prisma.session.create({data : {
            active: true,
        }});
        console.log(session);
        res.status(200).json({ session });
    } catch (error) {
        res.status(500).json({ error });
    }
}

const uploadVideo = async (req, res) => {
    try {
        const sessionId = req?.params?.sessionId;
        if (!sessionId) {
            return res.status(400).json({ msg: "No session id" });
        }

        const session = await prisma.session.findUnique({ where: { id: sessionId } });

        if (!session.active) {
            return res.status(400).json({ msg: "Session is not active" });
        }
        const destination = '/home/eriq/projects/chrome_ext/server/uploads';

        console.log(req.file);
        const { originalname, path, buffer, size } = req.file;
        const filePath = `${destination}/${sessionId}-${originalname}`;

        console.log('Received a chunk of data.');
        

        try { 

            const blobBuffer = req.file.buffer;
            fs.access(filePath, (accessError) => {
                if (accessError) {
                    fs.writeFile(filePath, blobBuffer, (writeErr) => {
                    if (writeErr) {
                        console.error('Error creating the file:', writeErr);
                        res.status(500).json({ error: 'Error creating the file' });
                    } else {
                        console.log('File created and data appended');
                        res.status(200).json({ success: true });
                    }
                    });
                } else {
                    fs.readFile(filePath,  (err, existingData) => {
                    if (err) {
                        console.error('Error reading the existing file:', err);
                        res.status(500).json({ error: 'Error reading the existing file' });
                    } else {
                        const combinedBuffer = Buffer.concat([existingData, blobBuffer]);

                        fs.writeFile(filePath, combinedBuffer, async (writeErr) => {
                        if (writeErr) {
                            console.error('Error appending data to the file:', writeErr);
                            res.status(500).json({ error: 'Error appending data to the file' });
                        } else {
                            console.log('Data received and appended to the file');
                                const video = await prisma.video.upsert({
                                where: {sessionId: sessionId},
                                update: {
                                    size: size.toString(),
                                },
                                create: {
                                    title: originalname,
                                    size: size.toString(),
                                    url: filePath,
                                    session: {
                                        connect: {
                                            id: sessionId,
                                        }
                                    }
                                }
                            });
                            res.status(200).json({ success: true });
                        }
                    });
                        
                }
                });
            }});     

        } catch (err) {
            console.error('Error appending data to the file:', err);
            res.status(500).json({ error: 'Error appending data to the file' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
}


const stopSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await prisma.session.upsert({
            where: { id: sessionId },
            data: { active: false },
        });
        res.status(200).json({ session });
    } catch (error) {
        res.status(500).json({ error });
    }
}
//stream a video back to client using a link to the video 
const streamvideo = async(req, res) => {
    const { sessionId } = req.params;
    const video = await prisma.video.findUnique({ where: { sessionId: sessionId } });
    if (!video) {
        return res.status(404).json({ msg: "No Video found" });
    }
    const videoPath = video.url;
    if (!videoPath) {
      return res.status(404).send('Video url not found');
    }
  
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range || false ;
    const videoSize = fs.statSync(videoPath).size
    const chunkSize = 1 * 1e6;
    const start = 0;
    const end = Math.min(start + chunkSize, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const stream = fs.createReadStream(videoPath, {
        start,
        end
    })
    stream.pipe(res);
    // if (range) {
    //   const parts = range.replace(/bytes=/, '').split('-');
    //   const start = parseInt(parts[0], 10);
    //   const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    //   const chunksize = (end - start) + 1;
    //   const file = fs.createReadStream(videoPath, { start, end });
    //   const head = {
    //     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    //     'Accept-Ranges': 'bytes',
    //     'Content-Length': chunksize,
    //     'Content-Type': 'video/mp4',
    //   };
    //   res.writeHead(206, head);
    //   file.pipe(res);
    // } else {
    //   const head = {
    //     'Content-Length': fileSize,
    //     'Content-Type': 'video/mp4',
    //   };
    //   res.writeHead(200, head);
    //   fs.createReadStream(videoPath).pipe(res);
    // }
}


module.exports = { startSession, uploadVideo, stopSession, streamvideo };