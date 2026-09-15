import { fetchTopLanguages } from "./_github.js";
import { cardWrapper, escapeXml, FONT_STACK, THEME } from "./_theme.js";

function langsBody(langs) {
  const startY = 80;
  const rowH = 38;
  const barW = 300;
  const barX = 30;

  const rows = langs.map((lang, i) => {
    const y = startY + i * rowH;
    const fillW = Math.max(4, (lang.percent / 100) * barW);
    return `
    <text x="${barX}" y="${y}" font-family="${FONT_STACK}" font-size="13" fill="${THEME.text}">${escapeXml(
      lang.name
    )}</text>
    <text x="${barX + barW}" y="${y}" font-family="${FONT_STACK}" font-size="13" fill="${THEME.subtext}" text-anchor="end">${lang.percent.toFixed(
      1
    )}%</text>
    <rect x="${barX}" y="${y + 8}" width="${barW}" height="8" rx="4" fill="${THEME.track}"/>
    <rect x="${barX}" y="${y + 8}" width="${fillW}" height="8" rx="4" fill="${lang.color}"/>`;
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
    const langs = await fetchTopLanguages(login, 6);
    const height = 80 + langs.length * 38 + 10;
    const svg = cardWrapper({
      width: 380,
      height,
      title: "Most Used Languages",
      body: langsBody(langs),
    });
    res.status(200).send(svg);
  } catch (err) {
    const svg = cardWrapper({
      width: 380,
      height: 120,
      title: "Most Used Languages",
      body: `<text x="30" y="85" font-family="${FONT_STACK}" font-size="13" fill="${THEME.subtext}">${escapeXml(
        err.message
      )}</text>`,
    });
    res.status(200).send(svg);
  }
}
