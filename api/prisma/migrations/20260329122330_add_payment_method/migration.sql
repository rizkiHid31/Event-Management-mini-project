-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER', 'WALLET', 'POINTS');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER';
