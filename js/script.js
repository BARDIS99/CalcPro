const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const memoryValueEl = document.getElementById('memoryValue');
const themeButton = document.getElementById('themeButton');
const sidePanel = document.getElementById('sidePanel');
const panelList = document.getElementById('panelList');

let expression = '';
let current = '0';
let lastAction = null;
let memory = 0;
let historyList = [];
let isLightMode = false;

themeButton.onclick = function() {
  isLightMode = !isLightMode;
  document.body.classList.toggle('light', isLightMode);
  themeButton.textContent = isLightMode ? '☾' : '☀';
  try {
    localStorage.setItem('calcTheme', isLightMode ? 'light' : 'dark');
  } catch (e) {}
};

function loadTheme() {
  try {
    const saved = localStorage.getItem('calcTheme');
    if (saved === 'light') {
      isLightMode = true;
      document.body.classList.add('light');
      themeButton.textContent = '☾';
    }
  } catch (e) {}
}

function formatNumber(num) {
  if (num === 'Error' || num === 'Cannot divide by zero') return num;
  const value = Number(num);
  if (isNaN(value)) return num;
  return value.toLocaleString('en', { maximumFractionDigits: 10 });
}

function getValue() {
  return Number(String(current).replace(/,/g, '')) || 0;
}

function updateDisplay() {
  expressionEl.textContent = expression;
  resultEl.textContent = formatNumber(current);
  memoryValueEl.textContent = memory;
}

function addNumber(value) {
  if (current === 'Error' || current === 'Cannot divide by zero') {
    clearAll();
  }
  if (lastAction === 'equals') {
    expression = '';
    current = '0';
    lastAction = null;
  }
  if (current === '0' && value !== '.') {
    current = value;
  } else if (value === '.' && current.includes('.')) {
    return;
  } else {
    current = current + value;
  }
  updateDisplay();
}

function addOperator(op) {
  if (current === 'Error') return;

  if (expression && lastAction !== 'equals') {
    expression = expression + current + ' ' + op + ' ';
  } else {
    expression = current + ' ' + op + ' ';
  }
  current = '0';
  lastAction = 'operator';
  updateDisplay();
}

function calculate() {
  if (!expression) return;

  try {
    let fullExpr = (expression + current)
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/,/g, '');

    if (/\/\s*0(?!\.\d)/.test(fullExpr)) {
      current = 'Cannot divide by zero';
      updateDisplay();
      return;
    }

    const answer = Function('return (' + fullExpr + ')')();

    if (!isFinite(answer)) {
      current = 'Error';
      updateDisplay();
      return;
    }

    const result = String(answer);
    
    historyList.unshift({
      expr: (expression + current).trim(),
      result: result
    });
    if (historyList.length > 50) historyList.pop();

    expression = '';
    current = result;
    lastAction = 'equals';
    updateDisplay();
  } catch (e) {
    current = 'Error';
    updateDisplay();
  }
}

function clearAll() {
  expression = '';
  current = '0';
  lastAction = null;
  updateDisplay();
}

function toggleSign() {
  if (current !== '0' && current !== 'Error') {
    current = String(-getValue());
    updateDisplay();
  }
}

function percentage() {
  current = String(getValue() / 100);
  updateDisplay();
}

function deleteChar() {
  if (current === 'Error' || current === 'Cannot divide by zero') {
    clearAll();
    return;
  }
  
  if (current.length === 1 || current === '0') {
    current = '0';
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
}

document.querySelectorAll('.btn').forEach(function(btn) {
  btn.onclick = function() {
    const val = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');

    if (val) {
      if (val === '+' || val === '-' || val === '×' || val === '÷') {
        addOperator(val);
      } else {
        addNumber(val);
      }
    } else if (action === 'clear') {
      clearAll();
    } else if (action === 'sign') {
      toggleSign();
    } else if (action === 'percent') {
      percentage();
    } else if (action === 'delete') {
      deleteChar();
    } else if (action === 'equals') {
      calculate();
    }
  };
});

document.querySelectorAll('.mem-btn').forEach(function(btn) {
  btn.onclick = function() {
    const action = btn.getAttribute('data-action');
    if (action === 'M+') {
      memory += getValue();
    } else if (action === 'M-') {
      memory -= getValue();
    } else if (action === 'MR') {
      current = String(memory);
    } else if (action === 'MC') {
      memory = 0;
    }
    updateDisplay();
  };
});

function renderHistory() {
  document.getElementById('panelTitle').textContent = 'History';
  
  if (historyList.length === 0) {
    panelList.innerHTML = '<div style="text-align:center;color:#888;padding:40px">No calculations yet</div>';
    return;
  }

  let html = '';
  for (let i = 0; i < historyList.length; i++) {
    html += '<div class="history-item" data-index="' + i + '">';
    html += '<div class="item-expr">' + historyList[i].expr + '</div>';
    html += '<div class="item-result">' + formatNumber(historyList[i].result) + '</div>';
    html += '</div>';
  }
  panelList.innerHTML = html;

  document.querySelectorAll('.history-item').forEach(function(item) {
    item.onclick = function() {
      const idx = item.getAttribute('data-index');
      current = historyList[idx].result;
      expression = '';
      lastAction = 'equals';
      updateDisplay();
      sidePanel.classList.remove('open');
    };
  });
}

function openHistory() {
  renderHistory();
  sidePanel.classList.add('open');
}

document.getElementById('historyNav').onclick = openHistory;
document.getElementById('historyButton').onclick = openHistory;
document.getElementById('closePanel').onclick = function() {
  sidePanel.classList.remove('open');
};

document.getElementById('clearBtn').onclick = function() {
  historyList = [];
  renderHistory();
};

loadTheme();
updateDisplay();
