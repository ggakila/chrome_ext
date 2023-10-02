const  express = require('express');
require("dotenv");
const { readdirSync } = require("fs");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const https = require("https");
const app = express();


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 5000;

readdirSync("./routes").map((path) => {
    app.use("/api", require(`./routes/${path}`));
});


app.get("/", (req, res) => {
	res.send({msg:"Application is up and running!"});
});

const privateKey = fs.readFileSync('/etc/letsencrypt/live/deveb.tech/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/deveb.tech/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/deveb.tech/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

https.createServer(credentials, app).listen(4000, () => {
	console.log('HTTPS Server running on port 4000');
});

http.createServer(function (req, res) {
	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
	res.end();
}).listen(3000);