# github-stats-card

Self-hosted, custom-styled GitHub stats cards for a profile README — built from
scratch (no forked repo), themed to match a purple → teal → gold palette.

## Endpoints

- `GET /api/stats?username=<login>` — stars, commits, PRs, issues, repos, followers
- `GET /api/toplangs?username=<login>` — top languages by byte size, as bars
- `GET /api/activity?username=<login>` — last-year contribution activity as a gradient area chart

Both return `image/svg+xml` and are cached for 1 hour (`s-maxage=3600`).

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
```

## Local dev

```bash
npm i -g vercel
vercel dev
```

## Customizing the look

All colors and the font stack live in [`api/_theme.js`](api/_theme.js) —
edit `THEME` and `FONT_STACK` to restyle every card at once.
