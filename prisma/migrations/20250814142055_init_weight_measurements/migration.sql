-- CreateTable
CREATE TABLE "public"."WeightMeasurement" (
    "id" SERIAL NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightMeasurement_pkey" PRIMARY KEY ("id")
);
