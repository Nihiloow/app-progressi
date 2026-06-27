-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pomodoroAutoChainBreak" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pomodoroBreakMinutes" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "pomodoroWorkMinutes" INTEGER NOT NULL DEFAULT 25;
