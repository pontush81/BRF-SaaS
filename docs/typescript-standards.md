# TypeScript-standarder

Detta dokument beskriver standarder och bästa praxis för TypeScript i BRF-SaaS-projektet.

## Grundläggande principer

1. **Strikt typning**: Använd alltid explicita typer för variabler, parametrar och returvärden.
2. **Undvik `any`**: Använd aldrig `any` utan god motivering.
3. **Små komponenter**: Dela upp stora komponenter i mindre, fokuserade komponenter.
4. **Centraliserade typer**: Använd typer från `@/types` när möjligt.

## Typhantering

### Typdeklarationer

- Använd `interface` för objekt som kommer att utökas
- Använd `type` för unioner, primitiver och tupler
- Placera delade typer i lämplig fil i `src/types/`

```typescript
// Bra
interface User {
  id: string;
  name: string;
  email: string;
}

// Bra
type UserRole = 'ADMIN' | 'EDITOR' | 'MEMBER';

// Dåligt
const user: any = { id: '123', name: 'Test' };
```

### Nullcheckar

Med `strictNullChecks` påslagen måste du hantera `null` och `undefined` korrekt:

```typescript
// Bra
function getUserName(user: User | null): string {
  return user?.name ?? 'Gäst';
}

// Dåligt
function getUserName(user: User): string {
  return user.name; // Kan krascha om user är null
}
```

### Generics

Använd generics för att skapa återanvändbara komponenter:

```typescript
// Bra
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

// Användning
const firstUser = getFirstItem<User>(users);
```

## Komponentstruktur

### Props

- Definiera alltid ett Props-interface för komponenter
- Dokumentera props med JSDoc-kommentarer
- Markera valfria props med '?'

```typescript
interface ButtonProps {
  /** Knappens textetikett */
  label: string;
  /** Händelse vid klick */
  onClick: () => void;
  /** Visuell variant av knappen */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Om knappen är i inaktiverat läge */
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  // Komponentimplementation
};
```

### Filstruktur

För stora komponenter, använd följande katalogstruktur:

```
ComponentName/
├── index.ts                  # Re-exporterar komponenten
├── ComponentName.tsx         # Huvudkomponenten
├── ComponentNameTypes.ts     # Typdefinitioner
├── useComponentNameState.ts  # Tillståndshook
└── components/               # Underkomponenter
    ├── SubComponent1.tsx
    ├── SubComponent2.tsx
    └── ...
```

## API-anrop och datahantering

### API-svar

Använd vår centraliserade `ApiResponse`-typ:

```typescript
import { ApiResponse } from '@/types';

const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
  // Implementation
};
```

### Felhantering

```typescript
try {
  const response = await fetchUsers();
  if (!response.success) {
    throw new Error(response.error || 'Okänt fel');
  }
  return response.data;
} catch (error) {
  // error är av typen 'unknown' i TypeScript 4.4+
  if (error instanceof Error) {
    console.error(error.message);
  }
  return [];
}
```

## Verktyg och hjälp

### Analysera komponenter

```bash
# Analysera en stor komponent för att identifiera refaktoreringsmöjligheter
npm run analyze-component src/components/LargeComponent.tsx
```

### Refaktorera komponenter

```bash
# Skapa en ny komponentstruktur för att dela upp en stor komponent
npm run refactor src/components/LargeComponent.tsx
```

### Typvalidering

```bash
# Validera och rapportera typfel
npm run ts:validate

# Försök att automatiskt åtgärda typfel
npm run ts:validate --fix
```

## Kontrollista för kodgranskning

- [ ] Strikta typer används konsekvent
- [ ] Inga `any`-typer utan dokumentation
- [ ] Komponenter är lagom stora (mindre än 200 rader)
- [ ] Korrekt felhantering
- [ ] Centraliserade typer används när möjligt
- [ ] Lämplig komponentstruktur används 