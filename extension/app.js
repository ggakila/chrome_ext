const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + "/public"));

io.on("connection", (socket) => {
	console.log("A user connected.");

	socket.on("chunk", (data) => {
		// Save the received chunk to a file (you may need to handle file naming and storage better)
		fs.appendFileSync("recorded_video.webm", data);
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected.");
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
