/* eslint-disable */
/**
 * Regenerates the per-preset share images (public/og/<id>.png, 1200x630)
 * from design/og/<id>.svg using headless Chrome.
 *
 *   node scripts/make-og.js     (set CHROME=/path/to/chrome if it is not on macOS)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME =
  process.env.CHROME ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const landing = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'features', 'landing.json'), 'utf8'),
);

const TEXT = {
  pomodoro: ['Pomodoro Timer', '25 min work / 5 min rest × 4'],
  tabata: ['Tabata Timer', '20s work / 10s rest × 8'],
  hiit: ['HIIT Timer', '40s work / 20s rest × 10 × 2 sets'],
  emom: ['EMOM Timer', '45s work / 15s rest × 10 rounds'],
};

const svg = (emoji, title, sub) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff1744"/>
      <stop offset="1" stop-color="#ff8a50"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1080" cy="80" r="260" fill="#ffffff22"/>
  <text x="110" y="330" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="260">${emoji}</text>
  <text x="520" y="290" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="94" font-weight="800" fill="#fff">${title}</text>
  <text x="522" y="370" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="36" fill="#fff">${sub}</text>
  <text x="522" y="430" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="32" fill="#ffffffcc">Free, no sign-up. Run several timers at once.</text>
  <text x="522" y="560" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="30" fill="#ffffffcc">Loopy Timer · timer.eastazy.com</text>
</svg>
`;

fs.mkdirSync(path.join(ROOT, 'design', 'og'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public', 'og'), { recursive: true });
landing.forEach((p) => {
  const [title, sub] = TEXT[p.id];
  const file = path.join(ROOT, 'design', 'og', `${p.id}.svg`);
  fs.writeFileSync(file, svg(p.emoji, title, sub));
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1200,630',
    `--screenshot=${path.join(ROOT, 'public', 'og', `${p.id}.png`)}`,
    `file://${file}`,
  ], { stdio: 'ignore' });
  console.log('og:', p.id);
});
