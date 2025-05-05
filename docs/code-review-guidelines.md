# Kodgranskningsriktlinjer

Detta dokument beskriver standarder och rutiner för kodgranskning i BRF-SaaS-projektet.

## Syfte

Kodgranskningar utförs för att:
1. Säkerställa kodkvalitet
2. Förebygga buggar
3. Dela kunskap i teamet
4. Upprätthålla konsekventa standarder

## Före granskning

Innan du skickar in kod för granskning:

1. Kör typvalidering: `npm run type-check`
2. Kör linting: `npm run lint`
3. Kör formattering: `npm run format`
4. Kör tester: `npm run test`
5. Granska din egen diff och säkerställ att ändringarna är relevanta

## Granskningsområden

### TypeScript

- [ ] **Strikt typning**: Använder koden explicita typer för variabler, parametrar och returvärden?
- [ ] **Inga `any`**: Används `any` endast när det är absolut nödvändigt, och med motivering?
- [ ] **Nullcheckar**: Hanterar koden `null` och `undefined` korrekt?
- [ ] **Importeringar**: Används centraliserade typimporter från `@/types`?
- [ ] **Typsäkra API-anrop**: Är API-anrop och svarshantering korrekt typsatta?

### React & Komponenter

- [ ] **Komponentstorlek**: Är komponenter lagom stora (under 200 rader)?
- [ ] **Ansvar**: Har varje komponent ett tydligt och enskilt ansvar?
- [ ] **Props**: Finns tydliga Props-gränssnitt med dokumentation?
- [ ] **Tillstånd**: Hanteras tillstånd korrekt (React hooks, kontexts, etc.)?
- [ ] **Prestandaoptimering**: Är memo, useCallback, useMemo använda där det är lämpligt?

### Kodstruktur & Läsbarhet

- [ ] **Namngivning**: Är variabler, funktioner och komponenter tydligt namngivna?
- [ ] **Funktioner**: Har funktioner en tydlig uppgift och är rimligt stora?
- [ ] **Kommentarer**: Är komplex kod eller affärslogik kommenterad?
- [ ] **DRY-princip**: Undviker koden upprepning?
- [ ] **Kodstil**: Följer koden projektets stilregler?

### Testning

- [ ] **Testtäckning**: Finns lämpliga tester för nya funktioner eller bugfixar?
- [ ] **Testbarhet**: Är koden skriven på ett sätt som gör den testbar?
- [ ] **Testfall**: Täcker testerna både normala och felaktiga användningsfall?

### Säkerhet & Felhantering

- [ ] **Felhantering**: Finns lämplig felhantering?
- [ ] **Användardata**: Hanteras användarinput säkert?
- [ ] **Autentisering**: Respekteras behörighetskontroller?

## Granskningsprocess

1. **Förstå syftet**: Börja med att förstå vad ändringarna avser att uppnå
2. **Kör koden**: Om möjligt, testa ändringarna lokalt
3. **Granska små delar**: Gå igenom ändringarna filen för fil
4. **Ge konstruktiv feedback**:
   - Börja med positiv feedback
   - Var specifik
   - Förklara varför (inte bara vad)
   - Föreslå alternativ
5. **Kategorisera problem**:
   - Blockerande: Måste åtgärdas innan sammanfogning
   - Större: Bör åtgärdas innan sammanfogning
   - Mindre: Kan åtgärdas i framtiden
   - Nitpicking: Stilmässiga eller smakfrågor

## Uppföljning

1. Diskutera feedback direkt om något är oklart
2. Implementera ändringar baserat på feedback
3. Markera kommentarer som lösta när de åtgärdats
4. Begär en ny granskning vid behov

## Exempel

### Bra granskningskommentar:

> Denna komponent har blivit ganska stor (300+ rader). Kan vi överväga att bryta ut `renderUserList` till en separat komponent `UserList`? Det skulle göra huvudkomponenten mer fokuserad och lättare att testa. Använd gärna vårt refactor-script för att hjälpa med strukturen: `npm run refactor src/components/UserDashboard.tsx`

### Mindre bra granskningskommentar:

> Detta är för stort. Dela upp det.

## Kodgranskningsmall

Använd följande mall i PR-kommentarer för omfattande granskningar:

```markdown
## Kodgranskning

### Styrkor
- Punkt 1
- Punkt 2

### Förbättringsområden
- [Blockerande] Beskrivning av problem
- [Större] Beskrivning av problem
- [Mindre] Beskrivning av problem

### Frågor
- Fråga 1?
- Fråga 2?

### Sammanfattning
Övergripande bedömning och nästa steg.
``` 