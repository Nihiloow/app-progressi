-- CreateEnum
CREATE TYPE "ModerationFlagType" AS ENUM ('RAPID_CYCLE');

-- CreateTable
CREATE TABLE "ModerationFlag" (
    "id" TEXT NOT NULL,
    "type" "ModerationFlagType" NOT NULL,
    "detail" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModerationFlag_createdAt_idx" ON "ModerationFlag"("createdAt");

-- CreateIndex
CREATE INDEX "ModerationFlag_userId_idx" ON "ModerationFlag"("userId");

-- AddForeignKey
ALTER TABLE "ModerationFlag" ADD CONSTRAINT "ModerationFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationFlag" ADD CONSTRAINT "ModerationFlag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
