# 🌐 Deployment

The app targets Cloudflare Workers with D1. Production and Preview use separate resources.

Set `NUXT_APP_SECRET` as a runtime secret in each environment before releasing with Nuxt Auth Utils 0.6. Generate a distinct value for each environment with `openssl rand -base64 32` and keep it stable across releases. `NUXT_SESSION_PASSWORD` is no longer used. Sessions created with 0.5 cannot be read by 0.6, so existing users must sign in again. Never use the value from `.env.test` in a deployed environment.

Apply the matching database migrations before release. Resource selection, migration application, and Worker release are separate responsibilities; a migration failure means the release is not ready.

Successful initial migrations do not establish continuity of existing data. Backup, restore, rollback, and recovery require separate operational procedures.

See [Deploy Nuxt Applications with Cloudflare Workers Builds](../practices/nuxt-hub-db/cloudflare-workers-deployment.md) for the deployment lifecycle and its evidence limits. Other targets require their own configuration and verification; see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).
