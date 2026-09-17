# github-stats-card

Self-hosted, custom-styled GitHub stats cards for a profile README — built from
scratch (no forked repo), themed to match a purple → teal → gold palette.

## Endpoints

- `GET /api/stats?username=<login>` — stars, commits, PRs, issues, repos, followers
- `GET /api/toplangs?username=<login>` — top languages by byte size, as bars
- `GET /api/activity?username=<login>` — last-year contribution activity as a gradient area chart
- `GET /api/streak?username=<login>` — total contributions, current streak, and longest streak (computed over the last 365 days of the GraphQL contribution calendar)
- `GET /api/banner?name=<display name>` — animated name/role banner with a typewriter reveal, no external font CDN (the Cinzel/Cinzel Decorative fonts are embedded as base64 in [`api/_fonts.js`](api/_fonts.js))

All endpoints return `image/svg+xml`. The data-driven ones are cached for 1 hour (`s-maxage=3600`); the banner is cached for 1 day since it doesn't depend on live data.

## Deploy

1. Import this repo at [vercel.com/new](https://vercel.com/new)
2. Add an environment variable `GH_TOKEN` — a GitHub Personal Access Token
   ([create one](https://github.com/settings/tokens/new)) with `public_repo`
   scope (or `repo` for private repos too)
3. Deploy

## Use in a README

```md
![Stats](https://<your-project>.vercel.app/api/stats?username=gkmfrombs)
![Top Langs](https://<your-project>.vercel.app/api/toplangs?username=gkmfrombs)
![Activity](https://<your-project>.vercel.app/api/activity?username=gkmfrombs)
![Streak](https://<your-project>.vercel.app/api/streak?username=gkmfrombs)
![Banner](https://<your-project>.vercel.app/api/banner?name=Guddu+Kumar+Mishra)
```

## Local dev

```bash
npm i -g vercel
vercel dev
```

## Customizing the look

All colors and the font stack live in [`api/_theme.js`](api/_theme.js) —
edit `THEME` and `FONT_STACK` to restyle every card at once.

The rotating role phrases on the banner are a hardcoded `ROLES` array at the
top of [`api/banner.js`](api/banner.js) — edit that list directly.
