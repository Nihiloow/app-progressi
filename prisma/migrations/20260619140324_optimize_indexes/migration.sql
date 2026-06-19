-- DropIndex
DROP INDEX "Task_userId_status_completedAt_idx";

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE INDEX "Task_userId_createdAt_idx" ON "Task"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "XpEvent_taskId_idx" ON "XpEvent"("taskId");
