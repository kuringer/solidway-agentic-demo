# Solidway - AI Asistent nakupovania (Demo)

Interaktívne demo agentic B2B nakupovania pre Solidway e-shop. Ukazuje ako by AI asistent pomáhal B2B partnerom vytvárať košík, overovať ceny cez ERP a generovať cenové ponuky.

## Spustenie

```bash
# Jednoducho otvoriť v prehliadači
open index.html

# Alebo cez lokálny server (odporúčané pre fonty)
python3 -m http.server 8080
open http://localhost:8080
```

## Čo demo ukazuje

- **Výber prevádzky** - partner má viac odberných miest, agent sa pýta pre ktoré nakupuje
- **Katalógové vs. partnerské ceny** - produkty sa pridávajú v katalógových cenách, ERP sync ich aktualizuje
- **ERP synchronizácia** - realistický multi-step sync (7s), s progress indikátorom v košíku
- **MOQ prepočet** - vinyl po 2,18m², laminát po 2,47m², agent prepočíta na celé balenia
- **Nedostupnosť + alternatívy** - agent navrhne náhradu za nedostupný produkt
- **Príslušenstvo kalkulácia** - automatický prepočet podložiek, líšt, klipov podľa plochy
- **Kupón validácia** - B2B zľava sa nedá kombinovať s kupónom
- **Cenová ponuka** - vygeneruje CP s odoslaním na email

## Štruktúra

```
css/
  tokens.css    - design tokens, fonty, farby (Solidway brand)
  layout.css    - grid, buttons, animácie
  header.css    - B2B top bar + hlavný header
  chat.css      - chat panel, tool calls, thinking
  cart.css      - košík, položky, summary
js/
  products.js   - demo produktová databáza
  chat.js       - chat rendering engine
  cart.js       - košík state + DOM rendering
  scenario.js   - scripted demo flow (7 krokov)
  app.js        - input handling, init
fonts/          - Basier Square (Solidway brand font)
CONCEPT.md      - technická analýza reálnej implementácie
```

## Nie je to produkcia

Toto je UX demo. Reálna implementácia by vyžadovala:
- API vrstvu nad CartFacade + BarIS ERP
- LLM integráciu so streaming responses
- Autentifikáciu cez B2B partner token
- Viď `CONCEPT.md` pre detailnú analýzu
