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

// Modal state
let modalMode = 'save'; // 'save' | 'rename-active' | 'rename-saved'
let targetSavedId = null;

// Mood options for saved memories
const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'budget', emoji: '💰', label: 'Budget' },
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'shopping', emoji: '🛒', label: 'Shopping' },
  { id: 'goal', emoji: '🎯', label: 'Goal' },
  { id: 'idea', emoji: '💡', label: 'Idea' },
  { id: 'saved', emoji: '✨', label: 'Saved' }
];
let selectedMood = MOODS[0];

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
  modalMoodSelector.innerHTML = MOODS.map(m => `
    <button type="button" class="mood-chip-btn ${selectedMood.id === m.id ? 'selected' : ''}" data-mood="${m.id}">
      <span>${m.emoji}</span> <span>${m.label}</span>
    </button>
  `).join('');

  modalMoodSelector.querySelectorAll('.mood-chip-btn').forEach(btn => {
    btn.onclick = () => {
      const moodId = btn.getAttribute('data-mood');
      const found = MOODS.find(m => m.id === moodId);
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
    const match = MOODS.find(m => m.label === item.mood.label);
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
    else if (action === 'equals') calculate();
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
    html += `<div class="history-item" data-index="${i}"><div class="item-expr">${item.expr}</div><div class="item-result">${formatNumber(item.result)}</div></div>`;
  });
  panelList.innerHTML = html;
  panelList.querySelectorAll('.history-item').forEach(item => {
    item.onclick = () => {
      current = historyList[item.getAttribute('data-index')].result;
      expression = '';
      lastAction = 'equals';
      updateDisplay();
      closePanel();
    };
  });
};

const renderSavedMemories = () => {
  currentTab = 'memory';
  tabMemory.classList.add('active');
  tabHistory.classList.remove('active');
  clearBtn.textContent = 'Clear All Saved Memories';

  // Quick save widget at top
  let moodChipsHtml = MOODS.map(m => `
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
      const found = MOODS.find(m => m.id === moodId);
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



