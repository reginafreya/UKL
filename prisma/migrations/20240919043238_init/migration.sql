/*
  Warnings:

  - You are about to drop the column `descrpition` on the `menu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `menu` DROP COLUMN `descrpition`,
    ADD COLUMN `description` TEXT NOT NULL DEFAULT '';
