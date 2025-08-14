/*
  Warnings:

  - You are about to drop the column `weight_kg` on the `WeightMeasurement` table. All the data in the column will be lost.
  - Added the required column `userId` to the `WeightMeasurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weightKg` to the `WeightMeasurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."WeightMeasurement" DROP COLUMN "weight_kg",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "weightKg" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."WeightMeasurement" ADD CONSTRAINT "WeightMeasurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
