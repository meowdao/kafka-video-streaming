"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = __importDefault(require("stream"));
const producer_1 = require("./kafka/producer");
const consumer_1 = require("./kafka/consumer");
dotenv_1.config();
const app = express_1.default();
let current = 0;
const mes = [];
app.get("/streaming", (req, res) => {
    const readStream = new stream_1.default.PassThrough();
    mes.sort((a, b) => {
        const aa = JSON.parse(a.key.toString("utf8"));
        const bb = JSON.parse(b.key.toString("utf8"));
        return aa > bb ? 1 : bb > aa ? -1 : 0;
    });
    const buf_array = mes.map(b => b.value)[current];
    if (!buf_array) {
        return res.end();
    }
    const buf = Buffer.from(buf_array);
    current++;
    const start = 0;
    const end = buf.length;
    const size = end - start;
    const head = {
        "Access-Control-Allow-Origin": "*",
        // "Content-Range": `bytes ${start}-${end}/17839845`,
        "Accept-Ranges": "bytes",
        "Content-Length": size,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    readStream.end(buf);
    readStream.pipe(res);
});
app.get("/file_streaming", (req, res) => {
    const path = "video.mp4";
    const stat = fs_1.default.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    let start;
    let end;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        start = parseInt(parts[0], 10);
        end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }
    else {
        start = 0;
        end = 1;
    }
    const chunksize = end - start + 1;
    const file = fs_1.default.createReadStream(path, { start, end });
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    file.pipe(res);
});
app.get("/produce", async (req, res) => {
    producer_1.producer();
    const cons = await consumer_1.consumer();
    cons.run({
        eachMessage: async ({ topic, partition, message }) => {
            mes.push(message);
        },
    });
    res.setHeader("Content-type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({ message: "producing" });
});
app.get("/consume", async (req, res) => {
    consumer_1.consumer();
    res.setHeader("Content-type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({ message: "producing" });
});
app.get("/", function (req, res) {
    res.sendFile(path_1.default.resolve("index.html"));
});
const host = process.env.HOST;
const port = process.env.PORT;
app.listen(port, host, () => {
    console.info(`API server is running on http://${host}:${port}`);
});
//# sourceMappingURL=index.js.map