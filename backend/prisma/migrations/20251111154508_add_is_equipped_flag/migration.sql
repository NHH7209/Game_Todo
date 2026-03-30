-- AlterTable
ALTER TABLE "UserAchievement" ADD COLUMN     "isEquipped" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserInventory" ADD COLUMN     "isEquipped" BOOLEAN NOT NULL DEFAULT false;
