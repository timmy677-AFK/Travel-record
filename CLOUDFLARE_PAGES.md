# Cloudflare Pages Deployment

Use these settings in Cloudflare Pages:

```text
Framework preset: Vue or Vite
Root directory: outputs/travel-photo-journal
Build command: npm run build
Build output directory: dist
Node version: 22.16.0
```

Notes:

- `.node-version` pins the Pages build image to Node.js 22.16.0.
- `public/_redirects` is copied by Vite into `dist/_redirects` and keeps SPA reloads working.
- `public/_headers` is copied into `dist/_headers` for basic security headers and immutable asset caching.
- No backend, database, or external API is required at runtime. IndexedDB data remains local to the visitor's browser.
