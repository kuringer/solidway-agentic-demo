# Agentic B2B Shopping - Concept

## Preco je kosik v Solidway komplikovany

Cart nie je jednoduchy list poloziek. Je to **multi-system orchestracia** s tymito vrstvami:

### 1. Cenove hladiny (Price Levels)
- Kazdy B2B partner ma pridelenu cenovu hladinu
- Rovnaky produkt ma inu cenu pre roznych partnerov
- Pri zmene price level sa **prepocitaju vsetky polozky** v kosiku
- Zlavnene ceny (discount_price) maju casovu platnost (from/to)
- Zakaznicky discount navyse na to (percento, aplikovatelne na zlavnene/nezlavnene/vsetky)

### 2. BarIS - externy ERP system
- B2B ceny su v realite riadene cez BarIS (Solidway ERP)
- Pri pridani do kosika sa vytvori **paralelny kosik v BarIS**
- BarIS moze:
  - Zmenit ceny poloziek (B2B partnerske ceny)
  - Pridat polozky (automaticke prislusenstvo, povinne doplnky)
  - Zmenit mnozstva
  - Odstranit polozky
- Sync je **obojsmerny**: Venalio -> BarIS -> Venalio
- `recalculateCurrentCartByBaris()` - vytvori temp kosik v BarIS, nacita prepocitane polozky, zmaze temp kosik, updatne lokalne polozky

### 3. DPH / VAT logika
- 3 rezimy: applyVat+vat>0, applyVat+vat==0, !applyVat
- Zavisi od:
  - Krajiny predajcu (invoice profile)
  - Krajiny kupujuceho
  - Ci je kupujuci platca DPH (VAT ID)
  - EU / mimo-EU clenstov oboch stran
- `setInvoiceProfile()` prepocitava **vsetky polozky** pri zmene
- Produkt moze byt "is_taxed" alebo nie

### 4. Minimalne objednavkove mnozstva (MOQ)
- Produkty maju `minimum_order_quantity` (napr. rura sa predava po 3m)
- Zobrazene ako "balenia" (packages)
- BarIS pocita v kusoch (POCET), Venalio v baleniach
- Konverzia: `quantity = POCET / minimum_order_quantity`

### 5. Sklady a dostupnost
- Multi-store stock (centralny sklad, Strkova, ...)
- Stock options: in_stock, presale, soldout, custom
- `soldout_stock_option_id` - co sa stane ked sa vypredaju
- `limit_presale_count` - max pocet pre predpredaj
- Store-specific stock check (`storeStockCheckEnabled`)

### 6. Kupony a vernostny program
- Absolutne / percentualne zlavy
- Filtrovanie podla tagu, kategorii
- Validacia per jazyk, mena, zakaznicka kategoria, krajina
- Loyalty points s konverznym kurzom per mena

---

## Ako by to agent riesil

Agent by nepracoval priamo s CartFacade. Potrebuje **orchestracnu vrstvu** (API toolset), ktora zapuzdruje komplexitu.

### Navrhovane agent tools:

```
search_products(query, category?, use_case?)
  -> Fulltext + kategoria search s cenami pre aktualny price level
  -> Vracia: name, code, price, stock, MOQ, unit, image

get_product_detail(product_code)
  -> Kompletny detail: vsetky cenove hladiny, stock per store,
     prislusenstvo, alternativy, parametre
  -> Agent vidi co predavac vidi

check_baris_prices(product_codes[], partner_id)
  -> Vola BarIS API pre realne B2B ceny
  -> Vracia: unit_price_untaxed, unit_price_taxed, DPH, dostupnost
  -> Toto je klucove - bez toho agent nema spravne ceny

add_to_cart(product_code, quantity, partner_id)
  -> Interne: najde produkt, ziska BarIS cenu, vytvori/updatne kosik
  -> Validuje: stock, MOQ, max quantity
  -> Vracia: order_item_id, final_price, stock_status

update_cart_item(order_item_id, quantity)
  -> Zmeni mnozstvo + revalidacia
  -> Automaticky recalculate cez BarIS

remove_cart_item(order_item_id)
  -> Soft delete + recalculate

get_cart(partner_id)
  -> Aktualny stav kosika s prepocitanymi cenami
  -> Vracia: items[], subtotal, shipping_estimate, vat_info

apply_coupon(code)
  -> Validacia + aplikacia
  -> Vracia: discount_amount, affected_items

create_price_offer(partner_id, validity_days, note?)
  -> Konvertuje kosik na cenovu ponuku (demand/order)
  -> Odosle email partnerovi
  -> Vracia: offer_id, pdf_url

check_stock_availability(product_codes[], store?)
  -> Multi-store stock check
  -> Vracia: per-product stock counts, delivery estimates

get_partner_info(partner_id)
  -> Delivery locations, payment terms, price level, BarIS ID
  -> Agent vie aku cenovu hladinu pouzit
```

### Flow pre typicky scenar:

```
1. User: "Potrebujem material na kanalizaciu"

2. Agent -> search_products(query="kanalizacia", use_case="rodinny dom")
   <- Vracia 15 produktov s cenami

3. Agent -> get_partner_info(partner_id=2847)
   <- Price level, delivery location, payment terms

4. Agent -> check_baris_prices(["SW-PIPE-110", ...], partner_id=2847)
   <- Realne B2B ceny (mozu sa lisit od katalogowych!)

5. Agent odpovie s odporucaniami + realnym cenami

6. User: "Pridaj to do kosika"

7. Agent -> add_to_cart("SW-PIPE-110", 50, partner_id=2847)  [loop per item]
   <- Kazde volanie: validacia stock, MOQ check, BarIS sync
   <- Vracia finalnu cenu po vsetkych prepoctoch

8. Agent -> get_cart(partner_id=2847)
   <- Celkovy kosik s DPH, dopravou, atd.

9. User: "Vytvor cenovu ponuku"

10. Agent -> create_price_offer(partner_id=2847, validity_days=14)
    <- PDF, email, offer ID
```

### Klucove principy:

1. **Agent nikdy nepocita ceny sam** - vzdy vola tool ktory pouziva CartFacade/BarIS
2. **Kazdy add_to_cart trigger recalculate** - agent musi pocitat s tym ze ceny sa mozu zmenit
3. **BarIS je source of truth pre B2B ceny** - katalogove ceny su len orientacne
4. **Stock check pred kazdym pridanim** - agent musi vediet handlovat "nedostupne"
5. **MOQ awareness** - agent musi vediet ze "10 baleni rur" != "10 kusov rur"

---

## Implementacny pristup

### Faza 1: Demo (toto)
- Staticke data, scripted flow
- Ukazuje UX a tool-call vizualizaciu
- Ciel: validacia konceptu s klientmi/partnermi

### Faza 2: API Layer
- Nove REST endpointy v `app/Api/V2/` pre agent tools
- Wrapper nad CartFacade + BarisCartFacade
- Autentifikacia cez B2B partner token
- Rate limiting pre BarIS calls

### Faza 3: Agent Integration
- LLM (Claude/GPT) s tool definitions
- Streaming responses pre realtime UX
- Conversation history per partner session
- Fallback na human support
