/*
  Warnings:

  - The values [VERY_HARD] on the enum `Difficulty` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Difficulty_new" AS ENUM ('EASY', 'NORMAL', 'HARD');
ALTER TABLE "public"."Quest" ALTER COLUMN "difficulty" DROP DEFAULT;
ALTER TABLE "Quest" ALTER COLUMN "difficulty" TYPE "Difficulty_new" USING ("difficulty"::text::"Difficulty_new");
ALTER TYPE "Difficulty" RENAME TO "Difficulty_old";
ALTER TYPE "Difficulty_new" RENAME TO "Difficulty";
DROP TYPE "public"."Difficulty_old";
ALTER TABLE "Quest" ALTER COLUMN "difficulty" SET DEFAULT 'NORMAL';
COMMIT;
