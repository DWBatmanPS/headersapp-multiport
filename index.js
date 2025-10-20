import dotenv from "dotenv";
import express from "express"
import bodyParser from "body-parser";
import { dirname } from "path"; // this is to handle file path 
import { fileURLToPath } from "url"; // this is to handle file path 
import { url } from "inspector";
import fs from "fs";
import http from "http";
import https from "https";

dotenv.config(); // Load environment variables from .env file

const httpPort = process.env.PORTHTTP || 80; 
const httpPort2 = process.env.PORT2HTTP || 81;// Default to 80 if PORTHTTP is not set
const httpsPort = process.env.PORTHTTPS || 443;
const httpsPort2 = process.env.PORT2HTTPS || 444; // Default to 443 if PORTHTTPS is not set


const __dirname = dirname(fileURLToPath(import.meta.url)) // this is to handle file path 


const app = express();
const app2 = express();
//const port = process.env.PORT || 3000;

// My own middleware 
function logger(req, res, next) {
    next()
}

if (process.env.DEBUG === "true") {
    // Log incoming requests
    app.use((req, res, next) => {
        console.log(`Request received: ${req.method} ${req.originalUrl}\n  Client IP: ${req.ip}\n  Headers: ${JSON.stringify(req.headers, null, 2)}`);
        next();
    });
    // Log response status after the response is sent
    app.use((req, res, next) => {
        const originalSend = res.send;
        res.send = function (body) {
            const protocol = req.protocol; // 'http' or 'https'
            console.log(`Response sent for ${protocol.toUpperCase()} request: ${req.method} ${req.originalUrl} with status ${res.statusCode}`);
            originalSend.call(this, body);
        };
        next();
    });
    app2.use((req, res, next) => {
        console.log(`Request received second listener: ${req.method} ${req.originalUrl}\n  Client IP: ${req.ip}\n  Headers: ${JSON.stringify(req.headers, null, 2)}`);
        next();
    });
    // Log response status after the response is sent
    app2.use((req, res, next) => {
        const originalSend = res.send;
        res.send = function (body) {
            const protocol = req.protocol; // 'http' or 'https'
            console.log(`Response sent for second listener ${protocol.toUpperCase()} request: ${req.method} ${req.originalUrl} with status ${res.statusCode}`);
            originalSend.call(this, body);
        };
        next();
    });
}

// use body parser middleware we can use to mess with the body.
app.use(bodyParser.urlencoded({ extended: true}));

// use body parser middleware we can use to mess with the body.
app2.use(bodyParser.urlencoded({ extended: true}));

// handling GET /headers request 
app.get("/", (req, res) => {
    res.json({
        method: req.method,
        url: req.originalUrl,
        clientIP: req.ip,
        headers: req.headers,
        recport: "firstListener"+httpPort
    });
});

// handling POST /headers request
app.post("/", (req, res) => {
    res.json({
        method: req.method,
        url: req.originalUrl,
        clientIP: req.ip,
        headers: req.headers,
        recport: "firstListener"+httpPort
    });
});

// handling GET /headers request 
app2.get("/", (req, res) => {
    res.json({
        method: req.method,
        url: req.originalUrl,
        clientIP: req.ip,
        headers: req.headers,
        recport: "secondlistener"+httpPort2
    });
});

// handling POST /headers request
app2.post("/", (req, res) => {
    res.json({
        method: req.method,
        url: req.originalUrl,
        clientIP: req.ip,
        headers: req.headers,
        recport: "secondlistener"+httpPort2
    });
});

app2.use(bodyParser.urlencoded({ extended: true}));


// Create HTTP server
const httpServer = http.createServer(app);

const http2Server = http.createServer(app2);

// Create HTTPS server if SSL files are provided
let httpsServer;
if (process.env.SSL_KEY && process.env.SSL_CERT && process.env.USESSL === "true") {
    const options = {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
    };
    httpsServer = https.createServer(options, app);
    https2Server = https.createServer(options, app2);
}

// Start HTTP server
httpServer.listen(httpPort, () => {
    console.log(`HTTP server running on port ${httpPort}`);
});

// Start HTTPS server if available
if (httpsServer) {
    httpsServer.listen(httpsPort, () => {
        console.log(`HTTPS server running on port ${httpsPort}`);
    });
};

http2Server.listen(httpPort2, () => {
    console.log(`second HTTP server running on port ${httpPort2}`);
});

if (httpsServer) {
    https2Server.listen(httpsPort2, () => {
        console.log(`second HTTPS server running on port ${httpsPort2}`);
    });
}