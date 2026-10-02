// Get elemens  from the page 
const expressionEI = document.getElementById('experession');
const resultEI = document.getElementById('result');
const memoryValueEI = document.getElementById('memoryValueEI');
const themeButton = document.getElementById('themeButton');
const sidePanel = document.getElementById('sidePanel');
const penelList = document.getElementById('penelList');

// Variable to keep track of calculator state
let expression = '';
let current = '0';
let lastAction = null
let memory = 0;
let isLastAction = false
let historyList = [];

// Theme button click
themeButton.onclick = function() {
  isLightMode = !isLightMode;
  document.body.classList.toggle('light', isLightMode);
  themeButton.textContent = isLightMode ? '☾' : '☀';
};

// Format number for display
function formatNumber(num) {
  if (num === 'Error' || num === 'Cannot divide by zero') {
    return num;
  }
  const value = Number(num);
  if (isNaN(value)) {
    return num;
  }
  return value.toLocaleString('en', { maximumFractionDigits: 10 });
}

// Get the real number value (remove commas)
function getValue() {
  return Number(String(current).replace(/,/g, '')) || 0;
}

// Update the screen
function updateDisplay() {
  expressionEl.textContent = expression;
  resultEl.textContent = formatNumber(current);
  memoryValueEl.textContent = memory;
}

// When user presses a number
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

// When user presses an operator
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

// When user presses equals
function calculate() {
  if (!expression) return;

  try {
    let fullExpression = (expression + current)
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/-/g, '-')
      .replace(/,/g, '');

    // Check for division by zero
    if (/\/\s*0(?!\.\d)/.test(fullExpression)) {
      current = 'Cannot divide by zero';
      updateDisplay();
      return;
    }

    const answer = Function('return (' + fullExpression + ')')();

    if (!isFinite(answer)) {
      current = 'Error';
      updateDisplay();
      return;
    }

    const resultString = String(answer);
    
    // Save to history
    historyList.unshift({
      expr: (expression + current).trim(),
      result: resultString
    });
    if (historyList.length > 50) {
      historyList.pop();
    }

    expression = '';
    current = resultString;
    lastAction = 'equals';
    updateDisplay();
  } catch (error) {
    current = 'Error';
    updateDisplay();
  }
}

// Clear everything
function clearAll() {
  expression = '';
  current = '0';
  lastAction = null;
  updateDisplay();
}

// Change sign (+/-)
function toggleSign() {
  if (current !== '0' && current !== 'Error') {
    current = String(-getValue());
    updateDisplay();
  }
}

// Percentage
function percentage() {
  current = String(getValue() / 100);
  updateDisplay();
}

// Number and operator buttons
document.querySelectorAll('.btn').forEach(function(button) {
  button.onclick = function() {
    const value = button.getAttribute('data-value');
    const action = button.getAttribute('data-action');

    if (value) {
      if (value === '+' || value === '-' || value === '×' || value === '÷') {
        addOperator(value);
      } else {
        addNumber(value);
      }
    } else if (action === 'clear') {
      clearAll();
    } else if (action === 'sign') {
      toggleSign();
    } else if (action === 'percent') {
      percentage();
    } else if (action === 'equals') {
      calculate();
    }
  };
});

// Memory buttons
document.querySelectorAll('.mem-btn').forEach(function(button) {
  button.onclick = function() {
    const action = button.getAttribute('data-action');

    if (action === 'M+') {
      memory = memory + getValue();
    } else if (action === 'M-') {
      memory = memory - getValue();
    } else if (action === 'MR') {
      current = String(memory);
      updateDisplay();
    } else if (action === 'MC') {
      memory = 0;
    }
    updateDisplay();
  };
});

// Render history panel
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
      const index = item.getAttribute('data-index');
      current = historyList[index].result;
      expression = '';
      lastAction = 'equals';
      updateDisplay();
      sidePanel.classList.remove('open');
    };
  });
}

// Open history panel
function openHistory() {
  renderHistory();
  sidePanel.classList.add('open');
}

// History button clicks
document.getElementById('historyNav').onclick = openHistory;
document.getElementById('historyButton').onclick = openHistory;
document.getElementById('closePanel').onclick = function() {
  sidePanel.classList.remove('open');
};

// Disable Notes button (feature removed)
document.getElementById('notesNav').onclick = function() {
  alert('Notes feature has been removed');
};

// Disable Save Note button (feature removed)
document.getElementById('saveNoteBtn').onclick = function() {
  alert('Notes feature has been removed');
};

// Clear history button
document.getElementById('clearBtn').onclick = function() {
  historyList = [];
  renderHistory();
};

// Start the calculator
updateDisplay();
