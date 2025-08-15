-- DropForeignKey
ALTER TABLE "public"."WeightMeasurement" DROP CONSTRAINT "WeightMeasurement_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."WeightMeasurement" ADD CONSTRAINT "WeightMeasurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
