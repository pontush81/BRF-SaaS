# Refaktoreringsstrategi för BRF-SaaS

## Identifierade komponenter som kan dra nytta av liknande mönster

Based på genomgång av koden har jag identifierat följande komponenter och områden som kan dra nytta av liknande refaktoreringsmönster som användes för `SignInForm`:

### 1. `SignUpForm` (337 rader)

Denna komponent är mycket stor och har flera ansvarsområden:

- Hantering av formulärdata
- Direkt integration med Supabase-klient
- Hantering av error meddelanden
- Generering av organisationsslug
- Nätverksanrop till API:er

**Rekommendation:**

- Extrahera logiken för användarregistrering till en `useSignUp` hook
- Separera formuläret i mindre komponenter (PersonalInfoForm, OrganizationInfoForm)
- Skapa återanvändbara hjälpfunktioner (t.ex. generateSlug)

### 2. `AuthContext` och `SessionContext` (duplicerad logik)

Det finns två separata kontexter som hanterar användarautentisering:

- `src/contexts/AuthContext.tsx` (320 rader)
- `src/context/SessionContext.tsx` (56 rader)
- `src/hooks/useAuth.ts` (20 rader)

**Rekommendation:**

- Konsolidera dessa till en enda AuthContext för hela applikationen
- Flytta logik som `fetchUserData`, `signOut`, `refreshSession` till separata hooks
- Definiera tydliga ansvarsområden för denna kontext

### 3. `MainNavigation` (269 rader)

Denna komponent hanterar:

- Användarmenyer
- Navigeringslänkar
- Responsiv design (mobil/desktop)
- Utloggningslogik

**Rekommendation:**

- Separera i mindre komponenter (UserMenu, MobileNavigation, NavigationLinks)
- Skapa en `useNavigation` hook för att hantera navigationstillstånd och logik

### 4. Supabase-integrationer

Det finns flera olika mönster för att skapa och använda Supabase-klienter:

- `src/supabase-client/index.ts` (428 rader)
- Direkt skapande av Supabase-klienter i komponenter
- Manuell hantering av cookies/tokens i olika komponenter

**Rekommendation:**

- Skapa en gemensam `useSupabase` hook som hanterar alla Supabase-operationer
- Standardisera autentiseringshantering och token-uppdatering

## Duplicerad logik som kan extraheras

1. **Nätverksdiagnostik**

   - Liknande kod i både SignInForm och SignUpForm
   - Skapa en central `useNetworkDiagnostics` hook för att återanvända denna funktionalitet

2. **Formulärhantering**

   - Både SignInForm och SignUpForm hanterar formulärlogik internt
   - Skapa en generisk `useForm` hook för att hantera validering, submithantering osv

3. **Felhantering**

   - Implementera en central `useErrorHandling` hook som kan hantera olika typer av fel
   - Skapa återanvändbara felkomponenter

4. **Hjälpfunktioner**
   - Extrahera funktioner som sluggenerering till en utils-fil
   - Skapa hjälpfunktioner för vanliga operationer som cookie-hantering

## Prioriterad åtgärdsplan

1. **Konsolidera autentiseringslogik**

   - Slå ihop AuthContext och SessionContext
   - Skapa en standardiserad hook för Supabase-operationer

2. **Refaktorera SignUpForm**

   - Följ mönstret från SignInForm refaktoreringen
   - Bryt ut till useSignUp hook och mindre komponenter

3. **Skapa återanvändbar nätverksdiagnostik**

   - Baserat på befintlig kod i SignInForm

4. **Refaktorera MainNavigation**
   - Bryt ut i mindre komponenter med tydliga ansvarsområden

## Fördelar med rekommenderad refaktorering

- **Förbättrad kodorganisation**: Tydliga ansvarsområden för varje komponent och hook
- **Ökad återanvändbarhet**: Hooks och hjälpfunktioner kan användas i hela applikationen
- **Förenklad testning**: Mindre komponenter är lättare att testa
- **Enklare underhåll**: Mindre filer med tydliga ansvarsområden
- **Bättre prestanda**: Optimerad rendering med väldefinierade tillståndsuppdateringar
