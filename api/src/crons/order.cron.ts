import { CronJob } from "cron";
import { expireUnpaidOrdersService } from "../services/order.service.js";

export const expireUnpaidOrderJob = new CronJob(
  "*/5 * * * * *",
  async () => {
    console.info("Cheking expired orders...");

    const result = await expireUnpaidOrdersService();

    if (result.count > 0) {
      console.info(`${result.count} order is expired`);
    }
  },
  null,
  true,
);
