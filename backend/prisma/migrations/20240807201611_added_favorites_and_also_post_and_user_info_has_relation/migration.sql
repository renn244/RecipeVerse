/*
  Warnings:

  - You are about to drop the column `favorites` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "favorites";

-- CreateTable
CREATE TABLE "Favorites" (
    "id" TEXT NOT NULL,
    "userInfoId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorites_userInfoId_postId_key" ON "Favorites"("userInfoId", "postId");

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_userInfoId_fkey" FOREIGN KEY ("userInfoId") REFERENCES "UserInfo"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
