// ── App Controller ──
let isTyping = false;
let scenarioStep = 0;

const inputEl = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// ── User Input ──
function handleSuggestion(text) {
	handleUserInput(text);
}

function handleUserInput(text) {
	if (isTyping) return;
	if (!text.trim()) return;

	addMessage(text, 'user');
	suggestionsEl.innerHTML = '';
	inputEl.value = '';

	isTyping = true;
	scenarioStep++;
	if (scenarioStep < scenario.length) {
		const step = scenario[scenarioStep];
		setTimeout(async () => {
			await step.action();
			isTyping = false;
		}, step.delay || 400);
	} else {
		setTimeout(() => {
			addMessage('Ďakujem za správu. V produkčnej verzii by som vedel spracovať každú požiadavku. Toto je demo ukážka agentic nakupovania.');
			isTyping = false;
		}, 800);
	}
}

sendBtn.addEventListener('click', () => handleUserInput(inputEl.value));
inputEl.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault();
		handleUserInput(inputEl.value);
	}
});

// Auto-resize textarea
inputEl.addEventListener('input', () => {
	inputEl.style.height = 'auto';
	inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

// ── Init ──
(async () => {
	await wait(scenario[0].delay);
	await scenario[0].action();
	isTyping = false;
})();
