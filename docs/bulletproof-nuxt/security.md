# 🔐 Security

## Authentication

NOTE: Since Nuxt is a full-stack framework, authentication should be implemented on both the client and server sides. Server-side protection is essential for securing API routes and resources, while client-side authentication enhances user experience by managing UI state and navigation.

Protecting resources comprises two key components:

### Session-Based Authentication

This application uses cookie-based session authentication with [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils). When a user logs in or registers, a session is created and stored in a secure HttpOnly cookie. This approach is more secure than storing tokens in localStorage, as HttpOnly cookies are inaccessible to client-side JavaScript, reducing the risk of Cross-Site Scripting ([XSS](https://owasp.org/www-community/attacks/xss/)) attacks.

[Login API Example Code](../../apps/bulletproof-nuxt/layers/auth/server/api/auth/login.post.ts)

Login and registration replace the session with the stable user ID after
successful password authentication. Protected API routes validate the session user ID
and load the current user record from the database before applying
feature-specific authorization. Profile updates do not rewrite the user ID
stored in the cookie, but the client refreshes the session response before
reporting completion.

[Protected API Example Code](../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.get.ts)

See the [Nuxt Auth Utils Practices](../practices/nuxt-auth-utils/index.md) for
reusable password, session, protected-request, refresh, and logout guidance.

### Handling User Data

Authentication and current user data are available through `useUserSession`.
The sealed cookie stores only the user ID. The session response loads the user
record from the database and includes only public user fields. Protected server
routes load the current user record from the database and never trust role or
team claims from the cookie.

[Auth Middleware Example Code](../../apps/bulletproof-nuxt/layers/auth/app/middleware/auth.ts)

### XSS Prevention

In addition to securely storing sessions, it's crucial to protect the application from Cross-Site Scripting (XSS) attacks. Sanitize all user inputs before displaying them, especially when rendering user-generated HTML content. Use libraries like DOMPurify to sanitize HTML output.

[HTML Sanitization Example Code](../../apps/bulletproof-nuxt/layers/base/app/plugins/dompurify.ts)

For a full list of security risks, check [OWASP](https://owasp.org/www-project-top-10/).

## Authorization

Authorization is the process of verifying whether a user has permission to access a specific resource within the application.

### RBAC (Role-Based Access Control)

In a role-based authorization model, access to resources is determined by defining specific roles and associating them with permissions. For example, roles such as `USER` and `ADMIN` can be assigned different levels of access rights within the application. Users are then granted access based on their roles; for instance, restricting certain functionalities to regular users while permitting administrators to access all features.

[Authorization Component Example Code](../../apps/bulletproof-nuxt/layers/auth/app/components/Authorization.vue)

### PBAC (Permission-Based Access Control)

While Role-Based Access Control (RBAC) provides a structured methodology for authorization, there are instances where a more granular approach is necessary. Permission-Based Access Control (PBAC) offers a more flexible solution, particularly in scenarios where access permissions need to be finely tuned based on specific criteria, such as allowing only the owner of a resource to perform certain operations. For example, in the case of a user's comment, PBAC ensures that only the author of the comment has the privilege to delete it.

For RBAC protection, you can use the `Authorization` component by passing allowed roles to it. On the other hand, if you need more strict protection, you can pass a policy check to it.

[PBAC Example Code](../../apps/bulletproof-nuxt/layers/comments/app/components/CommentsList.vue)
