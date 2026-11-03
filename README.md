# TekNeek Services — Astro Website

Custom Astro website for TekNeek Services LLC. This repository contains the work-in-progress website, with the Pages CMS configuration for visual editing.

## Local development

Requires Node.js 22.

```sh
npm install
npm run dev
npm run build
```

## Cloudflare Pages

Framework: Astro · Build command: `npm run build` · Output directory: `dist`.

## Visual editing

Visit https://pagescms.org, authorize this private repository, and use the Homepage and Creative Catalogs collections configured in `.pages.yml`. CMS changes commit to GitHub and redeploy after Cloudflare is connected.

## Before launch

Upload the approved TekNeek logo and photos into `public/assets/` using the filenames specified by `ASSETS.md`. Verify all third-party catalog URLs and public Popl contact URL. The live Google Sites website remains unchanged until DNS is deliberately switched.
