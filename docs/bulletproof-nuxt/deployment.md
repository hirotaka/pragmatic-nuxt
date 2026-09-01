# Deployment

## Cloudflare Workers and D1

This app runs on Cloudflare Workers with D1 as its default Cloudflare
database target. Production and Preview use separate resources and have
separate release responsibilities.

Applying the corresponding database migration is a prerequisite for release
readiness. Resource selection, migration application, and Worker release remain
distinct responsibilities, and a migration failure prevents the corresponding
release from being considered ready.

Initial migration of a resource is distinct from continuity of existing data.
Backup, restore, rollback, and recovery procedures require a separately owned
operational scope.

See the [Nuxt Cloudflare Deployment Guide](https://nuxt.com/deploy/cloudflare)
and [Cloudflare D1 documentation](https://developers.cloudflare.com/d1/) for
general platform information.

See the [NuxtHub DB Practices](../practices/nuxt-hub-db/index.md) for
reusable guidance and verified scope around D1, Workers, and PostgreSQL.

## Alternative Deployment Platforms

Nuxt can be deployed to many platforms:

- [Vercel](https://vercel.com/) - Great DX with automatic deployments
- [Netlify](https://netlify.com/) - Easy setup with edge functions
- [AWS Lambda](https://aws.amazon.com/lambda/) - Scalable serverless option
- [Node.js Server](https://nodejs.org/) - Traditional server deployment

Each platform requires a different Nitro preset. See [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for platform-specific guides.
