/*
  Warnings:

  - You are about to alter the column `likes` on the `childComment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "childComment" ALTER COLUMN "likes" SET DATA TYPE INTEGER;
