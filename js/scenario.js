// ── Demo Scenario ──
// Realistic B2B flow matching actual CartFacade + BarisCartFacade behavior:
// - Partner has multiple "prevadzky" (sub-partners) - agent must ask which one
// - Delivery location affects ERP prices (different warehouse, different availability)
// - Items added at catalog prices first, ERP sync updates them to partner prices
// - sync takes 3-7s (realistic ERP round-trip)
// - Approve creates price offer, doesn't complete full checkout

const scenario = [
	// ── Step 0: Welcome ──
	{
		delay: 500,
		action: async () => {
			addMessage('Dobrý deň. Som váš Solidway asistent pre B2B nakupovanie. Môžem vám pomôcť s vyhľadávaním produktov, tvorbou košíka alebo cenovou ponukou.<br><br>Vidím, že ste prihlásený ako <strong>StavPro s.r.o.</strong> Čo dnes potrebujete?');
			setSuggestions([
				'Podlahy pre bytový komplex, 3 typy miestností',
				'Doobjednať vinyl DUB Sahara z poslednej objednávky',
				'Čo máte v akcii na laminát?'
			]);
		}
	},

	// ── Step 1: Partner info reveals multiple locations → must choose ──
	{
		delay: 400,
		action: async () => {
			showTyping();
			await wait(1200);
			hideTyping();

			showThinking();
			await wait(1200);
			hideThinking();

			const tc1 = addToolCall('get_partner_info', { partner_id: 2847 });
			await wait(1600);
			completeToolCall(tc1);
			addToolResult('get_partner_info', {
				company: 'StavPro s.r.o.',
				price_level: 'B2B-GOLD',
				erp_id: 40128,
				discount: '18%',
				payment_terms: 'faktúra 30 dní',
				locations_count: 3
			});
			await wait(600);

			const tc2 = addToolCall('get_partner_locations', { partner_id: 2847 });
			await wait(1200);
			completeToolCall(tc2);
			addToolResult('get_partner_locations', {
				'loc_1': 'StavPro Bratislava - Petržalka (sklad Štrkova)',
				'loc_2': 'StavPro Košice - Juh (sklad Košice)',
				'loc_3': 'StavPro Žilina - centrum (sklad Žilina)',
			});
			await wait(600);

			showThinking();
			await wait(1200);
			hideThinking();

			addMessage('Váš účet má <strong>3 prevádzky</strong>. Pre správne ceny a dostupnosť potrebujem vedieť, pre ktorú prevádzku nakupujete:<br><br><strong>1.</strong> StavPro Bratislava - Petržalka <span style="color:var(--color-primary-700)">(sklad Štrkova)</span><br><strong>2.</strong> StavPro Košice - Juh <span style="color:var(--color-primary-700)">(sklad Košice)</span><br><strong>3.</strong> StavPro Žilina - centrum <span style="color:var(--color-primary-700)">(sklad Žilina)</span><br><br>Dodacie miesto ovplyvňuje dostupnosť na najbližšom sklade.');
			setSuggestions([
				'Bratislava - Petržalka',
				'Košice - Juh',
				'Žilina - centrum'
			]);
		}
	},

	// ── Step 2: Location selected → validate + search products ──
	{
		delay: 400,
		action: async () => {
			showTyping();
			await wait(800);
			hideTyping();

			showThinking();
			await wait(1200);
			hideThinking();

			const tc1 = addToolCall('set_active_location', {
				partner_id: 2847,
				location: 'StavPro Bratislava - Petržalka',
				warehouse: 'BA-STRKOVA',
				delivery_location_rid: 'BA-STRKOVA-01'
			});
			await wait(1000);
			completeToolCall(tc1);
			addToolResult('set_active_location', {
				status: 'ok',
				address: 'Panónska 42, 851 01 Bratislava',
				contact: 'Ján Novák, +421 903 123 456',
				phone_verified: true,
				warehouse: 'Štrkova - hlavný sklad'
			});
			await wait(600);

			const tc2 = addToolCall('search_products', {
				category: 'Podlahy',
				types: 'vinyl, laminát',
				warehouse: 'BA-STRKOVA',
				use_case: 'bytový komplex'
			});
			await wait(1600);
			completeToolCall(tc2);
			await wait(400);

			addMessage('Prevádzka <strong>Bratislava - Petržalka</strong> nastavená, sklad Štrkova. Kontaktná osoba: Ján Novák.<br><br>Tu sú dostupné podlahy. <em>Katalógové ceny - partnerské budú po synchronizácii.</em>');
			await wait(300);

			addProductCards([
				PRODUCTS['SW-VNL-OAK1'],
				PRODUCTS['SW-VNL-OAK2'],
				PRODUCTS['SW-VNL-GRY1'],
				PRODUCTS['SW-VNL-WAL1'],
				PRODUCTS['SW-LAM-OAK1'],
				PRODUCTS['SW-LAM-OAK2'],
			], false);

			await wait(300);

			addMessage('Vinyl <strong>DUB Sivý Elegant</strong> je nedostupný na sklade Štrkova. Odporúčam <strong>DUB Montana</strong> - podobný tón, rovnaká záťaž.<br><br>Aké plochy riešite?');
			setSuggestions([
				'Obývačky 340m² Sahara, chodby 180m² Montana, spálne 210m² laminát',
				'Koľko m² je v jednom balení?'
			]);
		}
	},

	// ── Step 3: MOQ calc + add + ERP sync ──
	{
		delay: 400,
		action: async () => {
			showTyping();
			await wait(1000);
			hideTyping();

			showThinking();
			await wait(1200);
			hideThinking();

			addMessage('Prepočítavam na celé balenia:<br><br>- DUB Sahara: 340 m² = <strong>157 bal.</strong> (vrátane 1 bal. rezerva)<br>- DUB Montana: 180 m² = <strong>83 bal.</strong><br>- Laminát Natural: 210 m² = <strong>86 bal.</strong> (vrátane 1 bal. rezerva)<br><br>Pridávam do košíka...');
			await wait(500);

			const items = [
				{ code: 'SW-VNL-OAK1', qty: 157 },
				{ code: 'SW-VNL-OAK2', qty: 83 },
				{ code: 'SW-LAM-OAK1', qty: 86 },
			];
			for (const item of items) {
				const tc = addToolCall('add_to_cart', {
					product_code: item.code,
					quantity: item.qty,
					partner_id: 2847
				});
				await wait(500);
				addToCart(item.code, item.qty, false);
				completeToolCall(tc);
				await wait(300);
			}

			await wait(500);
			const catalogSubtotal = getCartSubtotal();

			showThinking();
			await wait(1200);
			hideThinking();

			addMessage(`Katalógový odhad: <strong>~${catalogSubtotal.toFixed(2).replace('.', ',')} &euro;</strong>. Overujem partnerské ceny...`);
			await wait(300);

			setCartSyncing(true);
			const tcSync = addToolCall('sync_cart_prices', {
				cart_id: 'CART-2847-0324',
				partner_erp_id: 40128,
				delivery_location_rid: 'BA-STRKOVA-01',
				shipping_id: 12
			});

			await wait(1500);
			updateToolCallStatus(tcSync, 'Overujem partnerské ceny...');
			await wait(2200);
			updateToolCallStatus(tcSync, 'Prepočítavam ceny...');
			await wait(2000);
			updateToolCallStatus(tcSync, 'Spracovávam odpoveď...');
			await wait(1200);
			updateToolCallStatus(tcSync, 'Finalizujem...');
			await wait(800);
			completeToolCall(tcSync, '7,7s');

			addToolResult('sync_cart_prices', {
				status: 'ok',
				items_repriced: 3,
				items_auto_added: 0,
				'SW-VNL-OAK1': '32,90 → 25,80 €/bal.',
				'SW-VNL-OAK2': '34,50 → 27,10 €/bal.',
				'SW-LAM-OAK1': '18,90 → 14,60 €/bal.',
				volume_discount: 'áno (3% nad 500€)',
			});

			await wait(300);

			for (const [code, price] of [['SW-VNL-OAK1', 25.80], ['SW-VNL-OAK2', 27.10], ['SW-LAM-OAK1', 14.60]]) {
				updateCartItemPrice(code, price);
				await wait(150);
			}
			setCartSyncing(false);

			await wait(500);
			const partnerSubtotal = getCartSubtotal();
			const saved = catalogSubtotal - partnerSubtotal;
			addMessage(`<strong>Ceny potvrdené.</strong> Partnerská zľava 18% + objemová 3%.<br><br>Katalóg: <span style="text-decoration:line-through;color:var(--color-primary-700)">${catalogSubtotal.toFixed(2).replace('.', ',')} &euro;</span> → Vaša cena: <strong>${partnerSubtotal.toFixed(2).replace('.', ',')} &euro;</strong><br>Ušetrili ste: <strong>${saved.toFixed(2).replace('.', ',')} &euro;</strong><br><br>Pridať príslušenstvo? Podložky, lišty, prechodové profily.`);
			setSuggestions([
				'Pridaj komplet príslušenstvo',
				'Stačí, vytvor cenovú ponuku'
			]);
		}
	},

	// ── Step 4: Accessories + second sync ──
	{
		delay: 400,
		action: async () => {
			showTyping();
			await wait(800);
			hideTyping();

			const totalM2 = 157 * 2.18 + 83 * 2.18 + 86 * 2.47;

			showThinking();
			await wait(1200);
			hideThinking();

			const tc1 = addToolCall('check_stock', {
				products: ['SW-ULAY-5', 'SW-PROF-T', 'SW-PROF-L', 'SW-SKIRT', 'SW-CLIP', 'SW-WEDGE'],
				warehouse: 'BA-STRKOVA'
			});
			await wait(1200);
			completeToolCall(tc1);
			addToolResult('check_stock', {
				'SW-ULAY-5': '740 m² ✓',
				'SW-PROF-T': '85 ks ✓',
				'SW-PROF-L': '60 ks ✓',
				'SW-SKIRT': '380 ks ✓',
				'SW-CLIP': '140 bal ✓',
				'SW-WEDGE': '260 bal ✓'
			});
			await wait(500);

			addMessage(`Pre ~${Math.round(totalM2)} m²:<br>- Podložka 5mm: <strong>740 m²</strong><br>- Prechodové T-lišty: <strong>24 ks</strong><br>- Ukončovacie L-lišty: <strong>12 ks</strong><br>- Soklové lišty: <strong>180 ks</strong><br>- Montážne klipy: <strong>4 bal.</strong><br>- Dištančné kliny: <strong>6 bal.</strong>`);
			await wait(400);

			const accessories = [
				{ code: 'SW-ULAY-5', qty: 740 },
				{ code: 'SW-PROF-T', qty: 24 },
				{ code: 'SW-PROF-L', qty: 12 },
				{ code: 'SW-SKIRT', qty: 180 },
				{ code: 'SW-CLIP', qty: 4 },
				{ code: 'SW-WEDGE', qty: 6 },
			];

			for (const item of accessories) {
				const tc = addToolCall('add_to_cart', { product_code: item.code, quantity: item.qty, partner_id: 2847 });
				await wait(300);
				addToCart(item.code, item.qty, false);
				completeToolCall(tc);
				await wait(150);
			}

			await wait(400);

			showThinking();
			await wait(1200);
			hideThinking();

			setCartSyncing(true);
			const tcSync = addToolCall('sync_cart_prices', {
				cart_id: 'CART-2847-0324',
				partner_erp_id: 40128,
				delivery_location_rid: 'BA-STRKOVA-01',
				shipping_id: 12
			});
			await wait(1500);
			updateToolCallStatus(tcSync, 'Overujem partnerské ceny...');
			await wait(1800);
			updateToolCallStatus(tcSync, 'Prepočítavam ceny...');
			await wait(1500);
			updateToolCallStatus(tcSync, 'Spracovávam odpoveď...');
			await wait(900);
			completeToolCall(tcSync, '5,7s');

			addToolResult('sync_cart_prices', {
				status: 'ok',
				items_repriced: 6,
				note: 'Podlahy bez zmeny (už potvrdené)',
			});
			await wait(200);

			for (const [code, price] of [['SW-ULAY-5',3.30],['SW-PROF-T',12.00],['SW-PROF-L',10.10],['SW-SKIRT',5.55],['SW-CLIP',6.80],['SW-WEDGE',3.95]]) {
				updateCartItemPrice(code, price);
				await wait(100);
			}
			setCartSyncing(false);

			await wait(400);
			const subtotal = getCartSubtotal();
			addMessage(`Hotovo. <strong>${subtotal.toFixed(2).replace('.', ',')} &euro; bez DPH</strong>, doprava zadarmo.<br>Všetky ceny potvrdené.`);
			setSuggestions([
				'Mám kupón PODLAHY2026, potom vytvor ponuku',
				'Rovno vytvor cenovú ponuku'
			]);
		}
	},

	// ── Step 5: Coupon fails + price offer ──
	{
		delay: 400,
		action: async () => {
			showTyping();
			await wait(600);
			hideTyping();

			showThinking();
			await wait(1200);
			hideThinking();

			const tc1 = addToolCall('apply_coupon', {
				code: 'PODLAHY2026',
				cart_id: 'CART-2847-0324',
				language: 'sk',
				currency: 'EUR',
				country: 'SK'
			});
			await wait(1200);
			completeToolCall(tc1);
			addToolResult('apply_coupon', {
				valid: false,
				error: 'Kupón nie je možné kombinovať s B2B zľavou',
				coupon_discount: '5%',
				partner_discount: '18% + 3% objemová',
			}, true);

			await wait(500);

			addMessage('Kupón <strong>PODLAHY2026</strong> (5%) sa nedá kombinovať s B2B zľavou. Vaše ceny sú výhodnejšie.<br><br>Vytváram cenovú ponuku...');
			await wait(500);

			const tc2 = addToolCall('create_price_offer', {
				partner_id: 2847,
				cart_id: 'CART-2847-0324',
				validity_days: 14,
				location: 'StavPro Bratislava - Petržalka',
				note: 'Podlahy bytový komplex',
				send_email: 'objednavky@stavpro.sk'
			});
			await wait(2200);
			completeToolCall(tc2);

			const subtotal = getCartSubtotal();
			addToolResult('create_price_offer', {
				offer_id: 'CP-2847-0324',
				status: 'created',
				total: subtotal.toFixed(2) + ' € bez DPH',
				location: 'Bratislava - Petržalka',
				email_sent: 'objednavky@stavpro.sk',
				expires: '07.04.2026'
			});

			await wait(500);

			addMessage(`<strong>Cenová ponuka CP-2847-0324</strong><br><br>
- ${cart.length} položiek, <strong>${subtotal.toFixed(2).replace('.', ',')} &euro; bez DPH</strong><br>
- Prevádzka: Bratislava - Petržalka<br>
- Doprava: zadarmo (sklad Štrkova)<br>
- Platnosť: do 07.04.2026<br><br>
Odoslaná na <strong>objednavky@stavpro.sk</strong>. Pre dokončenie objednávky (výber dopravy, platby a fakturačných údajov) pokračujte cez košík.`);
			setSuggestions([
				'Pokračovať k objednávke',
				'Ďakujem, pošlem to vedeniu'
			]);
		}
	},

	// ── Step 6: Redirect to checkout ──
	{
		delay: 400,
		action: async () => {
			showTyping();
			await wait(600);
			hideTyping();

			addMessage(`V ďalšom kroku vyberiete:<br><br>
1. <strong>Kam doručiť</strong> - na prevádzku Petržalka / iná adresa / nová adresa<br>
2. <strong>Spôsob dopravy</strong> - rozvoz na stavbu / osobný odber<br>
3. <strong>Spôsob platby</strong> - faktúra 30 dní / bankový prevod<br>
4. <strong>Zhrnutie a potvrdenie</strong><br><br>
Ceny sú potvrdené a platné do 07.04.2026. Prajem úspešný projekt!`);
			setSuggestions([]);
		}
	}
];
