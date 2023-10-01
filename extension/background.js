importScripts('socket.io.js');


const socket = io('http://localhost:5000');
socket.on('connect', () => {
	console.log('Connected to server');
});
socket.emit('stream', 'Connect and ready to receive messages');

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
		chrome.scripting
			.executeScript({
				target: { tabId },
				files: ["./content.js"],
			})
			.then(() => {
				console.log("Content script injected successfully");
				
			})
			.catch((err) => console.log(err, "error in background script"));
	}
});

let streamToServer; // Variable to store the stream

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'send_stream_to_background') {
        // Store the received stream
        streamToServer = message.stream;

        // Optionally, you can start processing or send the stream to your server here.
        socket.emit('stream', streamToServer);

        console.log('Stream received in background.js');
    }

    // Handle other actions...
});
