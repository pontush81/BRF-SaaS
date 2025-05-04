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

5. Fylla databasen med testdata:
   ```bash
   npm run prisma:seed
   ```

6. Starta utvecklingsservern:
   ```bash
   npm run dev
   ```

7. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

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
    /api                # API-endpoints
      /dev              # Utvecklingsspecifika API-endpoints
    /dev-tools          # Utvecklingsverktyg 
  /components           # UI-komponenter
  /lib                  # Bibliotek och hjälpfunktioner
    /prisma.ts          # Prisma-klient setup
    /mock-control.ts    # Kontroll av mockad data
    /tenant-utils.ts    # Tenant-isolering för Prisma
    /env.ts             # Miljöhantering
  /middleware           # Middleware för autentisering och multi-tenancy
  /utils                # Verktyg och hjälpfunktioner
  /hooks                # React hooks
  /contexts             # React contexts
  /services             # API-tjänster
  /styles               # CSS och stilar
  /types                # TypeScript typdefinitioner
  /config               # Konfigurationsfiler
  /scripts              # Utility scripts
    /sync-schema.ts     # Schema-synkronisering
/prisma
  schema.prisma         # Databasschema för Prisma ORM
  schema.staging.prisma # Staging databasschema
  seed.ts               # Testdata för lokal utveckling
```

## Utvecklingsverktyg

Projektet innehåller flera verktyg för utveckling och testning.

### Mock-läge för utveckling

Vi använder mock-data för att underlätta utveckling utan beroende till externa tjänster:

- En global mock-indikator visas alltid i utvecklingsmiljön
- Använd `/dev-tools` för att kontrollera mock-status och hantera mock-data
- Mock-data används automatiskt i utvecklingsmiljön, aldrig i produktion

### Dev-Tools-sidan

Besök `/dev-tools` i utvecklingsmiljön för att:

- Se och hantera databasanslutningar
- Växla mellan mockad och riktig data
- Simulera inloggning/utloggning
- Återställa utvecklingsdatabasen med testdata

### Seed-script för testdata

Vi har implementerat ett omfattande seed-script som fyller databasen med testdata:

```bash
# Fylla databasen med testdata
npm run prisma:seed

# Återställ databasen och skapa ny testdata
npm run db:reset
```

Detta är särskilt användbart för att:
- Testa multi-tenant funktionalitet med realistisk data
- Undvika att behöva skapa testdata manuellt
- Säkerställa att alla deltar med samma datauppsättning

## Databashantering

Projektet använder Prisma ORM för att hantera databasen. Några viktiga kommandon:

- `npx prisma db push` - Skapa/uppdatera databas från schema
- `npx prisma generate` - Generera Prisma Client från schema
- `npx prisma studio` - Öppna Prisma Studio för att utforska databasen
- `npm run prisma:seed` - Fyll databasen med testdata

### Schema-synkronisering

För att hålla databasschemat synkroniserat mellan miljöer:

```bash
# Synkronisera lokalt schema till staging
npm run schema:push:staging

# Hämta schema från staging till lokal miljö
npm run schema:pull:staging

# Synkronisera lokalt schema till produktion
npm run schema:push:prod

# Hämta schema från produktion till lokal miljö
npm run schema:pull:prod
```

## Tenant-isolation

Vi använder en robust tenant-isolationsmodell som säkerställer att data är korrekt isolerad:

- I utvecklingsmiljö: Enkel access till all data för snabb utveckling
- I staging/produktion: Strikt tenant-isolation genom Prisma-middleware och Supabase RLS

För API-endpoints kan du använda:

```typescript
import { withTenantIsolation } from '@/lib/tenant-utils';

export default withTenantIsolation(async function handler(req, res) {
  const { prisma, organizationId } = req;
  // prisma-klienten är nu automatiskt tenant-isolerad
});
```

För klient-komponenter eller serverfunktioner:

```typescript
import { createTenantPrismaClient } from '@/lib/tenant-utils';

const organizationId = '123';
const prisma = createTenantPrismaClient(organizationId);
// Nu filtreras alla queries automatiskt baserat på organizationId
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

## Miljöhantering

Projektet använder separata miljöer och databasschemata för utveckling, testning, staging och produktion:

### Development (Utveckling)
- `.env.local` används för lokal utveckling
- Kör utvecklingsservern med `npm run dev`
- Loggar är aktiverade för debugging
- Mock-data kan användas för snabb utveckling
- Använder `dev`-schemat i databasen
- Kan inte påverka produktionsdata

### Testing (Testning)
- `.env.test` används för testmiljön
- Kör tester med `npm run test`
- Använder `test`-schemat i databasen
- Isolerar testdata från produktionsdata
- Testverktyg finns i `src/lib/test/testUtils.ts`

### Staging (Förproduktion)
- `.env.staging` används för staging-miljön
- Kör med `npm run dev:staging` för lokal staging-miljö
- Bygg med `npm run build:staging` för deployment
- Använder `staging`-schemat i databasen
- Produktionslik miljö utan risk att påverka produktionsdata

### Production (Produktion)
- `.env.production` används för produktionsmiljön
- Kör med `npm run build && npm start`
- Minimala loggar för prestanda
- Mock-data inaktiveras automatiskt
- Använder `public`-schemat i databasen (standard)
- Skyddsmekanism förhindrar utveckling/test-verktyg från att påverka produktionsdata

## Databasschema

Varje miljö använder ett separat schema i databasen:
- `public` - Produktionsdata
- `staging` - Stagingdata
- `dev` - Utvecklingsdata
- `test` - Testdata

Detta ger fullständig isolering mellan miljöerna, så att du kan utveckla och testa utan risk att skada produktionsdata.

## Kopiering av produktionsdata

För att få realistisk data att arbeta med i test/utvecklingsmiljöer finns det script för att kopiera data från produktionen:

```bash
# Kopiera produktionsdata till utvecklingsmiljön
npm run copy-prod-to-dev

# Kopiera produktionsdata till testmiljön
npm run copy-prod-to-test

# Kopiera produktionsdata till staging-miljön
npm run copy-prod-to-staging
```

Dessa script är säkra att använda eftersom:
1. De kontrollerar att måldatabasen inte är produktionsdatabasen
2. De ber om bekräftelse innan data raderas
3. De kopierar data till rätt schema baserat på miljöinställningar

## Miljödetektering

I koden kan du använda hjälpfunktioner från `src/lib/env.ts` för att identifiera aktuell miljö:

```typescript
import { isDevelopment, isTest, isStaging, isProduction, isProductionDatabase } from '@/lib/env';

// Kontrollera miljö
if (isDevelopment()) {
  // Utvecklingsspecifik kod
}

// Skydda produktionsdata
if (isProductionDatabase()) {
  throw new Error('Denna operation är inte tillåten i produktionsdatabasen');
}
```

## Test-mode i utvecklingsmiljö

För att hantera mockad data säkert:

```typescript
import { isMockModeEnabled, enableMockMode, disableMockMode } from '@/lib/mock-control';

// Kontrollera om mock-läge är aktivt
if (isMockModeEnabled()) {
  // Använd mockad data
} else {
  // Använd riktig data
}
```

I React-komponenter:

```typescript
import { useMockMode } from '@/lib/mock-control';

function MyComponent() {
  const { mockEnabled, enableMock, disableMock } = useMockMode();
  
  return (
    <div>
      {mockEnabled ? 'Mock aktiverat' : 'Mock inaktiverat'}
      <button onClick={mockEnabled ? disableMock : enableMock}>
        {mockEnabled ? 'Inaktivera' : 'Aktivera'} mock
      </button>
    </div>
  );
}
```

## Testning

För att testdata inte ska blandas med produktionsdata följer vi dessa riktlinjer:

1. Använd testverktyg från `src/lib/test/testUtils.ts` för att skapa och hantera testdata
2. Alla testdata i databasen ska vara markerade med prefix "TEST_" för enkelt rensande
3. Testmiljön använder ett separat schema i databasen för att isolera data
4. Använd `seedTestDatabase()` för att skapa testdata och `cleanupTestDatabase()` för att rensa efter tester
5. Miljöhantering genom `src/lib/env.ts` säkerställer att testverktyg inte kan köras i produktion

För att köra tester:

```bash
# Kör alla tester
npm run test

# Kör enskilda testfiler
npm run test -- -t "filnamn"

# Kör tester med watch-läge
npm run test:watch
```

## Email Confirmation Links

När en användare registrerar sig skickar Supabase ett bekräftelsemail med en länk tillbaka till din applikation. Som standard använder dessa länkar Supabase Site URL-konfiguration som måste uppdateras för varje miljö.

### Fixa Email Confirmation Links

Bekräftelsemejlen har för närvarande länkar som pekar på `localhost:3000` istället för din produktionsdomän. För att fixa detta, kör scriptet:

```bash
# För produktion
npm run update-site-url:prod
```

## Stripe Integration och Betalningshantering

Projektet använder Stripe för prenumerationer och betalningshantering. För att utveckla och testa Stripe-funktionalitet lokalt krävs vissa förberedelser.

### Förutsättningar för Stripe-utveckling

1. **Stripe CLI**:
   - Installera Stripe CLI för att testa webhooks lokalt
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Windows: Ladda ner från [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - Linux: Se [Stripe CLI installation](https://stripe.com/docs/stripe-cli#install)

2. **Logga in på Stripe**:
   ```bash
   stripe login
   ```
   Följ instruktionerna för att koppla ihop CLI med ditt Stripe-konto.

3. **Lyssna på Webhooks** för att vidarebefordra events till din lokala utvecklingsmiljö:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```
   Detta startar en lyssnare som tar emot events från Stripe och skickar dem till din lokala webhook-endpoint.

### Miljövariabler för Stripe

För att Stripe ska fungera behöver du dessa variabler i din `.env.development` eller `.env.local` fil:

```
# Stripe - Development (Test Keys)
STRIPE_SECRET_KEY="sk_test_ditt_test_api_key"
STRIPE_WEBHOOK_SECRET="whsec_din_webhook_secret"
STRIPE_PORTAL_CONFIGURATION_ID="bpc_din_portal_konfigurations_id" eller "test_..."
STRIPE_PRICE_ID_BASIC_MONTHLY="price_id_for_basic_monthly"
STRIPE_PRICE_ID_STANDARD_MONTHLY="price_id_for_standard_monthly"
STRIPE_PRICE_ID_PREMIUM_MONTHLY="price_id_for_premium_monthly"
STRIPE_PRICE_ID_BASIC_YEARLY="price_id_for_basic_yearly"
STRIPE_PRICE_ID_STANDARD_YEARLY="price_id_for_standard_yearly"
STRIPE_PRICE_ID_PREMIUM_YEARLY="price_id_for_premium_yearly"
```

### Testa Betalningsflödet

För att testa det kompletta betalningsflödet:

1. Starta utvecklingsservern: `npm run dev`
2. Starta webhook-lyssnaren i en annan terminal: `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`
3. Navigera till prenumerationssidan i din app
4. Använd Stripe testkortnummer för att genomföra en testbetalning:
   - Kort som lyckas: `4242 4242 4242 4242`
   - Kort som kräver 3D Secure: `4000 0000 0000 3220`
   - Kort som avvisas: `4000 0000 0000 9995`
   - [Fler testkort](https://stripe.com/docs/testing#cards)

5. I terminalen med webhook-lyssnaren bör du se events som `checkout.session.completed` och `invoice.payment_succeeded`

### Stripe-schemat i Supabase

Kunden skapas automatiskt i Stripe när en organization registreras. När en prenumeration köps, sparas denna i `subscription`-tabellen i databasen med följande Stripe-specifika fält:

- `stripeCustomerId` - ID för kunden i Stripe (börjar med "cus_")
- `stripeSubscriptionId` - ID för prenumerationen i Stripe (börjar med "sub_")
- `stripePriceId` - ID för priset/planen i Stripe (börjar med "price_")

### Miljöspecifika Konfigurationer

- **Development**: Använder test-nycklar och utvecklingsmiljön på Stripe
- **Staging**: Använder test-nycklar men en separat webhook och portal-configuration
- **Production**: Ska använda live-nycklar och produktionsmiljön på Stripe

### Konfigurera Middleware för Prenumerationskontroll

Systemet använder en middleware för att kontrollera prenumerationsstatus och omdirigera användare till prenumerationssidan om de försöker nå skyddade resurser utan aktiv prenumeration.

För att aktivera prenumerationskontroll i alla miljöer:

1. **Standardkonfiguration**:
   ```bash
   # För mindre strikt kontroll i utvecklingsmiljön
   # Lägg till i .env.development
   STRICT_SUBSCRIPTION_CHECK=false
   
   # För strikt kontroll i staging/produktion
   # Lägg till i .env.staging och .env.production
   STRICT_SUBSCRIPTION_CHECK=true
   ```

2. **Testa middleware**: Du kan testa hur middleware fungerar i utvecklingsmiljön genom att ställa in:
   ```bash
   # Lägg till i .env.local för att testa
   STRICT_SUBSCRIPTION_CHECK=true
   ```

### Onboarding-flödet för nya föreningar

Flödet för att skapa en ny förening och aktivera prenumeration ser ut så här:

1. **Användarregistrering**: Användaren registrerar sig på `/register`
2. **Skapa förening**: Användaren skapar en BRF på `/create-organization`
3. **Välj prenumeration**: Användaren omdirigeras automatiskt till `/subscription` för att välja plan
4. **Betalning**: Användaren genomför betalning via Stripe (faktura eller kort)
5. **Framgång**: Användaren kommer till `/subscription/success` och kan sedan använda systemet

Middleware säkerställer att användaren inte kan kringgå prenumerationssteget.

### Felsökning för Stripe och Onboarding

Om du stöter på problem med Stripe-integrationen eller onboarding av kunder, kontrollera följande:

1. **"Access to storage is not allowed from this context" fel**:
   - Detta kan uppstå i utvecklingsmiljön på grund av cookies eller localStorage-restriktioner
   - Lösning: Använd URL-parametrar istället för localStorage genom att lägga till `?organizationId=[DITT_ORG_ID]` till prenumerationssidan
   - Exempel: `http://localhost:3000/subscription?organizationId=123`

2. **Favicon 500-fel**:
   - Detta kan uppstå om favicon.ico inte finns i public-mappen
   - Lösning: Se till att en giltig favicon.ico finns i public/-mappen
   - Alternativt: Omstarta Next.js-servern helt

3. **Fastnar i redirect-loop mellan login och dashboard**:
   - Detta kan bero på middleware eller auth-relaterade problem
   - Tillfällig lösning: Inaktivera middleware i utvecklingsläget (redan gjort)
   - Permanent lösning: Felsök auth-logiken och säkerställ att localStorage-anrop är wrapped i try-catch

4. **Problem med Stripe webhook-lyssnaren**:
   - Se till att Stripe CLI är installerat och körs med `npm run stripe:webhook`
   - Kontrollera att webhook-hemligheten är korrekt i .env-filen

5. **Test av betalningsflödet**:
   - Använd testkortnummer när du testar betalningsflödet, se avsnittet om [Testa Betalningsflödet](#testa-betalningsflödet)
   - Kontrollera webhook-händelser i Stripe Dashboard

För en komplett översikt av Stripe-integrationen, använd `verify:onboarding`-skriptet:
```bash
npm run verify:onboarding
```

## Säker hantering av API-nycklar
