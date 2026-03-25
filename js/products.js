// ── Product Database (demo) ──
// Prices are "catalog" prices - ERP will return partner-specific prices
const PRODUCTS = {
	// Vinylové podlahy
	'SW-VNL-OAK1': { name: 'Vinylová podlaha DUB Sahara Click', code: 'SW-VNL-OAK1', price: 32.90, partnerPrice: 26.50, unit: 'm²', moq: 2.18, stock: 1240, stockStrkova: 280, emoji: '🪵', category: 'Vinylové podlahy' },
	'SW-VNL-OAK2': { name: 'Vinylová podlaha DUB Montana Click', code: 'SW-VNL-OAK2', price: 34.50, partnerPrice: 27.80, unit: 'm²', moq: 2.18, stock: 890, stockStrkova: 150, emoji: '🪵', category: 'Vinylové podlahy' },
	'SW-VNL-GRY1': { name: 'Vinylová podlaha DUB Sivý Elegant', code: 'SW-VNL-GRY1', price: 36.90, partnerPrice: 29.70, unit: 'm²', moq: 2.18, stock: 0, stockStrkova: 0, emoji: '🪵', category: 'Vinylové podlahy' },
	'SW-VNL-WAL1': { name: 'Vinylová podlaha ORECH Toscana Click', code: 'SW-VNL-WAL1', price: 38.50, partnerPrice: 31.20, unit: 'm²', moq: 2.18, stock: 520, stockStrkova: 85, emoji: '🪵', category: 'Vinylové podlahy' },

	// Laminátové podlahy
	'SW-LAM-OAK1': { name: 'Laminátová podlaha DUB Natural 8mm', code: 'SW-LAM-OAK1', price: 18.90, partnerPrice: 15.20, unit: 'm²', moq: 2.47, stock: 3200, stockStrkova: 680, emoji: '🏠', category: 'Laminátové podlahy' },
	'SW-LAM-OAK2': { name: 'Laminátová podlaha DUB Rustik 10mm', code: 'SW-LAM-OAK2', price: 24.50, partnerPrice: 19.80, unit: 'm²', moq: 2.47, stock: 1850, stockStrkova: 320, emoji: '🏠', category: 'Laminátové podlahy' },

	// Príslušenstvo
	'SW-ULAY-3': { name: 'Podložka STARLON 3mm', code: 'SW-ULAY-3', price: 2.40, partnerPrice: 1.92, unit: 'm²', moq: 1, stock: 8500, stockStrkova: 1200, emoji: '📋', category: 'Príslušenstvo' },
	'SW-ULAY-5': { name: 'Podložka STARLON 5mm s parozábranou', code: 'SW-ULAY-5', price: 4.10, partnerPrice: 3.30, unit: 'm²', moq: 1, stock: 5200, stockStrkova: 740, emoji: '📋', category: 'Príslušenstvo' },
	'SW-PROF-T': { name: 'Prechodová lišta T-profil DUB 2,7m', code: 'SW-PROF-T', price: 14.90, partnerPrice: 12.00, unit: 'ks', moq: 1, stock: 620, stockStrkova: 85, emoji: '📏', category: 'Príslušenstvo' },
	'SW-PROF-L': { name: 'Ukončovacia lišta L-profil DUB 2,7m', code: 'SW-PROF-L', price: 12.50, partnerPrice: 10.10, unit: 'ks', moq: 1, stock: 480, stockStrkova: 60, emoji: '📏', category: 'Príslušenstvo' },
	'SW-SKIRT': { name: 'Soklová lišta DUB 58mm 2,5m', code: 'SW-SKIRT', price: 6.90, partnerPrice: 5.55, unit: 'ks', moq: 1, stock: 2400, stockStrkova: 380, emoji: '📐', category: 'Príslušenstvo' },
	'SW-CLIP': { name: 'Montážne klipy na sokel (bal. 50ks)', code: 'SW-CLIP', price: 8.50, partnerPrice: 6.80, unit: 'bal', moq: 1, stock: 950, stockStrkova: 140, emoji: '🔩', category: 'Príslušenstvo' },
	'SW-GLUE-P': { name: 'Lepidlo na podlahy UZIN MK 73 - 17kg', code: 'SW-GLUE-P', price: 62.00, partnerPrice: 49.90, unit: 'ks', moq: 1, stock: 45, stockStrkova: 8, emoji: '🧴', category: 'Príslušenstvo' },
	'SW-WEDGE': { name: 'Dištančné kliny (bal. 40ks)', code: 'SW-WEDGE', price: 4.90, partnerPrice: 3.95, unit: 'bal', moq: 1, stock: 1800, stockStrkova: 260, emoji: '🔧', category: 'Príslušenstvo' },
};
