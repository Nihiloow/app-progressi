-- CreateEnum
CREATE TYPE "PomodoroPhase" AS ENUM ('WORK', 'BREAK');

-- AlterTable
ALTER TABLE "XpEvent" ADD COLUMN     "pomodoroSessionId" TEXT;

-- CreateTable
CREATE TABLE "PomodoroSession" (
    "id" TEXT NOT NULL,
    "workMinutes" INTEGER NOT NULL,
    "breakMinutes" INTEGER NOT NULL,
    "autoChainBreak" BOOLEAN NOT NULL DEFAULT false,
    "actualWorkSeconds" INTEGER NOT NULL,
    "xpFromTime" INTEGER NOT NULL DEFAULT 0,
    "xpFromTask" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PomodoroSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PomodoroSession_userId_createdAt_idx" ON "PomodoroSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "XpEvent_pomodoroSessionId_idx" ON "XpEvent"("pomodoroSessionId");

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_pomodoroSessionId_fkey" FOREIGN KEY ("pomodoroSessionId") REFERENCES "PomodoroSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
