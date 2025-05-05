# Automatiska kodkvalitetskontroller

Detta dokument beskriver de automatiska kontroller som implementerats i projektet för att säkerställa hög kodkvalitet och konsekvent TypeScript-användning.

## Automatiska kontroller

Följande automatiska kontroller är konfigurerade:

### 1. Pre-commit hook

Körs automatiskt innan varje commit:

- Linting med ESLint för att kontrollera kodstandarder
- Formatering med Prettier för att säkerställa konsekvent kodstil
- TypeScript-typkontroll för att hitta typfel tidigt

För att köra manuellt:
```bash
npm run pre-commit
```

### 2. Pre-push hook

Körs automatiskt innan koden pushas till remote:

- Kör alla tester för att säkerställa att inget är trasigt
- Utför fullständig TypeScript-validering

För att köra manuellt:
```bash
.husky/pre-push
```

### 3. Kodkvalitetskontroll

Ett omfattande skript som kontrollerar alla aspekter av kodkvalitet:

- TypeScript-typkontroll
- TypeScript-validering
- Linting
- Formatering
- Komponentanalys (identifierar stora komponenter)

För att köra:
```bash
# Kör alla kontroller
npm run quality-check

# Kör och försök åtgärda problem
npm run quality-check:fix

# Kör på specifik katalog
npm run quality-check -- --path=src/components/auth
```

### 4. CI Workflow

En GitHub Actions workflow som körs på varje pull request:

- Utför alla kodkvalitetskontroller
- Laddar upp loggar som artefakter
- Kommenterar på PR med resultat

## Override vid behov

I vissa undantagsfall kan du behöva åsidosätta dessa kontroller:

### Kringgå pre-commit hook

```bash
git commit -m "Commit meddelande" --no-verify
```

### Kringgå pre-push hook

```bash
git push --no-verify
```

**OBS: Använd dessa override-alternativ med försiktighet och endast i nödfall.**

## Felsökning

### Om pre-commit eller pre-push inte körs

Kontrollera att hooks är konfigurerade korrekt:

```bash
# Installera hooks om de saknas
npm run prepare
```

### Om TypeScript-valideringen misslyckas

Använd ts:validate med fix-flaggan:

```bash
npm run ts:validate --fix
```

### Diagnostikverktyg

För att analysera stora komponenter:

```bash
npm run analyze-component src/components/MinStorKomponent.tsx
```

För att skapa en refaktoreringsstruktur:

```bash
npm run refactor src/components/MinStorKomponent.tsx
```

## Rekommenderad arbetsprocess

1. Kör `npm run quality-check` innan du påbörjar en pull request
2. Åtgärda alla problem med `npm run quality-check:fix`
3. Lita på pre-commit och pre-push hooks för dagligt arbete
4. Refaktorera stora komponenter när de identifieras

Vi rekommenderar att alltid låta de automatiska kontrollerna köra. Att kringgå dem bör vara ett undantag, inte en regel.
