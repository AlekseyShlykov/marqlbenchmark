# marql Retail AI benchmark landing

English, responsive static landing. No build or runtime dependencies.

Run `python3 -m http.server 4186`, then open http://localhost:4186.

## Content and data

- Source: https://retail-bench.marql.one/#/ (home, leaderboard, methodology, submit).
- `assets/benchmark-data.json` contains the Oracle reference row and the four v3 model rows from the public report of 19 September 2026, fetched on 23 September 2026. The four AI models use the MARQL system and weekly reviews, with five evaluation seeds per world. Oracle is a future-aware reference policy evaluated on 20 seeds per world; it is not a deployable AI model. Each normalized endpoint uses the formula profit on that contender’s own evaluation seeds.
- Displayed $100k endpoints are `100000 × model economic profit / (model economic profit − paired delta versus formula)`. This is a relative comparison, **not ROI or an observed $100k portfolio**.
- Animated trajectories are illustrative interpolation. The page labels this explicitly. Actual profit and paired differences are shown separately.
- Original simulation: `assets/marql simulation.mov`. The landing loads the optimized 10-second, 7 fps, 1000 px, 64-color GIF. Reduced-motion users receive a static poster. Original MOV is retained but never requested by the page.
- Submission links to the real benchmark intake page; no unsupported local upload flow is implied.

Deploy the folder to any static host. Only HTML, CSS, JS, favicon, GIF, poster and benchmark JSON need publishing; exclude the source MOV.
