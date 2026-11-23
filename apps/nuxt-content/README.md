# Nuxt Content Showcase

A content-driven Nuxt application built with Nuxt Content.

## Get Started

Run from this directory:

```bash
pnpm install
pnpm dev
```

## SEO and Markdown

The showcase renders metadata for Docs and Blog pages, emits `BlogPosting` structured data for articles, and provides a sitemap and Markdown exports. Set `NUXT_SITE_URL` to the site's public origin when building and serving the app. The Markdown index at `/llms.txt` lists Docs and Blog pages; it does not control access to Markdown URLs.

Run `pnpm test:e2e` from this directory to check metadata, redirects, and how the published pages link to their Markdown exports. The tests use the local site origin in `.env.test`.

## License

[MIT license](LICENSE).
