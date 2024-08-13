-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('Viewed', 'Notviewed');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'Viewed';
