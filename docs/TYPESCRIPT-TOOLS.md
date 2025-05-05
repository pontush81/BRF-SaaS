# TypeScript-verktyg och tillvägagångssätt

Detta dokument beskriver verktygen och tillvägagångssättet vi har implementerat för att förbättra TypeScript-användningen i BRF-SaaS-projektet.

## Bakgrund

Projektet har drabbats av typfel som upptäcks vid byggning på Vercel men inte lokalt. För att lösa detta har vi implementerat striktare TypeScript-konfiguration och en rad verktyg för att hjälpa utvecklare att identifiera och åtgärda typfel.

## Verktyg

### 1. Förbättrad TypeScript-konfiguration

Vi har uppdaterat `tsconfig.json` med striktare inställningar:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2. Centraliserade typdefinitioner

Vi har skapat centraliserade typdefinitioner i `src/types/` för att återanvända typer och undvika duplicering:

- `src/types/index.ts` - Exporterar alla typer
- `src/types/handbook.ts` - Typer för handboksfunktionalitet
- `src/types/organization.ts` - Typer för organisationer
- `src/types/prisma.ts` - Typer relaterade till Prisma/databasmodeller
- `src/types/supabase.ts` - Typer för Supabase-integration

### 3. Typvalidering

Vi har förbättrat typvalidering för att identifiera och rapportera typfel:

```bash
# Kör typvalidering
npm run ts:validate

# Försök att automatiskt åtgärda typfel
npm run ts:validate --fix

# Kontinuerlig typvalidering
npm run ts:validate --watch
```

Resultat skrivs till `logs/typescript-errors.log` med detaljerade felmeddelanden.

### 4. Komponentanalys och refaktorering

Vi har skapat verktyg för att analysera och refaktorera stora komponenter:

```bash
# Analysera en komponent
npm run analyze-component src/components/LargeComponent.tsx

# Skapa struktur för refaktorering
npm run refactor src/components/LargeComponent.tsx
```

#### Vad analyze-component gör:

- Analyserar komponentstorlek
- Identifierar potentiella underkomponenter
- Hittar upprepade JSX-element
- Föreslår refaktoreringsstrategier

#### Vad refactor-component gör:

- Skapar en katalogstruktur för refaktorerad komponent
- Extraherar props-interface till en separat typfil
- Identifierar och skapar underkomponentstrukturer
- Skapar en egen state-hook för tillståndshantering
- Bevarar originalfilen som `.bak`

### 5. Commit-hooks och kvalitetskontroll

Vi har konfigurerat Husky och lint-staged för att köra typkontroll och formatering vid varje commit:

- **Pre-commit**: Kör linting och formatering
- **Pre-push**: Kör typkontroll

## Kommando-referens

| Kommando | Beskrivning |
|----------|-------------|
| `npm run type-check` | Kör TypeScript-kompilator utan att producera filer |
| `npm run ts:validate` | Kör typvalidering med detaljerad rapportering |
| `npm run ts:validate --fix` | Försöker åtgärda typfel automatiskt |
| `npm run lint` | Kör ESLint för att hitta kodproblem |
| `npm run format` | Kör Prettier för att formatera kod |
| `npm run analyze-component <file>` | Analyserar en komponent för refaktorering |
| `npm run refactor <file>` | Skapar struktur för att refaktorera en komponent |
| `npm run quality-check` | Kör alla kodkvalitetskontroller |
| `npm run quality-check:fix` | Kör alla kodkvalitetskontroller och försöker åtgärda problem |
| `npm run pre-commit` | Kör samma kontroller som pre-commit hooken |

## Automatiska kontroller

Vi har implementerat automatiska kontroller som körs vid specifika Git-händelser:

### Pre-commit hook

Körs automatiskt när du gör en commit och kontrollerar:
- Formatering (Prettier)
- Linting (ESLint)
- TypeScript-typkontroll

### Pre-push hook

Körs automatiskt när du pushar kod till remote och kontrollerar:
- Att alla tester lyckas
- Fullständig TypeScript-validering

### CI Workflow

Körs i GitHub Actions för varje pull request:
- Kör alla kodkvalitetskontroller
- Kommenterar resultatet på pull requesten
- Laddar upp eventuella felloggar som artefakter

För mer information, se [Automatiska kodkvalitetskontroller](AUTOMATIC-CHECKS.md).

## Dokumentation

Vi har skapat följande dokumentation för att hjälpa teamet:

- [TypeScript-standarder](typescript-standards.md) - Standarder och bästa praxis
- [TypeScript-migrering](typescript-migration.md) - Guide för att migrera till striktare TypeScript
- [Kodgranskningsriktlinjer](code-review-guidelines.md) - Riktlinjer för kodgranskning

## Arbetsflöde för utvecklare

1. **Varje dag**:
   - Kör `npm run type-check` för att identifiera problem
   - Åtgärda typfel när de uppstår istället för att låta dem ackumuleras

2. **När du skapar en ny komponent**:
   - Använd komponenten i `src/components/templates/ComponentTemplate.tsx` som mall
   - Definiera tydliga props-interface med JSDoc-kommentarer
   - Håll komponenter under 200 rader, dela upp vid behov

3. **När du refaktorerar en stor komponent**:
   - Kör `npm run analyze-component` för att identifiera refaktoreringsmöjligheter
   - Kör `npm run refactor` för att skapa en ny struktur
   - Implementera refaktorering enligt rekommendationerna

4. **Innan du skapar en PR**:
   - Kör `npm run type-check` för att säkerställa att det inte finns typfel
   - Kör `npm run lint` och `npm run format` för konsekvent kodstil
   - Följ checklistan i PR-mallen

## Hjälp och felsökning

Om du stöter på problem med typfel:

1. Kör `npm run ts:validate` för att få detaljerad information om felen
2. Titta i `logs/typescript-errors.log` för en fullständig lista över fel
3. För vanliga feltyper, se [TypeScript-migreringsguiden](typescript-migration.md)
4. För komplexa komponenter, använd refaktoreringsverktygen för att bryta ner dem
