# BRF-SaaS

En SaaS-plattform för hantering av bostadsrättsföreningar med multi-tenant arkitektur.

## Projektöversikt

BRF-SaaS är en molnbaserad plattform som gör det möjligt för flera bostadsrättsföreningar att hantera sina verksamheter på ett och samma system. Varje förening får sitt eget isolerade utrymme (tenant) med säker data-separation.

### Funktioner

- **Multi-tenant arkitektur**: Isolerad data för varje förening
- **Medlemshantering**: Hantera medlemmar och deras kontaktuppgifter
- **Ekonomi**: Fakturor, budget och ekonomiska rapporter
- **Dokumenthantering**: Lagra och dela viktiga dokument
- **Ärendehantering**: Hantera ärenden och uppgifter
- **Kommunikation**: Enkla kommunikationsverktyg för styrelse och medlemmar

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databas**: PostgreSQL (Supabase) med Row-Level Security för tenant-isolation
- **Auth**: Supabase Auth för autentisering
- **Deployment**: Vercel

## Utvecklingsmiljö

### Förutsättningar

- Node.js 18+
- npm eller yarn
- Supabase-konto (för databas och autentisering)

### Installation

1. Klona repot:
   ```bash
   git clone https://github.com/pontush81/BRF-SaaS.git
   cd BRF-SaaS
   ```

2. Installera beroenden:
   ```bash
   npm install
   ```

3. Kopiera `.env.example` till `.env` och konfigurera dina miljövariabler:
   ```bash
   cp .env.example .env
   ```

4. Konfigurera din Supabase-databas:
   - Skapa ett nytt projekt på [Supabase](https://supabase.com)
   - Kopiera anslutningssträngarna till din `.env`-fil
   - Kör `npx prisma db push` för att skapa databasstrukturen

5. Starta utvecklingsservern:
   ```bash
   npm run dev
   ```

6. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

### Miljövariabler

Skapa en `.env` fil med följande variabler:

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=handbok.se
NEXT_PUBLIC_MARKETING_DOMAIN=localhost:3000

# Database (Prisma)
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Auth (NextAuth - optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a-random-string-for-development-only
```

## Projektstruktur

```
/src
  /app                  # Next.js App Router
  /components           # UI-komponenter
  /lib                  # Bibliotek och hjälpfunktioner
  /middleware           # Middleware för autentisering och multi-tenancy
  /utils                # Verktyg och hjälpfunktioner
  /hooks                # React hooks
  /contexts             # React contexts
  /services             # API-tjänster
  /styles               # CSS och stilar
  /types                # TypeScript typdefinitioner
  /config               # Konfigurationsfiler
/prisma
  schema.prisma        # Databasschema för Prisma ORM
```

## Databashantering

Projektet använder Prisma ORM för att hantera databasen. Några viktiga kommandon:

- `npx prisma db push` - Skapa/uppdatera databas från schema
- `npx prisma generate` - Generera Prisma Client från schema
- `npx prisma studio` - Öppna Prisma Studio för att utforska databasen

## Utvecklingsflöde

1. Skapa en ny gren för din funktion:
   ```bash
   git checkout -b feature/din-feature-namn
   ```

2. Genomför dina ändringar och testa lokalt.

3. Skicka en Pull Request till `main`-grenen.

## Deployment

Projektet är konfigurerat för deployment på Vercel. När ändringar skickas till `main`-grenen kommer en automatisk deployment att ske.

## Licens

Detta projekt är privat och får inte användas, kopieras eller distribueras utan uttryckligt tillstånd.
