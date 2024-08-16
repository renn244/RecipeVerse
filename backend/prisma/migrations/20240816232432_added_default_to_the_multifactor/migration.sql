/*
  Warnings:

  - Made the column `MultiFactor` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "MultiFactor" SET NOT NULL,
ALTER COLUMN "MultiFactor" SET DEFAULT false;
