# SignInForm

En robust och anpassningsbar inloggningskomponent med stöd för avancerad nätverksdiagnostik och felsökning.

## Funktioner

- Standardinloggning med e-post och lösenord via Supabase
- Alternativ proxy-baserad inloggning när direktanslutning inte fungerar
- Automatisk nätverksstatuskontroll
- Detaljerad diagnostikvy för felsökning
- Utförlig felhantering

## Struktur

Komponenten är strukturerad enligt följande mönster för bättre underhållbarhet:

```
SignInForm/
├── index.ts                    # Centraliserad export
├── SignInForm.tsx              # Huvudkomponent
├── SignInFormTypes.ts          # Typdefinitioner
├── useSignInFormState.ts       # Tillståndshook
├── README.md                   # Dokumentation
├── components/                 # Underkomponenter
│   ├── index.ts                # Export av underkomponenter
│   ├── DebugToggle.tsx         # Debug-lägesknapp
│   ├── ErrorMessage.tsx        # Felmeddelanden
│   ├── LoginForm.tsx           # Inloggningsformulär
│   ├── NetworkStatusCheck.tsx  # Nätverksstatuskontroll
│   └── __tests__/              # Komponenttester
├── handlers/                   # Händelsehanterare
│   └── signInHandlers.ts       # Inloggningsfunktioner
├── utils/                      # Hjälpfunktioner
│   ├── authUtils.ts            # Autentiseringshjälp
│   └── networkUtils.ts         # Nätverksrelaterade hjälpfunktioner
└── __tests__/                  # Huvudkomponenttester
```

## Användning

Importera komponenten:

```tsx
import { SignInForm } from '@/components/auth/SignInForm';
```

Använd komponenten i en sida:

```tsx
export default function LoginPage() {
  return (
    <div>
      <h1>Logga in</h1>
      <SignInForm />
    </div>
  );
}
```

## Anpassning

Komponenten får för närvarande inga props, men kan senare utökas med:

- Anpassad omdirigeringsväg
- Grafisk profilering
- Förfyllda värden
- Alternativa autentiseringsmetoder

## Nätverksdiagnostik

I debug-läge visar komponenten detaljerad nätverksdiagnostik:

- Anslutningsstatus till Supabase
- Proxy-anslutningsstatus
- Detaljerade felmeddelanden
- Serverstatus och versionsinformation
- Cookie-information

Detta hjälper till att identifiera problem relaterade till anslutning, autentisering och sessionshantering.

## Testning

Alla komponenter har omfattande testtäckning:

```bash
npm run test -- --testPathPattern=SignInForm
```

## Beroenden

Komponenten använder:

- Supabase för autentisering
- Next.js för routing
- Mantine för UI-komponenter
- Tabler-ikoner
