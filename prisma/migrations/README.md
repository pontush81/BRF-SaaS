# Databasmigrering med Prisma

Det här direktoriet innehåller databasmigrationer för BRF-SaaS-projektet.

## Skapa databasen

För att köra projektet behöver du en PostgreSQL-databas. Du kan antingen:

1. Installera PostgreSQL lokalt på din dator
2. Använda Docker för att köra PostgreSQL
3. Använda en molntjänst som Supabase eller Railway

### Lokalt PostgreSQL

Om du har PostgreSQL installerat lokalt, skapa en databas med namnet `brf_saas`:

```sql
CREATE DATABASE brf_saas;
```

### Använda Docker

Med Docker installerat, kör följande kommando:

```bash
docker run --name brf-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=brf_saas -p 5432:5432 -d postgres
```

### Molntjänster

Om du använder en molntjänst som Supabase, se till att uppdatera `DATABASE_URL` i din `.env`-fil med anslutningssträngen.

## Migrering

När din databas är skapad, kör följande kommando för att skapa tabellerna:

```bash
npx prisma migrate dev
```

Detta kommando kommer att:
1. Läsa in schemat från `prisma/schema.prisma`
2. Jämföra schemat med databasen
3. Generera migreringsfilerna
4. Köra migreringarna

## Använda Prisma Studio

För att utforska och hantera databasen visuellt kan du använda Prisma Studio:

```bash
npx prisma studio
```

Detta öppnar ett grafiskt gränssnitt i din webbläsare där du kan hantera data. 