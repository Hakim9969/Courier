-- First, add the new columns to User table
ALTER TABLE "User" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "currentLat" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "currentLng" DOUBLE PRECISION;

-- Migrate existing courier data to User table
INSERT INTO "User" (
  "id", "name", "email", "phone", "role", "isAvailable", "currentLat", "currentLng", 
  "createdAt", "updatedAt", "deletedAt"
)
SELECT 
  "id", "name", "email", "phone", 'COURIER', "isAvailable", "currentLat", "currentLng",
  "createdAt", "updatedAt", "deletedAt"
FROM "Courier";

-- Update Parcel table to reference User instead of Courier
-- First, drop the foreign key constraint
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_assignedCourierId_fkey";

-- Add the new foreign key constraint
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_assignedCourierId_fkey" 
FOREIGN KEY ("assignedCourierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop the Courier table
DROP TABLE "Courier";
