var screenrecorder = null;
var audioStream = null;
let url;
let sessionId;
let chunkQueue = [];
let isSending = false;


function onAccessApproved(videoStream, audioStream) {
	const mediaStream = new MediaStream();
	videoStream.getTracks().forEach((track) => mediaStream.addTrack(track));
	audioStream.getTracks().forEach((track) => mediaStream.addTrack(track));

	screenrecorder = new MediaRecorder(mediaStream);
	

	let videoChunks = [];
	console.log("videoChunks:", videoChunks);
	screenrecorder.start(1000);

	screenrecorder.onstop = function () {
		
		mediaStream.getTracks().forEach(function (track) {
			if (track.readyState === "live") {
				track.stop();
			}
		});
				
	};

	screenrecorder.ondataavailable = function (event) {
		
		if (event.data.size > 0) {
			videoChunks.push(event.data);
			newChunk = event.data;
			url = URL.createObjectURL(event.data);

			console.log("video-chunks:", videoChunks);
			
			chunkQueue.push(newChunk);
			if (!isSending) {
				sendChunksFromQueue();
			}
			
			let a = document.createElement("a");

			a.style.display = "none";
			a.href = url;
			const formattedDate = new Date()
				.toISOString()
				.replace(/[-:.T-]/g, "")
				.slice(0, -1);
			a.download = `untitled_${formattedDate}.webm`;
			document.body.appendChild(a);
			// a.click();

			document.body.removeChild(a);
			
			URL.revokeObjectURL(url);
		}
	};
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "start_recording") {
		console.log("Screen recording successfully requested");

		sendResponse(`${message.action} success`);

		navigator.mediaDevices
			.getDisplayMedia({
				audio: true,
				video: {
					width: 9999999999,
					height: 9999999999,
				},
			})
			.then((videoStream) => {
				navigator.mediaDevices
					.getUserMedia({ audio: true })
					.then( (audio) => {
						audioStream = audio; // Store the audio stream
						onAccessApproved(videoStream, audioStream);
					})
					.catch((error) => {
						console.error("Error accessing audio:", error);
					});
				
			}).catch((error) => {
				console.error("Error accessing video:", error);
			});

	}

	if (message.action === "stoprecording") {
		console.log("stopping video");
		sendResponse(`processed: ${message.action}`);
		if (!screenrecorder) return console.log("no recorder");
		
		screenrecorder.stop();
		setTimeout(function () {
			const redirectUrl = `https://helpmeout-previewpage-311b.vercel.app/previewpage/${sessionId}`;
			window.location.href = redirectUrl;
		  }, 1000);
	}
});

	

function stopStream( streamId ) {
	if( streamId ) {
		return;
	}

	fetch(`https://app.deveb.tech/api/stopstream/${sessionId}`, {
		method: "POST",
	})
		.then((response) => response.json())
		.then((response) => {
			console.log("Session Stopped:", response);
		})
		.catch((error) => {
			console.error("Session Error:", error);
		});
}


async function requestSessionId() {
    try {
        const response = await fetch('https://app.deveb.tech/api/startstream', {
            method: 'POST',
        });
        const data = await response.json();
        sessionId = data.session.id;
    } catch (error) {
        console.error('Error requesting session ID:', error);
    }
}

async function sendChunk(chunk) {
    try {
        const formData = new FormData();
        formData.append('video', chunk, 'recorded_video.webm');

        const response = await fetch(`https://app.deveb.tech/api/stream/${sessionId}`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log('Chunk sent successfully:', result);
    } catch (error) {
        console.error('Error sending chunk:', error);
    }
}

async function sendChunksFromQueue() {
    if (!sessionId) {
        // Request session ID if not available
        await requestSessionId();
    }

    while (chunkQueue.length > 0) {
        const chunk = chunkQueue.shift();
        isSending = true;
        await sendChunk(chunk);
        isSending = false;
    }
}


