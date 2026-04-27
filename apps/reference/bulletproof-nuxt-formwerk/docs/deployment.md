# 🌐 Deployment

Nuxt applications can be deployed to various platforms. Since Nuxt is a full-stack framework with server-side capabilities, you'll need a platform that supports server-side rendering or serverless functions.

## This Project: Cloudflare Pages + D1

This application is configured for deployment to [Cloudflare Pages](https://pages.cloudflare.com/) with [Cloudflare D1](https://developers.cloudflare.com/d1/) as the database.

### Why Cloudflare?

- **Edge Computing**: Server code runs close to users globally
- **D1 Database**: SQLite-compatible database with automatic replication
- **Zero Cold Starts**: Fast serverless function execution
- **Generous Free Tier**: Suitable for most projects

### Deployment Steps

1. Create a D1 database in Cloudflare Dashboard
2. Update `wrangler.toml` with your database ID
3. Connect your repository to Cloudflare Pages
4. Set environment variables (`NUXT_SESSION_PASSWORD`)
5. Deploy with build command: `pnpm db:migrate:d1 && NITRO_PRESET=cloudflare-pages pnpm build`

[Cloudflare Pages Configuration](../wrangler.toml)

[Nuxt Cloudflare Deployment Guide](https://nuxt.com/deploy/cloudflare)

## Alternative Deployment Platforms

While this project is optimized for Cloudflare, Nuxt can be deployed to many platforms:

- [Vercel](https://vercel.com/) - Great DX with automatic deployments
- [Netlify](https://netlify.com/) - Easy setup with edge functions
- [AWS Lambda](https://aws.amazon.com/lambda/) - Scalable serverless option
- [Node.js Server](https://nodejs.org/) - Traditional server deployment

Each platform requires a different Nitro preset. See [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for platform-specific guides.
