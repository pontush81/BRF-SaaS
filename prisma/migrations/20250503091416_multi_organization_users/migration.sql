-- Skapa den nya UserOrganization-tabellen
CREATE TABLE "UserOrganization" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("id")
);

-- Skapa unik begränsning för userId+organizationId
CREATE UNIQUE INDEX "UserOrganization_userId_organizationId_key" ON "UserOrganization"("userId", "organizationId");

-- Migrera existerade user-organization kopplingar till den nya tabellen
INSERT INTO "UserOrganization" ("id", "userId", "organizationId", "role", "isDefault", "createdAt")
SELECT 
  gen_random_uuid()::text, 
  "id" as "userId", 
  "organizationId", 
  "role", 
  true as "isDefault", 
  CURRENT_TIMESTAMP as "createdAt"
FROM "User"
WHERE "organizationId" IS NOT NULL;

-- Sätt upp foreign keys för UserOrganization-tabellen
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ta bort gamla relationships mellan User och Organization
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_organizationId_fkey";
ALTER TABLE "User" DROP COLUMN "organizationId";
ALTER TABLE "User" DROP COLUMN "role";

-- Uppdatera schema_migrations för att registrera denna migrering
-- Detta görs automatiskt av Prisma när migreringar körs normalt 