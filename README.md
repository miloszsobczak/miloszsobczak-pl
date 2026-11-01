# miloszsobczak.pl

Personal website, built with [Hugo](https://gohugo.io/) and deployed to GitHub Pages by GitHub Actions
(`.github/workflows/hugo.yml`) on every push to `master`.

- `content/` — pages; blog posts live in `content/blog/` (`hugo new blog/<slug>.md`)
- `data/resume.yaml` — everything on the resume page
- `layouts/` — templates (`baseof.html`, `home.html`, `resume.html`, …) and `_partials/`
- `assets/css/site.css`, `assets/js/site.js` — minified and fingerprinted by Hugo Pipes;
  JS is progressive enhancement only, the site works without it
- `static/` — copied as-is (favicon, CNAME)

Local preview: `npm start` (or `hugo server`) → http://localhost:4321
