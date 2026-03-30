-- CreateEnum
CREATE TYPE "EquipSlot" AS ENUM ('CHAR', 'PET', 'NONE');

-- AlterTable
ALTER TABLE "ShopItem" ADD COLUMN     "equipSlot" "EquipSlot" NOT NULL DEFAULT 'NONE';
