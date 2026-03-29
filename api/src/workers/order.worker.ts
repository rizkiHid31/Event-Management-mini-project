import "dotenv/config";

import { Worker } from "bullmq";
import {
  expireUnpaidOrdersService,
  expireUnpaidSingleOrderService,
} from "../services/order.service.js";

const orderWorker = new Worker(
  "orderQueue",
  async (job) => {
    if (job.name === "expire-unpaid-orders") {
      console.info(`Checking expired orders...`);

      const orderId = job.data.orderId;

      // const result = await expireUnpaidOrdersService();
      const result = await expireUnpaidSingleOrderService(orderId);

      // if (result.count > 0) {
      //   console.info(`${result.count} orders is expired`);
      // }

      if (result) {
        console.info(`Order with id:${result.id} is expired`);
      }
    }
  },
  { connection: { url: process.env.REDIS_URL! } },
);

orderWorker.on("active", (job) => console.info(`Job ${job.name} is active`));

orderWorker.on("completed", (job) => {
  console.info(`Job ${job.name} completed`);
});

orderWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.name} failed`, error);
});