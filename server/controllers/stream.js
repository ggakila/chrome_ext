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



module.exports = { startSession, uploadVideo, stopSession };