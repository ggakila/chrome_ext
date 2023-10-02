/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Video_sessionId_key" ON "Video"("sessionId");
