import { Queue } from "bullmq";

export const orderQueue = new Queue("orderQueue", {
  connection: { url: process.env.REDIS_URL! },
});