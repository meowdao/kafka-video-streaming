"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.producer = void 0;
const kafkajs_1 = require("kafkajs");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const producer = async () => {
    const kafka = new kafkajs_1.Kafka({
        clientId: "my-app2",
        brokers: ["localhost:9092"],
        requestTimeout: 25000,
        connectionTimeout: 3000,
    });
    const producer = kafka.producer();
    await producer.connect();
    let movie_data;
    fs_1.default.readFile(path_1.default.resolve("video.mp4"), async function (err, data) {
        if (err) {
            throw err;
        }
        movie_data = data;
        let i;
        let j;
        let temparray;
        const chunk = 1000000;
        let index = 0;
        for (i = 0, j = movie_data.length; i < j; i += chunk) {
            temparray = movie_data.slice(i, i + chunk);
            producer.send({
                topic: "test-streaming",
                messages: [
                    {
                        value: temparray,
                        key: String(index),
                    },
                ],
            });
            index++;
        }
        // await producer.send({
        //   topic: "test-streaming",
        //   messages: [
        //     {
        //       value: movie_data.slice(0, 1),
        //       key: "user1",
        //     },
        //   ],
        // });
        await producer.disconnect();
    });
};
exports.producer = producer;
//# sourceMappingURL=producer.js.map