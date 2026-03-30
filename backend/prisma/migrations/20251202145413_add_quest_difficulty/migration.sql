-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'NORMAL', 'HARD', 'VERY_HARD');

-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'NORMAL';
