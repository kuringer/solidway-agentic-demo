// ── Chat Engine ──
const messagesEl = document.getElementById('messages');
const suggestionsEl = document.getElementById('suggestions');

function addMessage(content, type = 'ai', extra = '') {
	const msg = document.createElement('div');
	msg.className = `msg msg--${type}`;
	msg.innerHTML = `
		<div class="msg__label">${type === 'ai' ? 'Solidway Asistent' : 'Vy'}</div>
		<div class="msg__bubble">${content}${extra}</div>
	`;
	messagesEl.appendChild(msg);
	messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addToolCall(toolName, params, status = 'running') {
	const id = 'tc-' + Date.now() + '-' + Math.random().toString(36).slice(2,6);
	const paramLines = Object.entries(params).map(([k, v]) => {
		if (typeof v === 'number') return `  <span class="key">"${k}"</span>: <span class="num">${v}</span>`;
		if (typeof v === 'boolean') return `  <span class="key">"${k}"</span>: <span class="num">${v}</span>`;
		if (Array.isArray(v)) return `  <span class="key">"${k}"</span>: [${v.map(x => `<span class="val">"${x}"</span>`).join(', ')}]`;
		return `  <span class="key">"${k}"</span>: <span class="val">"${v}"</span>`;
	}).join('\n');

	const msg = document.createElement('div');
	msg.className = 'msg msg--ai';
	msg.innerHTML = `
		<div class="tool-call" id="${id}">
			<div class="tool-call__header" onclick="this.parentElement.classList.toggle('tool-call--collapsed')" style="cursor:pointer">
				<span class="tool-call__icon">&#9881;</span>
				${toolName}
				<span class="tool-call__status tool-call__status--${status}" id="${id}-status">
					${status === 'running' ? '<span class="tool-call__spinner"></span> Vykonávam...' : '&#10003; Hotovo'}
				</span>
				<span class="tool-call__chevron">&#9662;</span>
			</div>
			<div class="tool-call__body tool-call__body--collapsible">{\n${paramLines}\n}</div>
		</div>
	`;
	messagesEl.appendChild(msg);
	messagesEl.scrollTop = messagesEl.scrollHeight;
	return id;
}

function addToolResult(toolName, result, isWarning = false) {
	const id = 'tr-' + Date.now() + '-' + Math.random().toString(36).slice(2,6);
	const msg = document.createElement('div');
	msg.className = 'msg msg--ai';
	const entries = Object.entries(result);
	const keyCount = entries.length;
	const lines = entries.map(([k, v]) => {
		const cls = k === 'warning' || k === 'error' ? 'warn' : (typeof v === 'number' ? 'num' : 'val');
		const formatted = typeof v === 'number' ? v : `"${v}"`;
		return `  <span class="key">"${k}"</span>: <span class="${cls}">${formatted}</span>`;
	}).join('\n');

	msg.innerHTML = `
		<div class="tool-call tool-call--collapsed ${isWarning ? 'tool-call--warn' : ''}" id="${id}">
			<div class="tool-call__header tool-call__header--result ${isWarning ? 'tool-call__header--warn' : ''}" onclick="this.parentElement.classList.toggle('tool-call--collapsed')" style="cursor:pointer">
				<span class="tool-call__icon ${isWarning ? 'tool-call__icon--warn' : 'tool-call__icon--result'}">&#8592;</span>
				${toolName}
				<span class="tool-call__summary">${keyCount} polí</span>
				<span class="tool-call__chevron">&#9662;</span>
			</div>
			<div class="tool-call__body tool-call__body--collapsible">{\n${lines}\n}</div>
		</div>
	`;
	messagesEl.appendChild(msg);
	messagesEl.scrollTop = messagesEl.scrollHeight;
	return id;
}

function updateToolCallStatus(id, text) {
	const statusEl = document.getElementById(id + '-status');
	if (statusEl) {
		statusEl.innerHTML = '<span class="tool-call__spinner"></span> ' + text;
	}
}

function completeToolCall(id, duration) {
	const statusEl = document.getElementById(id + '-status');
	if (statusEl) {
		statusEl.className = 'tool-call__status tool-call__status--done';
		statusEl.innerHTML = '&#10003; Hotovo' + (duration ? ` (${duration})` : '');
	}
	// Collapse after completing
	const toolEl = document.getElementById(id);
	if (toolEl) {
		setTimeout(() => toolEl.classList.add('tool-call--collapsed'), 300);
	}
}

function addProductCards(products, showPartnerPrice = false) {
	const msg = document.createElement('div');
	msg.className = 'msg msg--ai';
	const cards = products.map(p => {
		const priceDisplay = showPartnerPrice && p.partnerPrice
			? `<span style="text-decoration:line-through;color:var(--color-primary-700);font-weight:400;font-size:12px">${p.price.toFixed(2).replace('.', ',')} &euro;</span> <strong>${p.partnerPrice.toFixed(2).replace('.', ',')} &euro;</strong> / ${p.unit}`
			: `${p.price.toFixed(2).replace('.', ',')} &euro; / ${p.unit}`;
		const moqNote = p.moq > 1 ? `<span style="color:var(--color-primary-700);font-size:10px;margin-left:6px">MOQ: ${p.moq} ${p.unit}</span>` : '';
		const stockClass = p.stock > 100 ? 'stock-dot--ok' : (p.stock > 0 ? 'stock-dot--low' : 'stock-dot--out');
		const stockText = p.stock > 0 ? `Na sklade: ${p.stock} ${p.unit}` : 'Nedostupné';
		return `
		<div class="product-card-chat ${p.stock === 0 ? 'product-card-chat--unavailable' : ''}">
			<div class="product-card-chat__img">${p.emoji}</div>
			<div class="product-card-chat__info">
				<div class="product-card-chat__name">${p.name}${moqNote}</div>
				<div class="product-card-chat__code">${p.code}</div>
				<div class="product-card-chat__stock">
					<span class="stock-dot ${stockClass}"></span>
					${stockText}
				</div>
				<div class="product-card-chat__price">${priceDisplay}</div>
			</div>
		</div>
	`}).join('');
	msg.innerHTML = `<div class="msg__label">Solidway Asistent</div>${cards}`;
	messagesEl.appendChild(msg);
	messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showThinking() {
	const el = document.createElement('div');
	el.className = 'msg msg--ai';
	el.id = 'thinking-block';
	el.innerHTML = `
		<div class="thinking-block">
			<span class="thinking-block__spinner"></span>
			Premýšľam<span class="thinking-block__dots"><span>.</span><span>.</span><span>.</span></span>
		</div>
	`;
	messagesEl.appendChild(el);
	messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideThinking() {
	const el = document.getElementById('thinking-block');
	if (el) el.remove();
}

function showTyping() {
	const el = document.createElement('div');
	el.className = 'typing'; el.id = 'typing-indicator';
	el.innerHTML = '<span></span><span></span><span></span>';
	messagesEl.appendChild(el);
	messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
	const el = document.getElementById('typing-indicator');
	if (el) el.remove();
}

function setSuggestions(items) {
	suggestionsEl.innerHTML = items.map(s =>
		`<button class="suggestion-pill" onclick="handleSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
	).join('');
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
