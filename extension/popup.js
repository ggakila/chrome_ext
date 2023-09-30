document.addEventListener("DOMContentLoaded", () => {
	
	const startrecording = document.getElementById("startrecording");
	const stoprecording = document.getElementById("stoprecording");

	

	startrecording.addEventListener("click", () => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{ action: "start_recording" },
				function (response) {
					if (!chrome.runtime.lastError) {
						console.log(response);
					} else {
						console.log(chrome.runtime.lastError, "error");
					}
				}
			);
		});
	});

	stoprecording.addEventListener("click", () => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{ action: "stoprecording" },
				function (response) {
					if (!chrome.runtime.lastError) {
						console.log(response);
					} else {
						console.log(chrome.runtime.lastError, "error in popupjs");
					}
				}
			);
		});
	});
});