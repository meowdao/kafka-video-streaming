"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumer = void 0;
const kafkajs_1 = require("kafkajs");
const consumer = async () => {
    const kafka = new kafkajs_1.Kafka({
        clientId: "my-app2",
        brokers: ["localhost:9092"],
    });
    const consumer = kafka.consumer({ groupId: "whatever" });
    await consumer.connect();
    await consumer.subscribe({ topic: "test-streaming", fromBeginning: true });
    return consumer;
};
exports.consumer = consumer;
//# sourceMappingURL=consumer.js.map