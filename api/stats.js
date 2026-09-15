import { fetchStats } from "./_github.js";
import { cardWrapper, escapeXml, FONT_STACK, THEME } from "./_theme.js";

const ROWS = [
  { key: "totalStars", label: "Total Stars", icon: "★" },
  { key: "totalCommits", label: "Commits (this yr)", icon: "⌥" },
  { key: "totalPRs", label: "Pull Requests", icon: "⇄" },
  { key: "totalIssues", label: "Issues", icon: "◉" },
  { key: "publicRepos", label: "Repositories", icon: "▤" },
  { key: "followers", label: "Followers", icon: "♥" },
];

function statsBody(stats) {
  const startY = 82;
  const rowH = 34;
  const rows = ROWS.map((row, i) => {
    const y = startY + i * rowH;
    const value = stats[row.key].toLocaleString();
    return `
    <text x="30" y="${y}" font-family="${FONT_STACK}" font-size="15" fill="${THEME.accent3}">${row.icon}</text>
    <text x="52" y="${y}" font-family="${FONT_STACK}" font-size="14" fill="${THEME.subtext}">${escapeXml(
      row.label
    )}</text>
    <text x="330" y="${y}" font-family="${FONT_STACK}" font-size="15" font-weight="700" fill="${THEME.text}" text-anchor="end">${escapeXml(
      value
    )}</text>`;
  }).join("\n");
  return rows;
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
    const stats = await fetchStats(login);
    const height = 82 + ROWS.length * 34 + 20;
    const svg = cardWrapper({
      width: 380,
      height,
      title: "GitHub Stats",
      body: statsBody(stats),
    });
    res.status(200).send(svg);
  } catch (err) {
    const svg = cardWrapper({
      width: 380,
      height: 120,
      title: "GitHub Stats",
      body: `<text x="30" y="85" font-family="${FONT_STACK}" font-size="13" fill="${THEME.subtext}">${escapeXml(
        err.message
      )}</text>`,
    });
    res.status(200).send(svg);
  }
}
