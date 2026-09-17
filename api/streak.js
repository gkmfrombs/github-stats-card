import { fetchStreak } from "./_github.js";
import { cardWrapper, escapeXml, FONT_STACK, THEME } from "./_theme.js";

const WIDTH = 500;
const HEIGHT = 190;

function column(x, value, label, opts = {}) {
  const centerX = x;
  const valueColor = opts.highlight ? THEME.title : THEME.text;
  const ring = opts.highlight
    ? `<circle cx="${centerX}" cy="95" r="42" fill="none" stroke="url(#borderGrad)" stroke-width="2.5"/>`
    : "";
  const fire = opts.highlight ? `<text x="${centerX}" y="72" font-size="18" text-anchor="middle">🔥</text>` : "";
  return `
    ${ring}
    ${fire}
    <text x="${centerX}" y="${opts.highlight ? 108 : 100}" font-family="${FONT_STACK}" font-size="30" font-weight="700" fill="${valueColor}" text-anchor="middle">${escapeXml(
      String(value)
    )}</text>
    <text x="${centerX}" y="150" font-family="${FONT_STACK}" font-size="12" fill="${THEME.subtext}" text-anchor="middle">${escapeXml(
      label
    )}</text>`;
}

function streakBody(streak) {
  const divider1 = `<line x1="${WIDTH / 3}" y1="65" x2="${WIDTH / 3}" y2="150" stroke="${THEME.track}" stroke-width="1"/>`;
  const divider2 = `<line x1="${(WIDTH / 3) * 2}" y1="65" x2="${(WIDTH / 3) * 2}" y2="150" stroke="${THEME.track}" stroke-width="1"/>`;

  return `
  ${column(WIDTH / 6, streak.totalContributions.toLocaleString(), "Total Contributions (1yr)")}
  ${divider1}
  ${column(WIDTH / 2, streak.currentStreak, "Current Streak", { highlight: true })}
  ${divider2}
  ${column((WIDTH / 6) * 5, streak.longestStreak, "Longest Streak (1yr)")}`;
}

export default async function handler(req, res) {
  const login = req.query.username;
  if (!login) {
    res.status(400).send("Missing ?username=");
    return;
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Cache-Control",
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
  );

  try {
    const streak = await fetchStreak(login);
    const svg = cardWrapper({
      width: WIDTH,
      height: HEIGHT,
      title: "Contribution Streak",
      body: streakBody(streak),
    });
    res.status(200).send(svg);
  } catch (err) {
    const svg = cardWrapper({
      width: WIDTH,
      height: 120,
      title: "Contribution Streak",
      body: `<text x="30" y="85" font-family="${FONT_STACK}" font-size="13" fill="${THEME.subtext}">${escapeXml(
        err.message
      )}</text>`,
    });
    res.status(200).send(svg);
  }
}
