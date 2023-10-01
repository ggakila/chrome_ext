
var screenrecorder = null;
const blobs = [];
let previousBlobsCount = 0;
let url;
function onAccessApproved(stream) {
	screenrecorder = new MediaRecorder(stream);
	let videoChunks = [];
	console.log("videoChunks:", videoChunks);
	screenrecorder.start(1000);

	screenrecorder.onstop = function () {
		stream.getTracks().forEach(function (track) {
			if (track.readyState === "live") {
				track.stop();
			}
		});
		
	};

	screenrecorder.ondataavailable = function (event) {
		if (event.data.size > 0) {
            console.log("inside event size");
			videoChunks.push(event.data);
			
			blobs.push(event.data);
			url = URL.createObjectURL(event.data);

		}
		console.log("video-chunks:", videoChunks);
		let recordedBlob = event.data;
		sendLastBlobToServer(recordedBlob);
		let a = document.createElement("a");

		a.style.display = "none";
		a.href = url;
		const formattedDate = new Date()
			.toISOString()
			.replace(/[-:.T-]/g, "")
			.slice(0, -1);
		a.download = `untitled_${formattedDate}.webm`;
		document.body.appendChild(a);
		a.click();

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
			.then((stream) => {

				onAccessApproved(stream);
				
				
			});

	}

	if (message.action === "stoprecording") {
		console.log("stopping video");
		sendResponse(`processed: ${message.action}`);
		if (!screenrecorder) return console.log("no recorder");

		screenrecorder.stop();
	}
});

function sendLastBlobToServer(blob) {
if (blobs.length === 0) {
	return; 
}

const lastBlob = blobs[blobs.length - 1];

const formData = new FormData();
formData.append("video", blob, "recorded_video.webm");

fetch("http://localhost:5000/api/upload", {
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

// Clear the blobs array after sending the last blob
previousBlobsCount += 1;
}