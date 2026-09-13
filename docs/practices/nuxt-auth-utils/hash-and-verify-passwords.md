---
title: Use Nuxt Auth Utils to Hash and Verify Passwords
semanticId: nuxt-auth-utils-hash-and-verify-passwords
category: authentication
status: confirmed
---

# Use Nuxt Auth Utils to Hash and Verify Passwords

## Practice

Store a password hash instead of the plain-text password for users who authenticate with a password. Use Nuxt Auth Utils `hashPassword()` to create the stored hash. Use `verifyPassword()` to compare a submitted password with that hash.

## Apply When

- A Nuxt server manages password-based authentication for users whose records are stored in a database.
- Nuxt server code creates and verifies password hashes.
- Either existing password hashes can be verified with `verifyPassword()`, or existing users do not need to remain able to authenticate.

## Do Not Apply When

- Authentication uses OAuth, WebAuthn, or another provider without storing passwords in Nuxt.
- Existing password hashes still need to work but cannot be verified with `verifyPassword()`.
- A backend outside the Nuxt server creates and verifies password hashes.

## Why

Storing a password hash lets the server check a submitted password without storing the original password. Nuxt Auth Utils `hashPassword()` creates the Scrypt hash, and `verifyPassword()` checks the submitted password against that hash. Using this pair keeps the stored hash format and the verifier compatible.

`verifyPassword()` returns `false` when the submitted password does not match or the stored hash cannot be read. Authentication cannot continue in either case.

## Implementation Guidance

- Validate a password before hashing it for storage.
- Store the value returned by `hashPassword()` instead of the plain-text password.
- Pass the stored hash as the first argument to `verifyPassword()` and the submitted password as the second argument.
- Continue authentication only after `verifyPassword()` returns `true`.

## Minimal Nuxt Example

```ts
const password = passwordSchema.parse(input.password);
const passwordHash = await hashPassword(password);

await users.create({
  email: input.email,
  password: passwordHash,
});
```

The stored value comes from `hashPassword()`. The plain-text password is not written to the user record.

```ts
const passwordIsValid = await verifyPassword(
  user.password,
  submittedPassword,
);

if (!passwordIsValid) {
  throw createError({ statusCode: 401 });
}
```

`verifyPassword()` checks the submitted password against the stored hash. Authentication stops when `verifyPassword()` returns `false`.

## App Examples

- [`register.post.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/api/auth/register.post.ts) hashes a validated password with `hashPassword()` before storing the new user record.
- [`login.post.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/api/auth/login.post.ts) checks a submitted password with `verifyPassword()` before replacing the user session.

## Trade-offs and Limitations

Using `hashPassword()` and `verifyPassword()` ties password hashing to Nuxt Auth Utils. A change to the hashing algorithm or hash format requires checking the current implementation and existing password hashes.

Authentication fails if `verifyPassword()` cannot read the stored password hash for a user. The user must reset their password, or a verifier that supports the old hash must remain available.

## Sources

- [Nuxt Auth Utils: Password Hashing](https://github.com/atinux/nuxt-auth-utils#password-hashing)
