const { Deepgram } = require('@deepgram/sdk');
const amqp = require("amqplib");
const fs = require("fs");
const videPath = "/uploads";
const path = require("path");
const ffmpegStatic = require("ffmpeg-static");
import prisma from '../utils/client';

const deepgramApiKey = '25a9b81db35cb7f421b7fb051358bf882bd3198f';

serverUrl = 'http://ec2-18-119-101-235.us-east-2.compute.amazonaws.com:3000/'

const audioUrl = 'https://static.deepgram.com/examples/Bueller-Life-moves-pretty-fast.wav';



const deepgram = new Deepgram(deepgramApiKey);

deepgram.transcription.preRecorded(
  { url: audioUrl },
  {
    model: "nova-2-ea",
    language: "en",
    smart_format: true,
  },
)
.then((transcription) => {
  console.dir(transcription, {depth: null});
})
.catch((err) => {
  console.log(err);
});


//send msg to be added to raabitmq queue
const sendTranscibeJob = async (sessionId) => {
  try {
    const connection = await amqp.connect("amqp://18.119.101.235:15672");
    const channel = await connection.createChannel();
    const queue = "transcribe";
    const msg = JSON.stringify({sessionId });
    channel.assertQueue(queue, {
      durable: false,
    });
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(`Message sent to ${queue}`);
  } catch (error) {
    console.error(error);
  }
};


//converting video to audio using ffmpes
const convertVideoToAudio = async (sessionId) => {
  try {
    const video = await prisma.video.findUnique({
        where: { sessionId: sessionId },
        }); 
    if (!video) {
      throw new Error("Video not found");
    }
    const videoPath = video.url;

    const audioPath = path.join(__dirname, `../uploads/${sessionId}.wav`);
    

  } catch (error) {
    console.error(error);
  }
};


