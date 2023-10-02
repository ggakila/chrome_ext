
var screenrecorder = null;
var audioStream = null;
let blobs = [];
let url;


let sessionId;
function onAccessApproved(videoStream, audioStream) {
	const mediaStream = new MediaStream();
	videoStream.getTracks().forEach((track) => mediaStream.addTrack(track));
	audioStream.getTracks().forEach((track) => mediaStream.addTrack(track));

	screenrecorder = new MediaRecorder(mediaStream);

	let videoChunks = [];
	console.log("videoChunks:", videoChunks);
	screenrecorder.start(1000);
	
	fetch(`https://app.deveb.tech/api/startstream`, {
		method: "POST",
	})
		.then((response) => response.json())
		.then((response) => {
			
			sessionId = response.session.id;
		})
		.catch((error) => {
			console.error("Session Error:", error);
		});


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

			blobs.push(event.data);
			url = URL.createObjectURL(event.data);

		}
		console.log("video-chunks:", videoChunks);
		let recordedBlob = event.data;
		
		sendLastBlobToServer(recordedBlob, sessionId);
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
	}
});

function sendLastBlobToServer(blob, sessionId) {
	if (blobs.length === 0) {
		return; 
	}

	const lastBlob = blobs[blobs.length - 1];

	const formData = new FormData();
	formData.append("video", lastBlob, "recorded_video.webm");
	if (!sessionId) {
		console.log(sessionId)
		console.log("no session id");
		return;
	}

	fetch(`https://app.deveb.tech/api/stream/${sessionId}`, {
		method: "POST",
		body: formData,
		})
		.then((response) => response.json())
		.then((result) => {
		console.log("Success:", result);
		})
		.catch((error) => {
		console.error("Error:", error);
		});
}	

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
