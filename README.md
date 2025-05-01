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
- **Databas**: PostgreSQL med Row-Level Security för tenant-isolation
- **Auth**: NextAuth.js / Auth.js med JWT
- **Deployment**: Vercel

## Utvecklingsmiljö

### Förutsättningar

- Node.js 18+
- npm eller yarn
- PostgreSQL (lokal installation eller molntjänst)

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

3. Kopiera `.env.example` till `.env.local` och konfigurera dina miljövariabler:
   ```bash
   cp .env.example .env.local
   ```

4. Starta utvecklingsservern:
   ```bash
   npm run dev
   ```

5. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

### Miljövariabler

Skapa en `.env.local` fil med följande variabler:

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/brf_saas

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ditt-hemliga-värde-här
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
```

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
