/*
  Warnings:

  - You are about to drop the column `catergory` on the `menu` table. All the data in the column will be lost.
  - Added the required column `category` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `menu` DROP COLUMN `catergory`,
    ADD COLUMN `category` ENUM('FOOD', 'DRINK', 'SNACK') NOT NULL;
