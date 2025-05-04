# Mock Database & Development Tools

Detta dokument beskriver hur vi hanterar mockad data, tenant-isolation och utvecklingsverktyg i BRF-SaaS projektet.

## Översikt

För att underlätta utveckling utan att riskera produktionsdata har vi implementerat ett robust system för att:

1. **Mocka data**: Simulera autentisering och databasoperationer i utvecklingsmiljön
2. **Tenant-isolation**: Isolera data mellan olika BRF:er i produktions- och staging-miljöer
3. **Utvecklingsverktyg**: Verktyg som hjälper utvecklare att kontrollera mockad data och testa funktionalitet

## Mock-data-system

### Grundläggande principer

- Mock-data används **endast** i utvecklingsmiljö, aldrig i produktion
- En tydlig visuell indikator visar när mock-läge är aktivt
- Mockad data ska vara realistisk och följa samma struktur som produktionsdata
- Det ska vara lätt att växla mellan mockad och riktig data under utveckling

### Visuell indikator

Vi har implementerat en global indikator i `src/app/layout.tsx` som visar när applikationen körs i utvecklingsläge:

```tsx
{isDevelopment && (
  <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black text-center z-50 py-1 text-sm font-bold">
    ⚠️ UTVECKLINGSMILJÖ - Mockad data kan användas ⚠️
  </div>
)}
```

### Mock-kontroll

I `src/lib/mock-control.ts` har vi implementerat funktioner för att kontrollera mock-läget:

```typescript
// Kontrollera om mock-läge är aktivt
isMockModeEnabled(): boolean

// Aktivera mock-läge (endast i utveckling)
enableMockMode(): boolean

// Inaktivera mock-läge
disableMockMode(): boolean

// React hook för att använda mock-läge
useMockMode(): { mockEnabled: boolean, enableMock: () => void, disableMock: () => void }
```

Dessa funktioner säkerställer att mock-läge endast kan aktiveras i utvecklingsmiljö och aldrig i produktion.

### Mockad Supabase-klient

I `src/supabase-client.ts` och `src/supabase-server.ts` har vi mockade versioner av Supabase-klienten för både klient- och server-sidan:

- **Klientsidan**: Mockad autentisering som låter dig "logga in" utan riktig Supabase-anslutning
- **Serversidan**: Mockad användarsession för API-endpoints

## Testdata-generering

### Seed-script

Vi har utvecklat ett omfattande seed-script i `prisma/seed.ts` som genererar testdata:

- Organisationer (BRF:er)
- Användare och deras roller
- Fastigheter och lägenheter
- Dokument och ärenden
- Prenumerationer

Kör scriptet med:

```bash
npm run prisma:seed
```

Eller återställ databasen helt och generera ny data:

```bash
npm run db:reset
```

### Struktur på testdata

Testdata innehåller svenska värden och realistiska fastighetsdata:

- Gatuadresser från `faker.js` på svenska
- Lägenhetsnummer i svenskt format
- Bostadsyta i kvadratmeter
- Svenska kategorier för dokument

## Databas-synkronisering

### Schema-synkronisering

Vi har implementerat verktyg för att synkronisera databasschema mellan miljöer:

```typescript
// src/scripts/sync-schema.ts
// Användning: ts-node src/scripts/sync-schema.ts [direction] [environment]
```

Detta verktyg:
1. Extraherar modelldefinitioner från schema-filer
2. Behåller miljöspecifika generator- och datasource-konfigurationer
3. Synkroniserar model- och enum-definitioner

### API för databashantering

API-endpoints för utvecklingsdatabasen:

- `GET /api/dev/check-db-connection`: Kontrollera databasanslutning
- `POST /api/dev/reset-database`: Återställ databasen och skapa ny testdata

## Tenant-isolation

### Prisma client med tenant-isolation

I `src/lib/tenant-utils.ts` har vi skapat verktyg för att säkerställa tenant-isolation:

```typescript
// Skapa en tenant-isolerad Prisma-klient
createTenantPrismaClient(organizationId: string)

// Middleware för API-routes som automatiskt isolerar tenant
withTenantIsolation(handler: (req, res) => Promise<void>)
```

Dessa verktyg:
1. Filtrerar automatiskt alla queries baserat på `organizationId`
2. Lägger till `organizationId` i alla create-operationer
3. Konfigurerar Prisma-klienten för olika miljöer

### Implementering

Tenant-isolation implementeras på olika sätt beroende på miljö:

- **Utveckling**: Minimal isolation för enkel utveckling
- **Staging/Produktion**: Strikt isolation genom Prisma-middleware och Supabase RLS

## Utvecklingsverktyg

### Dev-Tools Dashboard

Vi har implementerat en dashboard för utvecklare i `src/app/dev-tools/page.tsx`:

- Visa och hantera mock-status
- Kontrollera databasanslutning
- Simulera inloggning/utloggning
- Återställa databasen med testdata

### Åtkomstbegränsning

Dev-Tools är endast tillgängliga i utvecklingsmiljö och visas inte i produktion:

```typescript
// Kontrollera miljö
if (getEnvironment() !== Environment.DEVELOPMENT) {
  return NextResponse.json(
    { error: 'This endpoint is only available in development' },
    { status: 403 }
  );
}
```

## Förbättringsförslag

Ytterligare förbättringar som kan implementeras:

1. **Modul för mocking av API-anrop**: Generell lösning för att mocka externa API-anrop
2. **Exempelfiler för testdata**: Möjlighet att ladda upp och testa med exempelfiler
3. **Prestandatestning**: Verktyg för att benchmarka databasqueryer med och utan tenant-isolation
4. **Scenario-baserad testning**: Fördefinierade scenarier för att testa specifika flöden
5. **Mock-profiler**: Möjlighet att spara och ladda olika mock-konfigurationer

## Vanliga frågor

### Hur vet jag om jag använder mockad data?

- Kolla efter den gula bannern överst på sidan
- Besök `/dev-tools` för att se detaljerad mock-status
- Använd `isMockModeEnabled()` i koden för att kontrollera programmatiskt

### Hur återställer jag databasen med testdata?

```bash
npm run db:reset
```

### Hur synkroniserar jag schema mellan miljöer?

```bash
# Synkronisera lokalt schema till staging
npm run schema:push:staging

# Hämta schema från staging till lokal miljö
npm run schema:pull:staging
```

### Hur isolerar jag data för en specifik tenant?

```typescript
import { createTenantPrismaClient } from '@/lib/tenant-utils';

const prisma = createTenantPrismaClient('organization-id');
const users = await prisma.user.findMany(); // Automatiskt filtrerade efter organization 