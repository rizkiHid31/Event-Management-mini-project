import { orderQueue } from "./order.queue.js";

export async function registerOrderJob() {
  await orderQueue.add(
    "expire-unpaid-orders",
    {},
    { repeat: { every: 5000 }, removeOnComplete: true, removeOnFail: true },
  );

  console.info(`Expired unpaid order job schedule (every 5s)`);
}
