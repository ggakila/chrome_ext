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
    const exchangeName = "videoQueue";
    const routingKey = "softtext";
    const msg = JSON.stringify({sessionId });
    channel.assertQueue(queue, {
      durable: false,
    });
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(`Message sent to ${queue}`);

    await channel.assertExchange(exchangeName, "direct", { durable: true });

    channel.publish(exchangeName, routingKey,   body=sessionId, {
    persistent: true,
    });
    console.log(`Message sent to ${exchangeName} with routing key ${routingKey}`);
  } catch (error) {
    console.error(error);
  }
};

async function ffmpeg(command) {
    return new Promise((resolve, reject) => {
      exec(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
        if (err) reject(err);
        resolve(stdout);
      });
    });
  }


//converting video to audio using ffmpes
const transcribeVideo = async (sessionId) => {
  try {
    const video = await prisma.video.findUnique({
        where: { sessionId: sessionId },
        }); 
    if (!video) {
      throw new Error("Video not found");
    }
    const videoPath = video.url;
    const videoDirectory = path.dirname(videoPath);
    const audioPath= videoPath.replace(".webm", "");
    
    ffmpeg(`-hide_banner -y -i ${audioPath} ${audioPath}.wav`);
    const audioFile = {
        buffer: fs.readFileSync(`${filePath}.wav`),
        mimetype: "audio/wav",
    };

    const response = await deepgram.transcription.preRecorded(audioFile, {
        Punctuation: true,
      });
    return response.results.channels[0].alternatives[0].transcript;
    

  } catch (error) {
    console.error(error);
  }
};

//consume message from rabbitmq queue
const consumeTranscribeJob = async () => {
  try {
    const connection = await amqp.connect("amqp://18.119.101.235:15672");
    const channel = await connection.createChannel();
    const queue = "transcribe";
    const exchangeName = "videoQueue";
    const routingKey = "softtext";
    const msg = JSON.stringify({sessionId });
    channel.assertQueue(queue, {
      durable: false,
    }); 
    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);
    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const videoInfo = JSON.parse(msg.content.toString());
        let sessionId = videoInfo.id;
        console.log("Received message from queue:", sessionId);
        try {
          transcript = await transcribeVideo(sessionId);
          console.log("transcript:", transcript);
          writeATranscript(transcript, sessionId);
        } catch (error) {
          console.log(error);
        }
        channel.ack(msg);
      }
    });


  }
    catch (error) {
        console.error(error);
    }
}

const writeATranscript = (transcript, sessionId='non') => {
    fs.writeFile(`/uploads/${id}.txt`, transcript, (err) => {
      if (err) {
        console.log(err);
      }
      console.log("Transcript file has been written");
    });
  };




