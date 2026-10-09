# AGENTS.md

## What this project is

A single-page static marketing site for **APPIE** (random video chat landing page).
No build step, no package manager, no backend: `index.html` + `styles.css` + `main.js` +
logo images, served as static files.

- `main.js` sets the WhatsApp channel CTA links, the footer year, and draws the
  animated cloud canvas in the hero. All dynamic content is generated client-side
  from data arrays in that file.
- The only external requests are Google Fonts (`fonts.googleapis.com`) and the
  outbound WhatsApp channel link. **No API keys or credentials are required.**

## Running it in the sandbox

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

The service is a stock `nginx:alpine` serving the repo root bind-mounted at
`/usr/share/nginx/html` on host port **3000**.

### Quirks worth remembering

- The sandbox mounts the repo root as `0700 root:root`, so nginx's default
  `nginx` worker user cannot traverse it and every request returns 403/404.
  `nginx.base44.main.conf` therefore sets `user root;` and is mounted over
  `/etc/nginx/nginx.conf`. Do not replace it with a plain `nginx -g "user root"` —
  the stock main config already declares `user nginx;` and nginx refuses to start
  on the duplicate directive.
- `nginx.base44.conf` (`/etc/nginx/conf.d/default.conf`) sends `Cache-Control: no-store`
  so edits always show up, and denies dotfile paths so `.git` is never served.
- There is no hot-reload dev server here: after editing `index.html`/`styles.css`/`main.js`,
  just refresh the preview (the container serves the mounted files directly — no rebuild
  or restart needed).

## Verifying it works

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/    # 200
curl -s http://localhost:3000/ | grep '<title>'                    # APPIE — Random Video Chat...
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/main.js  # 200
```

Then check the page renders: the hero cloud canvas animates and the WhatsApp CTAs
carry the channel URL (set by `main.js`, the anchor `href` starts as `#`).
