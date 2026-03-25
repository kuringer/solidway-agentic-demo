// ── Cart Engine ──
const cart = [];
let cartSyncing = false;

function addToCart(code, qty, usePartnerPrice = false) {
	const product = PRODUCTS[code];
	if (!product) return;

	const price = usePartnerPrice ? product.partnerPrice : product.price;

	const existing = cart.find(c => c.code === code);
	if (existing) {
		existing.qty += qty;
		// Update existing DOM element
		const el = document.querySelector(`[data-cart-code="${code}"]`);
		if (el) {
			el.querySelector('.cart-item__qty-val').textContent = existing.qty;
			const total = existing.price * existing.qty;
			el.querySelector('.cart-item__price').innerHTML = formatPrice(total);
			el.classList.add('cart-item--bump');
			setTimeout(() => el.classList.remove('cart-item--bump'), 400);
		}
	} else {
		cart.push({ ...product, price, qty, confirmed: usePartnerPrice });
		// Append new DOM element with animation
		appendCartItem(cart[cart.length - 1]);
	}
	updateCartSummary();
}

function appendCartItem(item) {
	const itemsEl = document.getElementById('cartItems');
	const emptyEl = document.getElementById('cartEmpty');
	emptyEl.style.display = 'none';
	document.getElementById('cartSummary').style.display = '';
	document.getElementById('cartActions').style.display = '';

	const el = document.createElement('div');
	el.className = 'cart-item cart-item--enter';
	el.setAttribute('data-cart-code', item.code);

	const priceLabel = !item.confirmed
		? `<span class="cart-item__price cart-item__price--estimate">${formatPrice(item.price * item.qty)} <span class="cart-item__estimate-tag">katalóg</span></span>`
		: `<span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>`;
	const unitLabel = !item.confirmed
		? `<span class="cart-item__unit-price cart-item__unit-price--estimate">~${formatPrice(item.price)} / ${item.unit}</span>`
		: `<span class="cart-item__unit-price">${formatPrice(item.price)} / ${item.unit}</span>`;

	el.innerHTML = `
		<div class="cart-item__img">${item.emoji}</div>
		<div class="cart-item__info">
			<div class="cart-item__name">${item.name}</div>
			<div class="cart-item__code">${item.code}${item.moq > 1 ? ` <span class="cart-item__moq">${item.qty} bal. x ${item.moq} ${item.unit}</span>` : ''}</div>
			<div class="cart-item__meta">
				<div class="cart-item__qty">
					<button class="cart-item__qty-btn">&minus;</button>
					<div class="cart-item__qty-val">${item.qty}</div>
					<button class="cart-item__qty-btn">+</button>
				</div>
				<div class="cart-item__prices">
					${priceLabel}
					${unitLabel}
				</div>
			</div>
		</div>
	`;

	itemsEl.appendChild(el);

	// Force reflow then animate
	el.offsetHeight;
	requestAnimationFrame(() => {
		el.classList.remove('cart-item--enter');
		el.classList.add('cart-item--entered');
		// Update scroll indicator after transition starts
		setTimeout(updateScrollIndicator, 50);
	});
}

function updateCartItemPrice(code, newPrice) {
	const item = cart.find(c => c.code === code);
	if (!item) return;
	item.price = newPrice;
	item.confirmed = true;

	const el = document.querySelector(`[data-cart-code="${code}"]`);
	if (el) {
		const pricesEl = el.querySelector('.cart-item__prices');
		pricesEl.innerHTML = `
			<span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>
			<span class="cart-item__unit-price">${formatPrice(item.price)} / ${item.unit}</span>
		`;
		el.classList.add('cart-item--price-flash');
		setTimeout(() => el.classList.remove('cart-item--price-flash'), 800);
	}
	updateCartSummary();
}

function confirmAllPrices() {
	cart.forEach(c => { c.confirmed = true; });
	updateCartSummary();
}

function setCartSyncing(syncing) {
	cartSyncing = syncing;
	document.getElementById('cartSyncBanner').style.display = syncing ? '' : 'none';
}

function getCartSubtotal() {
	return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
}

function formatPrice(n) {
	return n.toFixed(2).replace('.', ',') + ' \u20ac';
}

// ── Scroll-to-bottom indicator ──
function updateScrollIndicator() {
	const itemsEl = document.getElementById('cartItems');
	let indicator = document.getElementById('cartScrollIndicator');

	const isScrolledToBottom = itemsEl.scrollHeight - itemsEl.scrollTop - itemsEl.clientHeight < 40;
	const hasOverflow = itemsEl.scrollHeight > itemsEl.clientHeight + 20;

	if (!hasOverflow || isScrolledToBottom) {
		if (indicator) indicator.classList.remove('cart-scroll-indicator--visible');
		return;
	}

	// Count items below viewport
	const items = itemsEl.querySelectorAll('.cart-item');
	let hiddenCount = 0;
	const containerBottom = itemsEl.getBoundingClientRect().bottom;
	items.forEach(el => {
		if (el.getBoundingClientRect().top >= containerBottom - 10) hiddenCount++;
	});

	if (hiddenCount === 0) {
		if (indicator) indicator.classList.remove('cart-scroll-indicator--visible');
		return;
	}

	if (!indicator) {
		indicator = document.createElement('div');
		indicator.id = 'cartScrollIndicator';
		indicator.className = 'cart-scroll-indicator';
		indicator.addEventListener('click', () => {
			itemsEl.scrollTo({ top: itemsEl.scrollHeight, behavior: 'smooth' });
		});
		itemsEl.parentElement.insertBefore(indicator, itemsEl.nextSibling);
	}

	indicator.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg> ${hiddenCount} ${hiddenCount === 1 ? 'položka' : (hiddenCount < 5 ? 'položky' : 'položiek')} nižšie`;
	indicator.classList.add('cart-scroll-indicator--visible');
}

// Listen to scroll on cart items
document.addEventListener('DOMContentLoaded', () => {
	const itemsEl = document.getElementById('cartItems');
	if (itemsEl) {
		itemsEl.addEventListener('scroll', updateScrollIndicator);
	}
});

function updateCartSummary() {
	const totalQty = cart.reduce((sum, c) => sum + c.qty, 0);
	document.getElementById('cartCount').textContent = `(${totalQty})`;

	const badge = document.getElementById('headerCartBadge');
	badge.textContent = totalQty || '';
	badge.setAttribute('data-count', totalQty);

	if (cart.length === 0) {
		document.getElementById('cartEmpty').style.display = '';
		document.getElementById('cartSummary').style.display = 'none';
		document.getElementById('cartActions').style.display = 'none';
		return;
	}

	const hasUnconfirmed = cart.some(c => !c.confirmed);
	const subtotal = getCartSubtotal();
	const prefix = hasUnconfirmed ? '~' : '';

	document.getElementById('cartSubtotal').innerHTML = prefix + formatPrice(subtotal);
	document.getElementById('cartShipping').textContent = subtotal > 500 ? 'Zadarmo' : 'od 12,90 \u20ac';
	document.getElementById('cartTotal').innerHTML = prefix + formatPrice(subtotal);
	document.getElementById('cartTotalLabel').textContent = hasUnconfirmed ? 'Odhad bez DPH' : 'Spolu bez DPH';
}
