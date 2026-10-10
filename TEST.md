# CalcPro - Testing Checklist

## ✅ Fixed Issues
- **JavaScript Syntax Error**: Removed duplicate function declarations for `squareRoot`, `square`, `factorial`, `powerOperation`, `modOperation`, and `calculateEnhanced`
- **Server**: Restarted successfully on port 3000

## 🧪 Test Each Feature

### 1. Basic Calculator (Should Work)
- [ ] Click numbers 1-9, 0
- [ ] Click operators: +, −, ×, ÷
- [ ] Click = to calculate
- [ ] Click AC to clear
- [ ] Click ⌫ to delete
- [ ] Click +/- to toggle sign
- [ ] Click % for percentage

**Test**: `5 + 3 =` should give `8`

### 2. Mode Toggle (Should Work)
- [ ] Click "Basic" button - shows basic keypad
- [ ] Click "Advanced" button - shows advanced keypad with √, x², x^y, mod, n!

### 3. Advanced Operations (Should Work)
Switch to Advanced mode:
- [ ] Enter `25`, click `√` → should show `5`
- [ ] Enter `5`, click `x²` → should show `25`
- [ ] Enter `2`, click `x^y`, enter `10`, click `=` → should show `1024`
- [ ] Enter `5`, click `n!` → should show `120`
- [ ] Enter `17`, click `mod`, enter `5`, click `=` → should show `2`

### 4. Token System (Should Work)
- [ ] Click 🪙 token button in header
- [ ] Modal opens showing "0 Tokens"
- [ ] Click "📺 Watch Ad (+5 🪙)"
- [ ] Ad modal appears with countdown from 5
- [ ] After 5 seconds, button enables
- [ ] Click "✓ Claim 5 Tokens"
- [ ] Toast shows "Earned 5 tokens! 🪙"
- [ ] Token counter updates to "5"

### 5. Premium Moods (Should Work)
After earning tokens:
- [ ] Open token modal (🪙 button)
- [ ] See 8 locked premium moods
- [ ] Click a locked mood (e.g., 💼 Work)
- [ ] If you have 10+ tokens, it unlocks
- [ ] If not, shows "Not enough tokens" message
- [ ] Unlocked mood shows ✓ checkmark

### 6. Memory System (Should Work)
- [ ] Calculate `100 × 5 = 500`
- [ ] Click `MS` button
- [ ] Modal opens with current value
- [ ] Type name: "Test Memory"
- [ ] Select a mood tag
- [ ] Click "Save Memory"
- [ ] Toast confirms save
- [ ] Memory bar shows saved value

### 7. Memory Navigation (Should Work)
- [ ] Click 💾 "Saved" nav button
- [ ] Panel opens showing saved memories
- [ ] See quick save widget at top
- [ ] See list of saved memories below
- [ ] Click "Recall" on a memory → loads value
- [ ] Click "+ Add" on a memory → appends to calculation
- [ ] Click "✕" → deletes memory
- [ ] Click "✎" → opens rename modal

### 8. History (Should Work)
- [ ] Perform several calculations
- [ ] Click 🕑 "History" nav button
- [ ] Panel opens showing history
- [ ] Click a history item → recalls result
- [ ] Click "📋 Copy" → copies to clipboard
- [ ] Click "📤 Share" → opens share dialog (mobile) or copies
- [ ] Click "Clear" → clears all history

### 9. Currency Converter (Should Work)
- [ ] Calculate `1000`
- [ ] Click 💱 "Convert" nav button
- [ ] Panel opens
- [ ] Amount field shows `1000`
- [ ] Select "From: USD", "To: EUR"
- [ ] Click "Convert"
- [ ] Shows conversion result (~920 EUR)
- [ ] Click ⇄ → swaps currencies

### 10. Theme Toggle (Should Work)
- [ ] Click ☀/☾ button in header
- [ ] Theme switches between dark and light
- [ ] Preference persists on reload

### 11. Display & Expression (Should Work)
- [ ] Type `5 + 3`
- [ ] Top shows expression: "5 + 3"
- [ ] Bottom shows current: "3"
- [ ] Press `=`
- [ ] Top clears
- [ ] Bottom shows: "8"

### 12. PWA Install (Should Work)
- [ ] Click 📲 "Install" button
- [ ] Modal shows install instructions
- [ ] On Chrome: click install button
- [ ] On iOS Safari: shows manual instructions
- [ ] App can be installed to home screen/desktop

## 🐛 Common Issues to Check

### If buttons don't work:
1. Open browser console (F12)
2. Look for JavaScript errors
3. Check if elements have correct IDs

### If modals don't open:
1. Check console for errors
2. Verify modal overlay classes are added
3. Test click events manually

### If localStorage doesn't work:
1. Check if in incognito/private mode
2. Verify localStorage is enabled
3. Check browser storage quota

## 📊 Expected Console Messages

When app loads successfully:
```
CalcPro ServiceWorker registered: ...
```

No errors should appear in console.

## 🎯 Quick Test Sequence

1. Basic: `2 + 2 = 4` ✓
2. Advanced: Switch mode → `9` → `√` = `3` ✓
3. Tokens: Click 🪙 → Watch Ad → Earn 5 tokens ✓
4. Memory: `100` → `MS` → Save as "Test" ✓
5. History: Check history has calculations ✓
6. Convert: `100` → Convert → USD to EUR ✓
7. Share: History → Click 📋 Copy ✓

If all 7 work, app is fully functional! 🎉

## 🌐 Test URL

**Local**: http://localhost:3000
**LAN**: http://0.0.0.0:3000

Open in:
- Desktop browser (Chrome, Firefox, Edge)
- Mobile browser (Safari iOS, Chrome Android)
- Test PWA install
- Test offline (disconnect, refresh)

---

## 📝 Report Issues

If something doesn't work:
1. Note what you clicked
2. Check browser console for errors
3. Note any error messages
4. Test in different browser
5. Report back with details!
