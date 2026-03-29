-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('MUSIC', 'SPORTS', 'TECHNOLOGY', 'BUSINESS', 'FOOD', 'ART', 'EDUCATION', 'OTHER');

-- AlterEnum (add CANCELLED to OrderStatus)
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterTable User: add new columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredById" INTEGER;

-- AlterTable Event: add new columns
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "category" "EventCategory" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "capacity" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;

-- Populate slug from title for existing events
UPDATE "Event" SET "slug" = LOWER(REPLACE(REPLACE("title", ' ', '-'), '.', '')) || '-' || "id"
WHERE "slug" IS NULL;

-- Make slug required and unique
ALTER TABLE "Event" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");

-- AlterTable Order: add quantity and updatedAt
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable Wallet: set default balance
ALTER TABLE "Wallet" ALTER COLUMN "balance" SET DEFAULT 0;

-- AlterTable EventImage: add onDelete cascade
ALTER TABLE "EventImage" DROP CONSTRAINT IF EXISTS "EventImage_eventId_fkey";
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Review
CREATE TABLE IF NOT EXISTS "Review" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex Review unique per user per event
CREATE UNIQUE INDEX IF NOT EXISTS "Review_eventId_userId_key" ON "Review"("eventId", "userId");

-- AddForeignKey Review -> Event
ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_eventId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Review -> User
ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_userId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey User self-referral
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_referredById_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey"
  FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
