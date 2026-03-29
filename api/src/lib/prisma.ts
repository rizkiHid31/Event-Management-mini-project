import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Use DIRECT_URL (bypasses PgBouncer pooler) to support interactive transactions.
// PgBouncer in transaction mode (port 6543) does not support $transaction properly.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

export { prisma };
