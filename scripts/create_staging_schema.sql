-- Skript för att skapa staging-schema i Supabase
-- Kör detta skript i Supabase SQL Editor för att konfigurera staging-miljön

-- 1. Skapa staging-schema om det inte redan finns
CREATE SCHEMA IF NOT EXISTS staging;

-- 2. Ge nödvändiga rättigheter till användare
GRANT ALL PRIVILEGES ON SCHEMA staging TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA staging TO anon;
GRANT ALL PRIVILEGES ON SCHEMA staging TO authenticated;
GRANT ALL PRIVILEGES ON SCHEMA staging TO service_role;

-- 3. Sätt sökväg så att Prisma kan hitta schemat
ALTER DATABASE postgres SET search_path TO public, staging;

-- Meddelande om framgång
SELECT 'Staging schema has been created successfully!' as message; 