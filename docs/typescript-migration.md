# Migrering till striktare TypeScript

Detta dokument beskriver processen för att migrera BRF-SaaS-projektet till striktare TypeScript-regler för att minska byggfel på Vercel.

## Bakgrund

Projektet har drabbats av typfel som upptäcks vid byggning på Vercel men inte lokalt. För att lösa detta har vi:

1. Uppdaterat `tsconfig.json` med striktare inställningar
2. Centraliserat typdefinitioner
3. Infört verktyg för att analysera och refaktorera stora komponenter

## Migreringsplan

### Steg 1: Åtgärda kritiska byggfel

Börja med att åtgärda fel som bryter byggen:

```bash
# Kör typvalidering för att identifiera fel
npm run ts:validate

# Sortera fel efter fil för att prioritera
cat logs/typescript-errors.log | grep -o "^[^(]*" | sort | uniq -c | sort -nr
```

Prioritera filer baserat på:
1. Antal fel
2. Om de är del av kritiska användarflöden
3. Storlek på filen (större filer kan behöva refaktoreras först)

### Steg 2: Refaktorera stora komponenter

Identifiera stora komponenter:

```bash
find src -type f -name "*.tsx" -exec wc -l {} \; | sort -nr | head -20
```

För varje stor komponent:

1. Analysera komponenten:
   ```bash
   npm run analyze-component src/components/LargeComponent.tsx
   ```

2. Skapa ny struktur:
   ```bash
   npm run refactor src/components/LargeComponent.tsx
   ```

3. Migrera koden manuellt till den nya strukturen:
   - Flytta huvudkomponentlogik
   - Bryt ut underkomponenter
   - Skapa en custom hook för tillstånd

### Steg 3: Uppdatera importeringar

Sök efter direkta typimporter:

```bash
grep -r "from '@/types/" --include="*.ts*" src/
```

Ändra till centraliserade importeringar:

```typescript
// Före
import { Handbook } from '@/types/handbook';
import { UserRole } from '@/types/user';

// Efter
import { Handbook, UserRole } from '@/types';
```

### Steg 4: Åtgärda återstående typfel

Använd `ts:validate` skriptet med fix-läge:

```bash
npm run ts:validate --fix
```

Vanliga fel att åtgärda:

1. **Saknade parametertyper**
   ```typescript
   // Före
   function processUser(user) {
     return user.id;
   }
   
   // Efter
   function processUser(user: User): string {
     return user.id;
   }
   ```

2. **Any-användning**
   ```typescript
   // Före
   const data: any = await fetchData();
   
   // Efter
   const data: ApiResponse<UserData> = await fetchData();
   ```

3. **Null/Undefined-kontroller**
   ```typescript
   // Före
   function getName(user) {
     return user.name;
   }
   
   // Efter
   function getName(user: User | null): string {
     return user?.name ?? '';
   }
   ```

### Steg 5: Kodgranskningsrutiner

Använd vår PR-mall och följ dessa riktlinjer:

1. Kör typkontroll innan du skapar en PR:
   ```bash
   npm run type-check
   ```

2. Kör formattering och linting:
   ```bash
   npm run format
   npm run lint
   ```

3. Följ checklistan i PR-mallen

## Verktyg och resurser

### Analysverktyg

- **component-splitter.js**: Analyserar och föreslår refaktoreringar
- **refactor-component.js**: Skapar strukturen för refaktorerade komponenter
- **ts-validate.js**: Validerar och rapporterar typfel

### Nya kommandon i package.json

- `npm run ts:validate`: Validera TypeScript utan att misslyckas
- `npm run ts:validate --fix`: Försök åtgärda typfel automatiskt
- `npm run analyze-component`: Analysera en komponent
- `npm run refactor`: Skapa struktur för refaktorering

### Dokumentation

- [TypeScript-standarder](typescript-standards.md): Projektets TypeScript-standarder
- [Komponentmall](../src/components/templates/ComponentTemplate.tsx): Mall för nya komponenter

## Tidsplan

1. **Vecka 1**: Åtgärda kritiska byggfel
2. **Vecka 2**: Refaktorera de största komponenterna
3. **Vecka 3**: Uppdatera importeringar och åtgärda återstående fel
4. **Vecka 4**: Färdigställa och granska 