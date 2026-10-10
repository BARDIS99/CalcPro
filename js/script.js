const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const memoryValueEl = document.getElementById('memoryValue');
const memoryNameEl = document.getElementById('memoryName');
const memoryBox = document.getElementById('memoryBox');
const themeButton = document.getElementById('themeButton');
const sidePanel = document.getElementById('sidePanel');
const panelList = document.getElementById('panelList');
const tabHistory = document.getElementById('tabHistory');
const tabMemory = document.getElementById('tabMemory');
const clearBtn = document.getElementById('clearBtn');
const toastEl = document.getElementById('toast');
const calcNav = document.getElementById('calcNav');
const memoryNav = document.getElementById('memoryNav');
const historyNav = document.getElementById('historyNav');
const converterNav = document.getElementById('converterNav');

// Mode toggle elements
const modeBasic = document.getElementById('modeBasic');
const modeAdvanced = document.getElementById('modeAdvanced');
const keypadBasic = document.getElementById('keypadBasic');
const keypadAdvanced = document.getElementById('keypadAdvanced');

// Token elements
const tokensButton = document.getElementById('tokensButton');
const tokenCount = document.getElementById('tokenCount');
const tokenModalOverlay = document.getElementById('tokenModalOverlay');
const tokenCloseBtn = document.getElementById('tokenCloseBtn');
const tokenDismissBtn = document.getElementById('tokenDismissBtn');
const watchAdBtn = document.getElementById('watchAdBtn');
const tokenBalanceDisplay = document.getElementById('tokenBalanceDisplay');
const premiumMoodList = document.getElementById('premiumMoodList');

// Ad modal elements
const adModalOverlay = document.getElementById('adModalOverlay');
const adTimer = document.getElementById('adTimer');
const adCountdown = document.getElementById('adCountdown');
const adCloseBtn = document.getElementById('adCloseBtn');
const adBtnText = document.getElementById('adBtnText');

// Converter elements
const converterPanel = document.getElementById('converterPanel');
const closeConverterPanel = document.getElementById('closeConverterPanel');
const convertAmount = document.getElementById('convertAmount');
const currencyFrom = document.getElementById('currencyFrom');
const currencyTo = document.getElementById('currencyTo');
const swapCurrencies = document.getElementById('swapCurrencies');
const convertBtn = document.getElementById('convertBtn');
const conversionResult = document.getElementById('conversionResult');

// Modal Elements
const saveModalOverlay = document.getElementById('saveModalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalValDisplay = document.getElementById('modalValDisplay');
const modalNameInput = document.getElementById('modalNameInput');
const modalMoodSelector = document.getElementById('modalMoodSelector');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');

let expression = '', current = '0', lastAction = null;
let memory = 0;
let activeMemoryName = 'Memory';
let historyList = [];
let savedMemories = [];
let isLightMode = false;
let currentTab = 'history';
let calcMode = 'basic';
let powerMode = false; // For x^y operation

// Modal state
let modalMode = 'save'; // 'save' | 'rename-active' | 'rename-saved'
let targetSavedId = null;

// Mood options for saved memories - FREE and PREMIUM
const FREE_MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', free: true },
  { id: 'budget', emoji: '💰', label: 'Budget', free: true },
  { id: 'saved', emoji: '✨', label: 'Saved', free: true }
];

const PREMIUM_MOODS = [
  { id: 'work', emoji: '💼', label: 'Work', cost: 10 },
  { id: 'shopping', emoji: '🛒', label: 'Shopping', cost: 10 },
  { id: 'goal', emoji: '🎯', label: 'Goal', cost: 10 },
  { id: 'idea', emoji: '💡', label: 'Idea', cost: 10 },
  { id: 'fire', emoji: '🔥', label: 'Fire', cost: 10 },
  { id: 'rocket', emoji: '🚀', label: 'Rocket', cost: 10 },
  { id: 'star', emoji: '⭐', label: 'Star', cost: 10 },
  { id: 'diamond', emoji: '💎', label: 'Diamond', cost: 10 }
];

let unlockedPremiumMoods = [];
let userTokens = 0;
let selectedMood = FREE_MOODS[0];

let toastTimeout = null;
function showToast(message, emoji = '💾') {
  if (!toastEl) return;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastEl.innerHTML = `<span>${emoji}</span> <span>${message}</span>`;
  toastEl.classList.add('show');
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2400);
}

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

function loadPersistedData() {
  try {
    const savedMemVal = localStorage.getItem('calcMemory');
    if (savedMemVal !== null && !isNaN(Number(savedMemVal))) {
      memory = Number(savedMemVal);
    }
    const savedName = localStorage.getItem('calcMemoryName');
    if (savedName) {
      activeMemoryName = savedName;
    }
    const savedList = localStorage.getItem('calcSavedMemories');
    if (savedList) {
      savedMemories = JSON.parse(savedList);
    }
    const savedHistory = localStorage.getItem('calcHistory');
    if (savedHistory) {
      historyList = JSON.parse(savedHistory);
    }
    // Load tokens and unlocked moods
    const savedTokens = localStorage.getItem('calcTokens');
    if (savedTokens !== null) {
      userTokens = parseInt(savedTokens, 10);
    }
    const savedUnlocked = localStorage.getItem('calcUnlockedMoods');
    if (savedUnlocked) {
      unlockedPremiumMoods = JSON.parse(savedUnlocked);
    }
  } catch(e) {}
}

function persistMemories() {
  try {
    localStorage.setItem('calcMemory', String(memory));
    localStorage.setItem('calcMemoryName', activeMemoryName);
    localStorage.setItem('calcSavedMemories', JSON.stringify(savedMemories));
  } catch(e) {}
}

function persistHistory() {
  try {
    localStorage.setItem('calcHistory', JSON.stringify(historyList));
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
  memoryValueEl.textContent = formatNumber(memory);
  if (memoryNameEl) {
    memoryNameEl.textContent = activeMemoryName;
  }

  // Update memory saved status indicator
  if (memory !== 0 || savedMemories.length > 0) {
    memoryBox.classList.add('has-saved');
  } else {
    memoryBox.classList.remove('has-saved');
  }
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
    historyList.unshift({ expr: (expression + current).trim(), result: result, date: Date.now() });
    if (historyList.length > 50) historyList.pop();
    persistHistory();
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

// Advanced Math Operations
const squareRoot = () => {
  const val = getValue();
  if (val < 0) { current = 'Error'; updateDisplay(); return; }
  current = String(Math.sqrt(val));
  updateDisplay();
};

const square = () => {
  const val = getValue();
  current = String(val * val);
  updateDisplay();
};

const factorial = () => {
  const val = getValue();
  if (val < 0 || !Number.isInteger(val)) { current = 'Error'; updateDisplay(); return; }
  if (val > 170) { current = 'Error'; updateDisplay(); return; } // Prevent overflow
  let result = 1;
  for (let i = 2; i <= val; i++) {
    result *= i;
  }
  current = String(result);
  updateDisplay();
};

const powerOperation = () => {
  expression = current + ' ^ ';
  current = '0';
  powerMode = true;
  lastAction = 'power';
  updateDisplay();
};

const modOperation = () => {
  expression = current + ' mod ';
  current = '0';
  lastAction = 'mod';
  updateDisplay();
};

// Enhanced calculate function
const calculateEnhanced = () => {
  if (!expression) return;
  try {
    let fullExpr = (expression + current).trim();
    
    // Handle power operation
    if (fullExpr.includes('^')) {
      const parts = fullExpr.split('^').map(p => p.trim());
      if (parts.length === 2) {
        const base = parseFloat(parts[0].replace(/,/g, ''));
        const exp = parseFloat(parts[1].replace(/,/g, ''));
        const answer = Math.pow(base, exp);
        if (!isFinite(answer)) { current = 'Error'; updateDisplay(); return; }
        current = String(answer);
        historyList.unshift({ expr: fullExpr, result: current, date: Date.now() });
        if (historyList.length > 50) historyList.pop();
        persistHistory();
        expression = '';
        lastAction = 'equals';
        powerMode = false;
        updateDisplay();
        return;
      }
    }
    
    // Handle modulo operation
    if (fullExpr.includes('mod')) {
      const parts = fullExpr.split('mod').map(p => p.trim());
      if (parts.length === 2) {
        const num1 = parseFloat(parts[0].replace(/,/g, ''));
        const num2 = parseFloat(parts[1].replace(/,/g, ''));
        const answer = num1 % num2;
        if (!isFinite(answer)) { current = 'Error'; updateDisplay(); return; }
        current = String(answer);
        historyList.unshift({ expr: fullExpr, result: current, date: Date.now() });
        if (historyList.length > 50) historyList.pop();
        persistHistory();
        expression = '';
        lastAction = 'equals';
        updateDisplay();
        return;
      }
    }
    
    // Standard calculation
    fullExpr = fullExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '');
    if (/\/\s*0(?!\.\d)/.test(fullExpr)) { current = 'Cannot divide by zero'; updateDisplay(); return; }
    const answer = Function('return (' + fullExpr + ')')();
    if (!isFinite(answer)) { current = 'Error'; updateDisplay(); return; }
    const result = String(answer);
    historyList.unshift({ expr: (expression + current).trim(), result: result, date: Date.now() });
    if (historyList.length > 50) historyList.pop();
    persistHistory();
    expression = '';
    current = result;
    lastAction = 'equals';
    updateDisplay();
  } catch(e) { current = 'Error'; updateDisplay(); }
};

// Token System Functions
function updateTokenDisplay() {
  if (tokenCount) tokenCount.textContent = userTokens;
  if (tokenBalanceDisplay) tokenBalanceDisplay.textContent = `${userTokens} Tokens`;
}

function persistTokens() {
  try {
    localStorage.setItem('calcTokens', String(userTokens));
    localStorage.setItem('calcUnlockedMoods', JSON.stringify(unlockedPremiumMoods));
  } catch(e) {}
}

function getAllAvailableMoods() {
  const available = [...FREE_MOODS];
  PREMIUM_MOODS.forEach(mood => {
    if (unlockedPremiumMoods.includes(mood.id)) {
      available.push(mood);
    }
  });
  return available;
}

function openTokenModal() {
  if (!tokenModalOverlay) return;
  updateTokenDisplay();
  renderPremiumMoodsList();
  tokenModalOverlay.classList.add('active');
}

function closeTokenModal() {
  if (tokenModalOverlay) tokenModalOverlay.classList.remove('active');
}

function renderPremiumMoodsList() {
  if (!premiumMoodList) return;
  let html = '';
  PREMIUM_MOODS.forEach(mood => {
    const isUnlocked = unlockedPremiumMoods.includes(mood.id);
    html += `
      <div class="premium-mood-item ${isUnlocked ? 'unlocked' : 'locked'}" data-mood-id="${mood.id}">
        <span>${mood.emoji}</span>
        <span>${mood.label}</span>
        ${!isUnlocked ? `<span style="font-size:10px;margin-left:4px;">(${mood.cost}🪙)</span>` : ''}
      </div>
    `;
  });
  premiumMoodList.innerHTML = html;
  
  // Add click to unlock
  premiumMoodList.querySelectorAll('.premium-mood-item.locked').forEach(item => {
    item.style.cursor = 'pointer';
    item.onclick = () => {
      const moodId = item.getAttribute('data-mood-id');
      attemptUnlockMood(moodId);
    };
  });
}

function attemptUnlockMood(moodId) {
  const mood = PREMIUM_MOODS.find(m => m.id === moodId);
  if (!mood) return;
  
  if (unlockedPremiumMoods.includes(moodId)) {
    showToast(`${mood.emoji} ${mood.label} is already unlocked!`, '✓');
    return;
  }
  
  if (userTokens < mood.cost) {
    showToast(`Not enough tokens! Need ${mood.cost}🪙, you have ${userTokens}🪙`, '❌');
    return;
  }
  
  userTokens -= mood.cost;
  unlockedPremiumMoods.push(moodId);
  persistTokens();
  updateTokenDisplay();
  renderPremiumMoodsList();
  showToast(`Unlocked ${mood.emoji} ${mood.label}!`, '🎉');
}

function watchAdSimulation() {
  if (!adModalOverlay) return;
  
  closeTokenModal();
  adModalOverlay.classList.add('active');
  adCloseBtn.disabled = true;
  adBtnText.textContent = 'Please wait...';
  
  let countdown = 5;
  adTimer.textContent = `${countdown}s`;
  adCountdown.textContent = countdown;
  
  const interval = setInterval(() => {
    countdown--;
    adTimer.textContent = `${countdown}s`;
    adCountdown.textContent = countdown;
    
    if (countdown <= 0) {
      clearInterval(interval);
      adCloseBtn.disabled = false;
      adBtnText.textContent = '✓ Claim 10 Tokens';
    }
  }, 1000);
}

function closeAdModal() {
  if (!adModalOverlay) return;
  if (adCloseBtn.disabled) return;
  
  // Award tokens (increased from 5 to 10)
  userTokens += 10;
  persistTokens();
  updateTokenDisplay();
  
  adModalOverlay.classList.remove('active');
  showToast('Earned 10 tokens! 🪙', '🎉');
  
  // Reset ad state
  adCloseBtn.disabled = true;
  adBtnText.textContent = 'Please wait...';
  adTimer.textContent = '5s';
  adCountdown.textContent = '5';
}

// Memory Actions
function saveCurrentToMemory(customMood, customName) {
  const val = getValue();
  const mood = customMood || selectedMood;
  const name = (customName && customName.trim()) ? customName.trim() : '';
  memory = val;
  activeMemoryName = name || `${mood.emoji} ${mood.label}`;

  const newEntry = {
    id: Date.now().toString(),
    value: String(val),
    name: name,
    mood: { emoji: mood.emoji, label: mood.label },
    timestamp: Date.now()
  };
  savedMemories.unshift(newEntry);
  if (savedMemories.length > 50) savedMemories.pop();
  persistMemories();
  updateDisplay();
  const labelText = name ? `"${name}"` : `${mood.emoji} ${mood.label}`;
  showToast(`Saved to Memory: ${labelText} (${formatNumber(val)})`, mood.emoji);
  if (sidePanel.classList.contains('open') && currentTab === 'memory') {
    renderSavedMemories();
  }
}

// Modal Logic
function renderModalMoodChips() {
  if (!modalMoodSelector) return;
  const availableMoods = getAllAvailableMoods();
  modalMoodSelector.innerHTML = availableMoods.map(m => `
    <button type="button" class="mood-chip-btn ${selectedMood.id === m.id ? 'selected' : ''}" data-mood="${m.id}">
      <span>${m.emoji}</span> <span>${m.label}</span>
    </button>
  `).join('');

  modalMoodSelector.querySelectorAll('.mood-chip-btn').forEach(btn => {
    btn.onclick = () => {
      const moodId = btn.getAttribute('data-mood');
      const found = availableMoods.find(m => m.id === moodId);
      if (found) {
        selectedMood = found;
        renderModalMoodChips();
      }
    };
  });
}

function openSaveModal() {
  modalMode = 'save';
  modalTitle.textContent = 'Save to Memory';
  modalValDisplay.textContent = formatNumber(current);
  modalNameInput.value = '';
  modalNameInput.placeholder = 'Name this memory (e.g. Rent, Groceries)...';
  renderModalMoodChips();
  saveModalOverlay.classList.add('active');
  setTimeout(() => modalNameInput.focus(), 80);
}

function openRenameActiveMemoryModal() {
  modalMode = 'rename-active';
  modalTitle.textContent = 'Rename Active Memory';
  modalValDisplay.textContent = formatNumber(memory);
  modalNameInput.value = activeMemoryName === 'Memory' ? '' : activeMemoryName;
  modalNameInput.placeholder = 'Enter new name (e.g. Rent, Savings)...';
  renderModalMoodChips();
  saveModalOverlay.classList.add('active');
  setTimeout(() => modalNameInput.focus(), 80);
}

function openRenameSavedModal(id) {
  const item = savedMemories.find(m => m.id === id);
  if (!item) return;
  targetSavedId = id;
  modalMode = 'rename-saved';
  modalTitle.textContent = 'Rename Saved Memory';
  modalValDisplay.textContent = formatNumber(item.value);
  modalNameInput.value = item.name || '';
  modalNameInput.placeholder = 'Enter name for this memory...';
  if (item.mood) {
    const availableMoods = getAllAvailableMoods();
    const match = availableMoods.find(m => m.label === item.mood.label);
    if (match) selectedMood = match;
  }
  renderModalMoodChips();
  saveModalOverlay.classList.add('active');
  setTimeout(() => modalNameInput.focus(), 80);
}

function closeModal() {
  saveModalOverlay.classList.remove('active');
}

function handleModalSubmit() {
  const name = modalNameInput.value.trim();
  if (modalMode === 'save') {
    saveCurrentToMemory(selectedMood, name);
  } else if (modalMode === 'rename-active') {
    activeMemoryName = name || 'Memory';
    persistMemories();
    updateDisplay();
    showToast(`Active Memory renamed to "${activeMemoryName}"`, '✏️');
  } else if (modalMode === 'rename-saved') {
    const item = savedMemories.find(m => m.id === targetSavedId);
    if (item) {
      item.name = name;
      item.mood = { emoji: selectedMood.emoji, label: selectedMood.label };
      persistMemories();
      if (currentTab === 'memory') renderSavedMemories();
      showToast(`Memory renamed to "${name || item.mood.label}"`, '✏️');
    }
  }
  closeModal();
}

modalCancelBtn.onclick = closeModal;
modalCloseBtn.onclick = closeModal;
modalSaveBtn.onclick = handleModalSubmit;
modalNameInput.onkeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleModalSubmit();
  } else if (e.key === 'Escape') {
    closeModal();
  }
};
saveModalOverlay.onclick = (e) => {
  if (e.target === saveModalOverlay) closeModal();
};

document.querySelectorAll('.btn').forEach(btn => {
  btn.onclick = () => {
    const val = btn.getAttribute('data-value'), action = btn.getAttribute('data-action');
    if (val) { (val === '+' || val === '-' || val === '×' || val === '÷') ? addOperator(val) : addNumber(val); }
    else if (action === 'clear') clearAll();
    else if (action === 'sign') toggleSign();
    else if (action === 'percent') percentage();
    else if (action === 'delete') deleteChar();
    else if (action === 'equals') calculateEnhanced();
    else if (action === 'sqrt') squareRoot();
    else if (action === 'square') square();
    else if (action === 'factorial') factorial();
    else if (action === 'power') powerOperation();
    else if (action === 'mod') modOperation();
  };
});

document.querySelectorAll('.mem-btn').forEach(btn => {
  btn.onclick = () => {
    const action = btn.getAttribute('data-action');
    if (action === 'MS') {
      openSaveModal();
    } else if (action === 'M+') {
      const added = getValue();
      memory += added;
      persistMemories();
      showToast(`M+ Added: +${formatNumber(added)} (Total: ${formatNumber(memory)})`, '➕');
    } else if (action === 'M-') {
      const subbed = getValue();
      memory -= subbed;
      persistMemories();
      showToast(`M- Subtracted: -${formatNumber(subbed)} (Total: ${formatNumber(memory)})`, '➖');
    } else if (action === 'MR') {
      current = String(memory);
      updateDisplay();
      showToast(`Memory Recalled: ${activeMemoryName} (${formatNumber(memory)})`, '📥');
    } else if (action === 'MC') {
      memory = 0;
      activeMemoryName = 'Memory';
      persistMemories();
      showToast('Memory Cleared', '🧹');
    }
    updateDisplay();
  };
});

function formatTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Side Panel Rendering
const renderHistory = () => {
  currentTab = 'history';
  tabHistory.classList.add('active');
  tabMemory.classList.remove('active');
  clearBtn.textContent = 'Clear History';

  if (historyList.length === 0) {
    panelList.innerHTML = '<div style="text-align:center;color:var(--muted);padding:40px">No calculations in history yet</div>';
    return;
  }
  let html = '';
  historyList.forEach((item, i) => {
    html += `
      <div class="history-item" data-index="${i}">
        <div class="item-expr">${item.expr}</div>
        <div class="item-result">${formatNumber(item.result)}</div>
        <div class="history-item-actions">
          <button class="history-action-btn copy-btn" data-text="${item.expr} = ${item.result}">📋 Copy</button>
          <button class="history-action-btn share-btn" data-text="${item.expr} = ${item.result}">📤 Share</button>
        </div>
      </div>
    `;
  });
  panelList.innerHTML = html;
  
  panelList.querySelectorAll('.history-item').forEach(item => {
    const actionsDiv = item.querySelector('.history-item-actions');
    item.onclick = (e) => {
      if (!actionsDiv.contains(e.target)) {
        current = historyList[item.getAttribute('data-index')].result;
        expression = '';
        lastAction = 'equals';
        updateDisplay();
        closePanel();
      }
    };
  });
  
  // Copy button handlers
  panelList.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const text = btn.getAttribute('data-text');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied to clipboard!', '📋');
        }).catch(() => {
          showToast('Copy failed', '❌');
        });
      } else {
        showToast('Clipboard not supported', '❌');
      }
    };
  });
  
  // Share button handlers
  panelList.querySelectorAll('.share-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const text = btn.getAttribute('data-text');
      if (navigator.share) {
        navigator.share({
          title: 'CalcPro Calculation',
          text: text
        }).then(() => {
          showToast('Shared successfully!', '✓');
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            showToast('Share cancelled', 'ℹ️');
          }
        });
      } else {
        // Fallback to copy
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard! (Share not supported)', '📋');
          });
        } else {
          showToast('Share not supported on this device', '❌');
        }
      }
    };
  });
};

const renderSavedMemories = () => {
  currentTab = 'memory';
  tabMemory.classList.add('active');
  tabHistory.classList.remove('active');
  clearBtn.textContent = 'Clear All Saved Memories';

  // Quick save widget at top
  const availableMoods = getAllAvailableMoods();
  let moodChipsHtml = availableMoods.map(m => `
    <button type="button" class="mood-chip-btn ${selectedMood.id === m.id ? 'selected' : ''}" data-mood="${m.id}">
      <span>${m.emoji}</span> <span>${m.label}</span>
    </button>
  `).join('');

  let quickSaveHtml = `
    <div class="quick-save-card">
      <div class="quick-save-title">
        <span>Save Memory with Name & Mood</span>
        <span>Active: ${formatNumber(memory)}</span>
      </div>
      <div class="quick-save-current">${formatNumber(current)}</div>
      <input type="text" class="custom-name-input" id="quickSaveNameInput" placeholder="Name this memory (e.g. Rent, Groceries, Dinner)..." maxlength="35" autocomplete="off" />
      <div class="mood-selector" id="moodSelector">
        ${moodChipsHtml}
      </div>
      <button class="save-action-btn" id="saveQuickBtn">
        <span>💾</span> Save Memory
      </button>
    </div>
  `;

  if (savedMemories.length === 0) {
    panelList.innerHTML = quickSaveHtml + '<div style="text-align:center;color:var(--muted);padding:30px">No saved memory items yet.<br>Click "Save Memory" above or "MS" on the keypad!</div>';
  } else {
    let itemsHtml = savedMemories.map((item, idx) => `
      <div class="saved-memory-item" data-id="${item.id}">
        <div class="saved-memory-header">
          <div class="saved-name-row">
            ${item.name ? `<span class="saved-name-text">${item.name}</span>` : `<span class="saved-name-text" style="color:var(--muted);font-weight:normal;font-style:italic;">Unnamed</span>`}
            <button class="rename-btn" data-id="${item.id}" title="Rename">✎</button>
          </div>
          <span class="saved-mood-tag">${item.mood?.emoji || '✨'} ${item.mood?.label || 'Saved'}</span>
        </div>
        <div class="saved-memory-body">
          <div class="saved-memory-val">${formatNumber(item.value)}</div>
          <span class="saved-time">${formatTime(item.timestamp)}</span>
        </div>
        <div class="saved-actions">
          <button class="saved-action-btn recall-btn" data-id="${item.id}" data-val="${item.value}">Recall</button>
          <button class="saved-action-btn add-btn" data-val="${item.value}">+ Add</button>
          <button class="saved-action-btn delete" data-index="${idx}" title="Delete">✕</button>
        </div>
      </div>
    `).join('');

    panelList.innerHTML = quickSaveHtml + itemsHtml;
  }

  // Bind quick save events
  panelList.querySelectorAll('.mood-chip-btn').forEach(btn => {
    btn.onclick = () => {
      const moodId = btn.getAttribute('data-mood');
      const found = availableMoods.find(m => m.id === moodId);
      if (found) {
        selectedMood = found;
        renderSavedMemories();
      }
    };
  });

  const saveQuickBtn = document.getElementById('saveQuickBtn');
  const quickSaveNameInput = document.getElementById('quickSaveNameInput');
  if (saveQuickBtn) {
    saveQuickBtn.onclick = () => {
      const name = quickSaveNameInput ? quickSaveNameInput.value.trim() : '';
      saveCurrentToMemory(selectedMood, name);
    };
  }
  if (quickSaveNameInput) {
    quickSaveNameInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const name = quickSaveNameInput.value.trim();
        saveCurrentToMemory(selectedMood, name);
      }
    };
  }

  // Bind item action buttons
  panelList.querySelectorAll('.rename-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openRenameSavedModal(id);
    };
  });

  panelList.querySelectorAll('.recall-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = savedMemories.find(m => m.id === id);
      current = btn.getAttribute('data-val');
      if (item) {
        activeMemoryName = item.name || item.mood?.label || 'Memory';
        memory = Number(item.value);
        persistMemories();
      }
      expression = '';
      lastAction = 'equals';
      updateDisplay();
      showToast(`Recalled "${activeMemoryName}" (${formatNumber(current)})`, '📥');
      closePanel();
    };
  });

  panelList.querySelectorAll('.add-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const valToAdd = btn.getAttribute('data-val');
      expression = (expression && lastAction !== 'equals') ? expression + current + ' + ' : current + ' + ';
      current = valToAdd;
      lastAction = 'operator';
      updateDisplay();
      showToast(`Appended +${formatNumber(valToAdd)}`, '➕');
      closePanel();
    };
  });

  panelList.querySelectorAll('.saved-action-btn.delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      savedMemories.splice(idx, 1);
      persistMemories();
      renderSavedMemories();
      updateDisplay();
      showToast('Memory item deleted', '🗑️');
    };
  });
};

function setActiveNav(navId) {
  document.querySelectorAll('nav .nav-btn').forEach(btn => btn.classList.remove('active'));
  const target = document.getElementById(navId);
  if (target) target.classList.add('active');
}

const openHistory = () => {
  renderHistory();
  sidePanel.classList.add('open');
  setActiveNav('historyNav');
};

const openMemorySaved = () => {
  renderSavedMemories();
  sidePanel.classList.add('open');
  setActiveNav('memoryNav');
};

const closePanel = () => {
  sidePanel.classList.remove('open');
  setActiveNav('calcNav');
};

tabHistory.onclick = renderHistory;
tabMemory.onclick = renderSavedMemories;

if (historyNav) historyNav.onclick = openHistory;
if (memoryNav) memoryNav.onclick = openMemorySaved;
if (calcNav) calcNav.onclick = closePanel;
if (converterNav) converterNav.onclick = () => {
  converterPanel.classList.add('open');
  setActiveNav('converterNav');
};
if (closeConverterPanel) {
  closeConverterPanel.onclick = () => {
    converterPanel.classList.remove('open');
    setActiveNav('calcNav');
  };
}
if (memoryBox) {
  memoryBox.onclick = (e) => {
    if (e.target === memoryNameEl) {
      openRenameActiveMemoryModal();
    } else {
      openMemorySaved();
    }
  };
}
if (memoryNameEl) {
  memoryNameEl.onclick = (e) => {
    e.stopPropagation();
    openRenameActiveMemoryModal();
  };
}

// Mode toggle
if (modeBasic) {
  modeBasic.onclick = () => {
    calcMode = 'basic';
    modeBasic.classList.add('active');
    modeAdvanced.classList.remove('active');
    keypadBasic.style.display = 'grid';
    keypadAdvanced.style.display = 'none';
  };
}

if (modeAdvanced) {
  modeAdvanced.onclick = () => {
    calcMode = 'advanced';
    modeAdvanced.classList.add('active');
    modeBasic.classList.remove('active');
    keypadAdvanced.style.display = 'grid';
    keypadBasic.style.display = 'none';
  };
}

// Token button
if (tokensButton) {
  tokensButton.onclick = openTokenModal;
}

if (tokenCloseBtn) tokenCloseBtn.onclick = closeTokenModal;
if (tokenDismissBtn) tokenDismissBtn.onclick = closeTokenModal;
if (watchAdBtn) watchAdBtn.onclick = watchAdSimulation;
if (adCloseBtn) adCloseBtn.onclick = closeAdModal;

if (tokenModalOverlay) {
  tokenModalOverlay.onclick = (e) => {
    if (e.target === tokenModalOverlay) closeTokenModal();
  };
}

// Currency Converter
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  CAD: 1.36,
  AUD: 1.53
};

if (swapCurrencies) {
  swapCurrencies.onclick = () => {
    const temp = currencyFrom.value;
    currencyFrom.value = currencyTo.value;
    currencyTo.value = temp;
  };
}

if (convertBtn) {
  convertBtn.onclick = () => {
    const amount = parseFloat(convertAmount.value) || 0;
    const from = currencyFrom.value;
    const to = currencyTo.value;
    
    // Convert through USD as base
    const inUSD = amount / exchangeRates[from];
    const result = inUSD * exchangeRates[to];
    
    if (conversionResult) {
      conversionResult.classList.remove('empty');
      conversionResult.innerHTML = `
        <div>
          <div style="font-size:14px;color:var(--muted);margin-bottom:4px;">${formatNumber(amount)} ${from} =</div>
          <div style="font-size:24px;font-weight:600;color:var(--accent2);">${formatNumber(result.toFixed(2))} ${to}</div>
        </div>
      `;
    }
  };
}

// Use current calculator result in converter
if (convertAmount) {
  convertAmount.onfocus = () => {
    if (current !== '0' && current !== 'Error' && current !== 'Cannot divide by zero') {
      convertAmount.value = getValue();
    }
  };
}

document.getElementById('historyButton').onclick = openHistory;
document.getElementById('closePanel').onclick = closePanel;

clearBtn.onclick = () => {
  if (currentTab === 'history') {
    historyList = [];
    persistHistory();
    renderHistory();
    showToast('History cleared', '🧹');
  } else {
    savedMemories = [];
    activeMemoryName = 'Memory';
    persistMemories();
    renderSavedMemories();
    updateDisplay();
    showToast('All saved memories cleared', '🧹');
  }
};

// PWA Installation & Service Worker Integration
const installButton = document.getElementById('installButton');
const installModalOverlay = document.getElementById('installModalOverlay');
const installCloseBtn = document.getElementById('installCloseBtn');
const installDismissBtn = document.getElementById('installDismissBtn');
const installActionBtn = document.getElementById('installActionBtn');
const installGuideContent = document.getElementById('installGuideContent');
const offlineIndicator = document.getElementById('offlineIndicator');

let deferredPrompt = null;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

if (isStandalone && installButton) {
  installButton.classList.add('installed');
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('CalcPro ServiceWorker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('CalcPro ServiceWorker registration failed:', err);
      });
  });
}

// Capture install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installButton) {
    installButton.classList.remove('installed');
  }
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  if (installButton) installButton.classList.add('installed');
  if (installModalOverlay) installModalOverlay.classList.remove('active');
  showToast('CalcPro installed successfully! Ready offline.', '🚀');
});

// Offline / Online status
function updateOnlineStatus() {
  if (!navigator.onLine) {
    if (offlineIndicator) offlineIndicator.classList.add('show');
    showToast('Offline Mode Active', '⚡');
  } else {
    if (offlineIndicator) offlineIndicator.classList.remove('show');
  }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

function openInstallModal() {
  if (!installModalOverlay) return;

  if (isStandalone) {
    showToast('CalcPro is already installed on your device!', '✓');
    return;
  }

  if (deferredPrompt) {
    // Native install prompt available
    installGuideContent.innerHTML = `
      <ul class="install-steps">
        <li class="install-step-item">
          <span class="install-step-num">1</span>
          <span>Click <strong>Install App</strong> below to add CalcPro directly to your device.</span>
        </li>
        <li class="install-step-item">
          <span class="install-step-num">2</span>
          <span>Launch CalcPro anytime right from your home screen or desktop.</span>
        </li>
      </ul>
    `;
    installActionBtn.style.display = 'block';
    installActionBtn.textContent = '📲 Install Now';
  } else if (isIOS) {
    // iOS Safari instructions
    installGuideContent.innerHTML = `
      <p style="margin-bottom:8px;font-weight:600;color:var(--accent2);">To install on iPhone or iPad:</p>
      <ul class="install-steps">
        <li class="install-step-item">
          <span class="install-step-num">1</span>
          <span>Tap the <strong>Share</strong> button (square with arrow) in Safari's toolbar.</span>
        </li>
        <li class="install-step-item">
          <span class="install-step-num">2</span>
          <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
        </li>
        <li class="install-step-item">
          <span class="install-step-num">3</span>
          <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
        </li>
      </ul>
    `;
    installActionBtn.style.display = 'none';
  } else {
    // Desktop Chrome/Edge or other browser fallback
    installGuideContent.innerHTML = `
      <ul class="install-steps">
        <li class="install-step-item">
          <span class="install-step-num">1</span>
          <span>Click the <strong>Install</strong> icon in your browser address bar (top-right).</span>
        </li>
        <li class="install-step-item">
          <span class="install-step-num">2</span>
          <span>Or open the browser menu (⋮) and choose <strong>Install CalcPro</strong>.</span>
        </li>
      </ul>
    `;
    installActionBtn.style.display = 'none';
  }

  installModalOverlay.classList.add('active');
}

function closeInstallModal() {
  if (installModalOverlay) installModalOverlay.classList.remove('active');
}

if (installButton) {
  installButton.onclick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt().then(({ outcome }) => {
        if (outcome === 'accepted') {
          deferredPrompt = null;
          installButton.classList.add('installed');
        }
      }).catch(() => {
        openInstallModal();
      });
    } else {
      openInstallModal();
    }
  };
}

if (installActionBtn) {
  installActionBtn.onclick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt().then(({ outcome }) => {
        if (outcome === 'accepted') {
          deferredPrompt = null;
          if (installButton) installButton.classList.add('installed');
          closeInstallModal();
        }
      });
    } else {
      closeInstallModal();
    }
  };
}

if (installCloseBtn) installCloseBtn.onclick = closeInstallModal;
if (installDismissBtn) installDismissBtn.onclick = closeInstallModal;
if (installModalOverlay) {
  installModalOverlay.onclick = (e) => {
    if (e.target === installModalOverlay) closeInstallModal();
  };
}

loadTheme();
loadPersistedData();
updateDisplay();
updateTokenDisplay();



