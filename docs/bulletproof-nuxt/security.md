# 🔐 Security

## Auth

Client-side navigation and UI checks do not protect server resources. API routes enforce authentication and authorization independently.

### Authentication

The app uses Nuxt Auth Utils for cookie-based sessions. Login belongs to the auth layer; registration and session projection belong to the root app.

The sealed cookie stores the user ID. Protected APIs load the current user from the database rather than trusting role or team claims from the cookie.

See the [Nuxt Auth Utils Practices](../practices/nuxt-auth-utils/index.md) for password, session, refresh, and logout guidance.

#### Handling user data

`useUserSession` exposes public session data to the app. Server-side session projection selects public user fields; credentials remain server-only.

#### XSS Prevention

Sanitize user-generated HTML before rendering it. The app's [DOMPurify integration](../../apps/bulletproof-nuxt/app/plugins/dompurify.ts) handles rendered HTML; HttpOnly cookies alone do not prevent XSS.

See [OWASP](https://owasp.org/www-project-top-10/) for broader security risks.

### Authorization

The root app owns shared authorization rules. UI checks control presentation; server checks enforce access.

#### RBAC (Role-Based Access Control)

Roles such as `ADMIN` and `USER` determine available operations. The [Authorization component](../../apps/bulletproof-nuxt/app/components/Authorization.vue) applies presentation checks.

#### PBAC (Permission-Based Access Control)

Policies add resource-specific checks, such as comment ownership and team membership. Server routes apply the relevant rules before reading or changing protected resources.
