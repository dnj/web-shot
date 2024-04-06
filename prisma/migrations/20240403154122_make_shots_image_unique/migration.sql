/*
  Warnings:

  - A unique constraint covering the columns `[image]` on the table `shots` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `shots_image_key` ON `shots`(`image`);
