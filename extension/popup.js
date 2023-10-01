

document.addEventListener("DOMContentLoaded", () => {
	
	
	const startrecording = document.getElementById("startrecording");
	const stoprecording = document.getElementById("stoprecording");

	const storedData = localStorage.getItem("socket");

    if (storedData) {
        // If data is found, use it
        console.log("Data retrieved:", storedData);
    } else {
        // If no data is found, initialize and store it
        const initialData = "Hello, world!";
        localStorage.setItem("myData", initialData);
        console.log("Initial data set:", initialData);
    }



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