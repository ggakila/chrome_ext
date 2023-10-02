const  express = require('express');
const app = express();
require("dotenv");
const { readdirSync } = require("fs");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const server = http.createServer(app);

app.use(express.json());
app.use(cors({origin: '*'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 5000;

readdirSync("./routes").map((path) => {
    app.use("/api", require(`./routes/${path}`));
});


app.get("/", (req, res) => {
	res.send({msg:"Application is up and running!"});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
