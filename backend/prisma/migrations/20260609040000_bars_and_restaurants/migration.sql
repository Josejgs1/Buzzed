-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE "Establishment" ADD COLUMN "ownerId" INTEGER;

-- AlterTable
ALTER TABLE "Drink" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Establishment_ownerId_key" ON "Establishment"("ownerId");

-- CreateIndex
CREATE INDEX "Establishment_ownerId_idx" ON "Establishment"("ownerId");

-- CreateIndex
CREATE INDEX "Drink_isActive_idx" ON "Drink"("isActive");

-- AddForeignKey
ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
