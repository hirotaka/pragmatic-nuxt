# 🌐 Deployment

Nuxt applications can be deployed to various platforms. Since Nuxt is a full-stack framework with server-side capabilities, you'll need a platform that supports server-side rendering or serverless functions.

## Cloudflare Workers and D1

The app builds for Cloudflare Workers with `NITRO_PRESET=cloudflare_module`.
Production and Preview builds select different D1 resources in `nuxt.config.ts`.
The release scripts apply remote D1 migrations before publishing the Worker:

```bash
pnpm build
pnpm deploy:cloudflare
```

Preview builds use the Preview environment and upload a version:

```bash
pnpm build:preview
pnpm deploy:cloudflare:preview
```

Migration failure prevents the corresponding release command from publishing.
Keep resource selection, migration application, and Worker publication as
separate operational steps. PostgreSQL is an optional dialect path and is not
the default Cloudflare deployment target.

The Canonical D1 resources are a fresh-resource cutover. The application does
not migrate data from the previous D1 resources, and the previous resources are
not targets for reset, seed, or migration commands in this publication. Initial
migration of the new Production and Preview resources must succeed before their
corresponding release is considered ready. Existing-data continuity, backup,
restore, and rollback evidence require a separately approved operational scope.

This publication keeps `main-worker` as the Cloudflare Production branch.
Creating a review PR does not activate Production or change that selector.

See the [Nuxt Cloudflare Deployment Guide](https://nuxt.com/deploy/cloudflare)
and [Cloudflare D1 documentation](https://developers.cloudflare.com/d1/) for
general platform information.

See the [NuxtHub DB Practices](../../../docs/practices/nuxt-hub-db/index.md) for
verified scope and limitations around D1, Workers, and PostgreSQL deployment.

## Alternative Deployment Platforms

Nuxt can be deployed to many platforms:

- [Vercel](https://vercel.com/) - Great DX with automatic deployments
- [Netlify](https://netlify.com/) - Easy setup with edge functions
- [AWS Lambda](https://aws.amazon.com/lambda/) - Scalable serverless option
- [Node.js Server](https://nodejs.org/) - Traditional server deployment

Each platform requires a different Nitro preset. See [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for platform-specific guides.
