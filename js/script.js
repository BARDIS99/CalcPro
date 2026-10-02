const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const memoryValueEl = document.getElementById('memoryValue');
const themeButton = document.getElementById('themeButton');
const sidePanel = document.getElementById('sidePanel');
const panelList = document.getElementById('panelList');

let expression = '', current = '0', lastAction = null, memory = 0, historyList = [], isLightMode = false;

themeButton.onclick = () => {
  isLightMode = !isLightMode;
  document.body.classList.toggle('light', isLightMode);
  themeButton.textContent = isLightMode ? '☾' : '☀';
  try { localStorage.setItem('calcTheme', isLightMode ? 'light' : 'dark'); } catch(e) {}
};

function loadTheme() {
  try {
    if (localStorage.getItem('calcTheme') === 'light') {
      isLightMode = true;
      document.body.classList.add('light');
      themeButton.textContent = '☾';
    }
  } catch(e) {}
}

const formatNumber = (num) => {
  if (num === 'Error' || num === 'Cannot divide by zero') return num;
  const value = Number(num);
  return isNaN(value) ? num : value.toLocaleString('en', { maximumFractionDigits: 10 });
};

const getValue = () => Number(String(current).replace(/,/g, '')) || 0;

const updateDisplay = () => {
  expressionEl.textContent = expression;
  resultEl.textContent = formatNumber(current);
  memoryValueEl.textContent = memory;
};

const addNumber = (value) => {
  if (current === 'Error' || current === 'Cannot divide by zero') { expression = ''; current = '0'; lastAction = null; }
  if (lastAction === 'equals') { expression = ''; current = '0'; lastAction = null; }
  if (current === '0' && value !== '.') current = value;
  else if (value === '.' && current.includes('.')) return;
  else current += value;
  updateDisplay();
};

const addOperator = (op) => {
  if (current === 'Error') return;
  expression = (expression && lastAction !== 'equals') ? expression + current + ' ' + op + ' ' : current + ' ' + op + ' ';
  current = '0';
  lastAction = 'operator';
  updateDisplay();
};

const calculate = () => {
  if (!expression) return;
  try {
    let fullExpr = (expression + current).replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '');
    if (/\/\s*0(?!\.\d)/.test(fullExpr)) { current = 'Cannot divide by zero'; updateDisplay(); return; }
    const answer = Function('return (' + fullExpr + ')')();
    if (!isFinite(answer)) { current = 'Error'; updateDisplay(); return; }
    const result = String(answer);
    historyList.unshift({ expr: (expression + current).trim(), result: result });
    if (historyList.length > 50) historyList.pop();
    expression = '';
    current = result;
    lastAction = 'equals';
    updateDisplay();
  } catch(e) { current = 'Error'; updateDisplay(); }
};

const clearAll = () => { expression = ''; current = '0'; lastAction = null; updateDisplay(); };
const toggleSign = () => { if (current !== '0' && current !== 'Error') { current = String(-getValue()); updateDisplay(); } };
const percentage = () => { current = String(getValue() / 100); updateDisplay(); };
const deleteChar = () => {
  if (current === 'Error' || current === 'Cannot divide by zero') { clearAll(); return; }
  current = (current.length === 1 || current === '0') ? '0' : current.slice(0, -1);
  updateDisplay();
};

document.querySelectorAll('.btn').forEach(btn => {
  btn.onclick = () => {
    const val = btn.getAttribute('data-value'), action = btn.getAttribute('data-action');
    if (val) { (val === '+' || val === '-' || val === '×' || val === '÷') ? addOperator(val) : addNumber(val); }
    else if (action === 'clear') clearAll();
    else if (action === 'sign') toggleSign();
    else if (action === 'percent') percentage();
    else if (action === 'delete') deleteChar();
    else if (action === 'equals') calculate();
  };
});

document.querySelectorAll('.mem-btn').forEach(btn => {
  btn.onclick = () => {
    const action = btn.getAttribute('data-action');
    if (action === 'M+') memory += getValue();
    else if (action === 'M-') memory -= getValue();
    else if (action === 'MR') current = String(memory);
    else if (action === 'MC') memory = 0;
    updateDisplay();
  };
});

const renderHistory = () => {
  document.getElementById('panelTitle').textContent = 'History';
  if (historyList.length === 0) { panelList.innerHTML = '<div style="text-align:center;color:#888;padding:40px">No calculations yet</div>'; return; }
  let html = '';
  historyList.forEach((item, i) => { html += `<div class="history-item" data-index="${i}"><div class="item-expr">${item.expr}</div><div class="item-result">${formatNumber(item.result)}</div></div>`; });
  panelList.innerHTML = html;
  document.querySelectorAll('.history-item').forEach(item => {
    item.onclick = () => {
      current = historyList[item.getAttribute('data-index')].result;
      expression = '';
      lastAction = 'equals';
      updateDisplay();
      sidePanel.classList.remove('open');
    };
  });
};

const openHistory = () => { renderHistory(); sidePanel.classList.add('open'); };

document.getElementById('historyNav').onclick = openHistory;
document.getElementById('historyButton').onclick = openHistory;
document.getElementById('closePanel').onclick = () => sidePanel.classList.remove('open');
document.getElementById('clearBtn').onclick = () => { historyList = []; renderHistory(); };

loadTheme();
updateDisplay();
