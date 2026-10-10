# CalcPro

Modern Progressive Web App calculator with advanced mathematical operations, gamified rewards system, and powerful memory management.

## ✨ Features

### 🧮 Calculator Modes
- **Basic Mode**: Standard calculator with essential operations (+, −, ×, ÷, %, +/-)
- **Advanced Mode**: Scientific calculator with:
  - Square Root (√)
  - Square (x²)
  - Power (x^y)
  - Factorial (n!)
  - Modulo (mod)

### 💾 Smart Memory System
- Save calculations with custom names (e.g., "Rent", "Groceries")
- Apply mood tags to organize your saved memories
- Quick memory operations: M+, M−, MR, MC, MS
- Persistent storage across sessions
- Rename and manage saved memories

### 🪙 Token Rewards & Mood Tags
- **Free Mood Tags**: 😊 Happy, 💰 Budget, ✨ Saved
- **Premium Mood Tags** (unlock with tokens):
  - 💼 Work
  - 🛒 Shopping
  - 🎯 Goal
  - 💡 Idea
  - 🔥 Fire
  - 🚀 Rocket
  - ⭐ Star
  - 💎 Diamond
- **Earn Tokens**: Watch a 5-second ad to earn 10 tokens
- **Unlock Premium**: Each premium mood tag costs 10 tokens

### 🕑 Calculation History
- Automatic history tracking (stores up to 50 calculations)
- Click any history item to recall the result
- **Copy** calculations to clipboard
- **Share** calculations via native share API
- Persistent history saved in localStorage

### 💱 Currency Converter
- Convert between 8 major currencies:
  - USD (US Dollar)
  - EUR (Euro)
  - GBP (British Pound)
  - JPY (Japanese Yen)
  - CNY (Chinese Yuan)
  - INR (Indian Rupee)
  - CAD (Canadian Dollar)
  - AUD (Australian Dollar)
- Quick swap between currencies
- Auto-fill from calculator result

### 🎨 Theme Support
- Dark mode (default)
- Light mode
- Persistent theme preference

### 📱 PWA Features
- Installable as a native app on any device
- Works offline with service worker
- Responsive design for mobile and desktop
- Fast, cached performance

## 🚀 How to Run

### Option 1: Simple (Static)
Open `index.html` in any modern browser.

### Option 2: Development Server (Recommended)
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

### Option 3: Production
1. Deploy to any static hosting (Vercel, Netlify, GitHub Pages, etc.)
2. The app will work offline after first visit

## 📂 Project Structure

```
calcpro/
├── index.html          # Main HTML structure
├── css/
│   └── style.css      # All styles (dark/light themes)
├── js/
│   └── script.js      # Core calculator logic & features
├── icons/             # PWA icons and assets
├── manifest.json      # PWA manifest
├── sw.js             # Service worker for offline support
├── server.js         # Express development server
└── package.json      # Dependencies and scripts
```

## 🎮 Usage Guide

### Basic Calculations
1. Click numbers and operators to build expressions
2. Press `=` to calculate
3. Use `AC` to clear, `⌫` to delete last digit

### Advanced Operations
1. Toggle to **Advanced Mode**
2. Use scientific functions:
   - `√`: Square root of current number
   - `x²`: Square the current number
   - `x^y`: Enter base, press `x^y`, enter exponent, press `=`
   - `n!`: Factorial of current number (max 170)
   - `mod`: Enter first number, press `mod`, enter second number, press `=`

### Memory Management
1. Press `MS` to save current value with a custom name and mood
2. Choose a mood tag (free or unlocked premium)
3. Use `M+` / `M−` to add/subtract from memory
4. Press `MR` to recall memory value
5. Click memory bar to view all saved memories

### Earning Tokens
1. Click the 🪙 token button in the header
2. Press "Watch Ad (+5 🪙)"
3. Wait 5 seconds
4. Claim your 5 tokens
5. Use tokens to unlock premium mood tags (10 tokens each)

### Currency Conversion
1. Navigate to the **Convert** tab
2. Enter amount (or use calculator result)
3. Select source and target currencies
4. Press "Convert"
5. Use ⇄ to quickly swap currencies

### Sharing Calculations
1. Go to **History** tab
2. Click **📋 Copy** to copy to clipboard
3. Click **📤 Share** to use native share (mobile)

## 🛠️ Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: localStorage API
- **PWA**: Service Workers, Web App Manifest
- **Server**: Express.js (development only)
- **Icons**: PNG generation with pngjs

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11.3+)
- Any modern browser with PWA support

## 📝 License

Open source - feel free to use and modify!

## 🎯 Future Enhancements

- More currencies and live exchange rates
- Additional scientific functions (sin, cos, tan, log)
- Calculation export (PDF, CSV)
- Cloud sync for saved memories
- More reward systems and achievements
- Custom themes and color schemes


