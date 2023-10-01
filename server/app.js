const  express = require('express');
const app = express();
require("dotenv");
const { readdirSync } = require("fs");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);



app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

readdirSync("./routes").map((path) => {
    app.use("/api", require(`./routes/${path}`));
});

const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + "/public"));

io.on("connection", (socket) => {
	console.log("A user connected.");

	socket.on("chunk", (data) => {
		// Save the received chunk to a file (you may need to handle file naming and storage better)
		fs.appendFileSync("recorded_video.webm", data);
	});

	socket.on("stream", (recordedBlob) => {
        console.log("Hey you! Stream is live.");
    });

	socket.on("disconnect", () => {
		console.log("A user disconnected.");
	});
});

app.get("/", (req, res) => {
	console.log("You did it bruh!");
	res.send({msg:"Hello World!"});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
