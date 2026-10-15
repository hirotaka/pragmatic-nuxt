# 🌐 Deployment

The app targets Cloudflare Workers with D1. Production and Preview use separate resources.

Apply the matching database migrations before release. Resource selection, migration application, and Worker release are separate responsibilities; a migration failure means the release is not ready.

Successful initial migrations do not establish continuity of existing data. Backup, restore, rollback, and recovery require separate operational procedures.

See [Deploy Nuxt Applications with Cloudflare Workers Builds](../practices/nuxt-hub-db/cloudflare-workers-deployment.md) for the deployment lifecycle and its evidence limits. Other targets require their own configuration and verification; see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).
