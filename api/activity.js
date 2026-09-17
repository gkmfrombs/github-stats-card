import { fetchActivity } from "./_github.js";
import { cardWrapper, escapeXml, FONT_STACK, THEME } from "./_theme.js";

const WIDTH = 760;
const HEIGHT = 200;
const PAD_LEFT = 30;
const PAD_RIGHT = 30;
const CHART_TOP = 70;
const CHART_BOTTOM = 155;

function monthLabels(weeks) {
  const labels = [];
  let lastMonth = null;
  weeks.forEach((week, i) => {
    if (!week.weekStart) return;
    const month = new Date(week.weekStart).getUTCMonth();
    if (month !== lastMonth) {
      labels.push({ index: i, month });
      lastMonth = month;
    }
  });
  return labels;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function activityBody(activity) {
  const weeks = activity.weeks;
  const max = Math.max(1, ...weeks.map((w) => w.total));
  const chartW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartH = CHART_BOTTOM - CHART_TOP;
  const stepX = chartW / Math.max(1, weeks.length - 1);

  const points = weeks.map((w, i) => {
    const x = PAD_LEFT + i * stepX;
    const y = CHART_BOTTOM - (w.total / max) * chartH;
    return [x, y];
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    `M ${points[0][0].toFixed(1)} ${CHART_BOTTOM} ` +
    points.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") +
    ` L ${points[points.length - 1][0].toFixed(1)} ${CHART_BOTTOM} Z`;

  const labels = monthLabels(weeks)
    .filter((_, i) => i % 1 === 0)
    .map((l) => {
      const x = PAD_LEFT + l.index * stepX;
      return `<text x="${x.toFixed(1)}" y="${CHART_BOTTOM + 20}" font-family="${FONT_STACK}" font-size="11" fill="${THEME.subtext}">${MONTH_NAMES[l.month]}</text>`;
    })
    .join("\n");

  const baseline = `<line x1="${PAD_LEFT}" y1="${CHART_BOTTOM}" x2="${WIDTH - PAD_RIGHT}" y2="${CHART_BOTTOM}" stroke="${THEME.track}" stroke-width="1"/>`;

  const totalLabel = `<text x="${WIDTH - PAD_RIGHT}" y="60" font-family="${FONT_STACK}" font-size="13" fill="${THEME.subtext}" text-anchor="end">${activity.totalContributions.toLocaleString()} contributions in the last year</text>`;

  return `
  <defs>
    <linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${THEME.accent2}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${THEME.accent2}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${totalLabel}
  ${baseline}
  <path d="${areaPath}" fill="url(#areaFill)"/>
  <path d="${linePath}" fill="none" stroke="url(#barGrad)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  ${labels}`;
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
    const activity = await fetchActivity(login);
    const svg = cardWrapper({
      width: WIDTH,
      height: HEIGHT,
      title: "Contribution Activity",
      body: activityBody(activity),
    });
    res.status(200).send(svg);
  } catch (err) {
    const svg = cardWrapper({
      width: WIDTH,
      height: 120,
      title: "Contribution Activity",
      body: `<text x="30" y="85" font-family="${FONT_STACK}" font-size="13" fill="${THEME.subtext}">${escapeXml(
        err.message
      )}</text>`,
    });
    res.status(200).send(svg);
  }
}
