// Shared visual theme for all cards — keep this in sync with the README's
// purple -> teal -> gold gradient so every embed feels like one system.
export const THEME = {
  bg1: "#1a1b3a",
  bg2: "#0f1024",
  border: "#6C63FF",
  title: "#FFD700",
  text: "#E8E9F3",
  subtext: "#9a9cc7",
  accent1: "#6C63FF",
  accent2: "#00b4d8",
  accent3: "#FFD700",
  track: "#2a2b52",
};

export const FONT_STACK =
  "'Georgia', 'Cambria', 'Palatino Linotype', 'Palatino', serif";

export function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function cardWrapper({ width, height, title, body }) {
  // Rough char-width budget so long titles shrink instead of clipping.
  const maxChars = Math.floor((width - 50) / 9);
  const titleFontSize = title.length > maxChars ? 15 : 18;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(
    title
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
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${THEME.accent1}"/>
      <stop offset="100%" stop-color="${THEME.accent2}"/>
    </linearGradient>
  </defs>

  <rect x="1" y="1" width="${width - 2}" height="${
    height - 2
  }" rx="14" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="1.6"/>

  <text x="25" y="38" font-family="${FONT_STACK}" font-size="${titleFontSize}" font-weight="700" fill="${
    THEME.title
  }" letter-spacing="0.5">${escapeXml(title)}</text>
  <line x1="25" y1="50" x2="${width - 25}" y2="50" stroke="url(#borderGrad)" stroke-width="1" opacity="0.5"/>

  ${body}
</svg>`;
}
