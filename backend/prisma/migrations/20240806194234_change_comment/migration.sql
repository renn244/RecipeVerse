/*
  Warnings:

  - Changed the type of `likes` on the `Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Comment_postId_key";

-- DropIndex
DROP INDEX "Comment_userId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "likes",
ADD COLUMN     "likes" BIGINT NOT NULL;
