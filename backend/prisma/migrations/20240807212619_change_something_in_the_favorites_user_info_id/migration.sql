/*
  Warnings:

  - You are about to drop the column `userInfoId` on the `Favorites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,postId]` on the table `Favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Favorites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Favorites" DROP CONSTRAINT "Favorites_userInfoId_fkey";

-- DropIndex
DROP INDEX "Favorites_userInfoId_postId_key";

-- AlterTable
ALTER TABLE "Favorites" DROP COLUMN "userInfoId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Favorites_userId_postId_key" ON "Favorites"("userId", "postId");

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserInfo"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
