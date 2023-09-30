var screenrecorder = null;
function onAccessApproved(stream) {
	screenrecorder = new MediaRecorder(stream);

	screenrecorder.start();

	screenrecorder.onstop = function () {
		stream.getTracks().forEach(function (track) {
			if (track.readyState === "live") {
				track.stop();
			}
		});
	};

	screenrecorder.ondataavailable = function (event) {
		let recordedBlob = event.data;
		let url = URL.createObjectURL(recordedBlob);

		let a = document.createElement("a");

		a.style.display = "none";
		a.href = url;
		a.download = "screen-recording.webm";

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
