import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.join(__dirname, '..', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Draw a calculator app icon into a PNG buffer
function generateAppIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const padding = isMaskable ? size * 0.15 : size * 0.05;
  const boxRadius = (size / 2) - padding;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - center;
      const dy = y - center;

      // Base gradient: Deep violet/indigo (#100c28 to #2c1254)
      const gradT = (y + x) / (size * 2);
      let r = Math.round(16 + gradT * 40);
      let g = Math.round(12 + gradT * 20);
      let b = Math.round(42 + gradT * 60);
      let a = 255;

      // Draw rounded squircle / rounded card in the center
      const cardHalf = size * (isMaskable ? 0.38 : 0.44);
      const cardRadius = cardHalf * 0.28;
      const distFromCardEdgeX = Math.max(0, Math.abs(dx) - (cardHalf - cardRadius));
      const distFromCardEdgeY = Math.max(0, Math.abs(dy) - (cardHalf - cardRadius));
      const distFromCorner = Math.sqrt(distFromCardEdgeX * distFromCardEdgeX + distFromCardEdgeY * distFromCardEdgeY);

      if (distFromCorner < cardRadius) {
        // Inside main calculator badge: violet linear gradient (#7c3aed to #4f46e5)
        const badgeGrad = (y - (center - cardHalf)) / (cardHalf * 2);
        r = Math.round(124 - badgeGrad * 30);
        g = Math.round(58 + badgeGrad * 10);
        b = Math.round(237 - badgeGrad * 20);

        // Border glow
        if (distFromCorner > cardRadius - (size * 0.02)) {
          r = Math.min(255, r + 60);
          g = Math.min(255, g + 60);
          b = 255;
        }

        // Calculator display rectangle at top of card
        const dispTop = center - cardHalf * 0.72;
        const dispBottom = center - cardHalf * 0.28;
        const dispLeft = center - cardHalf * 0.75;
        const dispRight = center + cardHalf * 0.75;

        if (y >= dispTop && y <= dispBottom && x >= dispLeft && x <= dispRight) {
          // Dark screen display with green/white digits
          r = 15; g = 12; b = 35;
          // Inner border for display
          if (y === Math.round(dispTop) || y === Math.round(dispBottom) || x === Math.round(dispLeft) || x === Math.round(dispRight)) {
            r = 167; g = 139; b = 250;
          }
          // Stylized text/digits in screen
          if (y >= dispTop + (dispBottom - dispTop)*0.35 && y <= dispBottom - (dispBottom - dispTop)*0.35) {
            if (x >= dispRight - cardHalf * 0.55 && x <= dispRight - cardHalf * 0.15) {
              r = 255; g = 255; b = 255;
            }
          }
        }

        // Keypad grid (2x2 or 3x3 buttons)
        const gridTop = center - cardHalf * 0.12;
        const gridBottom = center + cardHalf * 0.75;
        const gridLeft = center - cardHalf * 0.75;
        const gridRight = center + cardHalf * 0.75;

        if (y >= gridTop && y <= gridBottom && x >= gridLeft && x <= gridRight) {
          const colW = (gridRight - gridLeft) / 3;
          const rowH = (gridBottom - gridTop) / 3;
          const col = Math.floor((x - gridLeft) / colW);
          const row = Math.floor((y - gridTop) / rowH);
          const inBtnX = (x - gridLeft) - col * colW;
          const inBtnY = (y - gridTop) - row * rowH;
          const btnMargin = colW * 0.18;

          if (inBtnX > btnMargin && inBtnX < colW - btnMargin && inBtnY > btnMargin && inBtnY < rowH - btnMargin) {
            // Button color: accent for bottom right, subtle for others
            if (row === 2 && col === 2) {
              // Accent '=' button
              r = 245; g = 158; b = 11; // Gold accent
            } else if (col === 2 || row === 0) {
              r = 167; g = 139; b = 250;
            } else {
              r = 255; g = 255; b = 255;
            }
          }
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png);
}

// Generate files
const sizes = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const s of sizes) {
  const buf = generateAppIcon(s.size, s.maskable);
  fs.writeFileSync(path.join(iconsDir, s.file), buf);
  console.log(`Generated ${s.file} (${s.size}x${s.size})`);
}

// Also generate SVG version
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f0c23"/>
      <stop offset="100%" stop-color="#19133b"/>
    </linearGradient>
    <linearGradient id="eq" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#bg)"/>
  <rect x="40" y="40" width="432" height="432" rx="90" fill="none" stroke="#a78bfa" stroke-width="6" opacity="0.4"/>
  <!-- Display Screen -->
  <rect x="80" y="80" width="352" height="96" rx="20" fill="url(#screen)" stroke="#a78bfa" stroke-width="3"/>
  <text x="404" y="148" font-family="system-ui, sans-serif" font-size="52" font-weight="600" fill="#ffffff" text-anchor="end">0.00</text>
  <!-- Keypad Buttons -->
  <g fill="#a78bfa" opacity="0.9">
    <rect x="80" y="200" width="96" height="70" rx="18"/>
    <rect x="208" y="200" width="96" height="70" rx="18"/>
    <rect x="336" y="200" width="96" height="70" rx="18" fill="#c4b5fd"/>
    <rect x="80" y="290" width="96" height="70" rx="18" fill="#ffffff"/>
    <rect x="208" y="290" width="96" height="70" rx="18" fill="#ffffff"/>
    <rect x="336" y="290" width="96" height="70" rx="18" fill="#c4b5fd"/>
    <rect x="80" y="380" width="96" height="70" rx="18" fill="#ffffff"/>
    <rect x="208" y="380" width="96" height="70" rx="18" fill="#ffffff"/>
    <rect x="336" y="380" width="96" height="70" rx="18" fill="url(#eq)"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('Generated icon.svg');
