import { THEME, escapeXml } from "./_theme.js";
import { CINZEL_DECORATIVE_700, CINZEL_600 } from "./_fonts.js";

const WIDTH = 700;
const HEIGHT = 170;

const ROLES = [
  "Aspiring Data Scientist",
  "AI & ML Enthusiast",
  "Full Stack Developer",
  "Gen AI Project Builder",
];

// Rough average glyph-width ratio for a serif display face — only needs to
// be >= the real rendered width so the clip-path reveal fully uncovers the
// text by the end of the animation; a little slack is harmless.
function estimateWidth(text, fontSize, ratio = 0.8) {
  return Math.ceil(text.length * fontSize * ratio);
}

function fontFaceStyle() {
  return `
    @font-face {
      font-family: 'Cinzel Decorative';
      font-weight: 700;
      font-style: normal;
      src: url("data:font/woff2;base64,${CINZEL_DECORATIVE_700}") format('woff2');
    }
    @font-face {
      font-family: 'Cinzel';
      font-weight: 600;
      font-style: normal;
      src: url("data:font/woff2;base64,${CINZEL_600}") format('woff2');
    }`;
}

function nameBlock(name) {
  const fontSize = 44;
  const y = 78;
  const padding = 24;
  const revealWidth = estimateWidth(name, fontSize) + padding * 2;
  const startX = WIDTH / 2 - revealWidth / 2;
  const endX = WIDTH / 2 + revealWidth / 2;

  return `
    <clipPath id="nameReveal">
      <rect id="nameRevealRect" x="${startX}" y="${y - fontSize}" width="0" height="${fontSize + 20}"/>
    </clipPath>
    <g clip-path="url(#nameReveal)">
      <text x="${WIDTH / 2}" y="${y}" text-anchor="middle" font-family="'Cinzel Decorative', serif" font-size="${fontSize}" font-weight="700" fill="${THEME.title}">${escapeXml(
        name
      )}</text>
    </g>
    <rect id="nameCursor" y="${y - fontSize + 6}" width="3" height="${fontSize - 4}" fill="${THEME.accent3}"/>
    <style>
      #nameRevealRect { animation: typeName 6s ease-in-out infinite; }
      #nameCursor { animation: moveCursor 6s ease-in-out infinite, blink 0.8s steps(1) infinite; }
      @keyframes typeName {
        0%   { width: 0; }
        35%  { width: ${revealWidth}px; }
        70%  { width: ${revealWidth}px; }
        85%  { width: 0; }
        100% { width: 0; }
      }
      @keyframes moveCursor {
        0%   { x: ${startX}px; }
        35%  { x: ${endX}px; }
        70%  { x: ${endX}px; }
        85%  { x: ${startX}px; }
        100% { x: ${startX}px; }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    </style>`;
}

function roleBlock() {
  const fontSize = 20;
  const y = 122;
  const cycle = ROLES.length * 2; // seconds per role slot
  const total = ROLES.length * cycle;

  const texts = ROLES.map((role, i) => {
    const delay = i * cycle;
    return `
      <text x="${WIDTH / 2}" y="${y}" text-anchor="middle" font-family="'Cinzel', serif" font-size="${fontSize}" font-weight="600" fill="${THEME.accent2}" class="role" style="animation-delay: -${total - delay}s;">${escapeXml(
        role
      )}</text>`;
  }).join("\n");

  return `
    ${texts}
    <style>
      .role {
        opacity: 0;
        animation-name: roleFade;
        animation-duration: ${total}s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
      @keyframes roleFade {
        0%   { opacity: 0; }
        3%   { opacity: 1; }
        ${Math.round((cycle / total) * 100 - 3)}% { opacity: 1; }
        ${Math.round((cycle / total) * 100)}%   { opacity: 0; }
        100% { opacity: 0; }
      }
    </style>`;
}

function bannerSvg(name) {
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(
    name
  )}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${THEME.bg1}"/>
      <stop offset="100%" stop-color="${THEME.bg2}"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${THEME.accent1}"/>
      <stop offset="50%" stop-color="${THEME.accent2}"/>
      <stop offset="100%" stop-color="${THEME.accent3}"/>
    </linearGradient>
    <style>${fontFaceStyle()}</style>
  </defs>
  <rect x="1" y="1" width="${WIDTH - 2}" height="${HEIGHT - 2}" rx="16" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="1.6"/>
  ${nameBlock(name)}
  ${roleBlock()}
</svg>`;
}

export default async function handler(req, res) {
  const name = req.query.name || "Guddu Kumar Mishra";

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Cache-Control",
    "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"
  );
  res.status(200).send(bannerSvg(name));
}
