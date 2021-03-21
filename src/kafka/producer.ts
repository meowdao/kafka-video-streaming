import {Kafka} from "kafkajs";
import fs from "fs";
import path from "path";

export const producer = async () => {
  const kafka = new Kafka({
    clientId: "my-app2",
    brokers: ["localhost:9092"],
    requestTimeout: 25000,
    connectionTimeout: 3000,
  });

  const producer = kafka.producer();

  await producer.connect();

  let movie_data;
  fs.readFile(path.resolve("video.mp4"), async function (err, data) {
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
