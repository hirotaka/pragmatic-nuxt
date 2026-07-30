# Pragmatic Nuxt

A collection of practical Nuxt showcases exploring different approaches to full-stack web development.

## About

This repository explores practical approaches to Nuxt development. Rather than prescribing a single "correct" way, we try various tools, patterns, and libraries to understand their trade-offs in real-world scenarios.

What you'll find here:

- **Exploration over dogma** - We try different approaches and share what we learn
- **Practical examples** - Real applications with tests, not just toy demos
- **Diverse options** - So many great libraries to choose from, that's what makes it fun

> **Note**: This repository was previously named `bulletproof-vue`. The showcases retain the "Bulletproof" branding as they are inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react).

## 📦 Showcases

### Start Here

If you want the current recommended Nuxt setup, start with:

- [apps/bulletproof-nuxt](apps/bulletproof-nuxt)

Technical decisions for actively maintained apps are documented in the [Technical Radar](docs/technical-radar.md). Confirmed guidance is collected in the [Nuxt Data Fetching Practices](docs/practices/use-fetch/index.md).

### Canonical Apps

Canonical Apps are actively maintained and follow current Adopt decisions from the Technical Radar.

| Showcase | Description | Key Libraries | Demo |
|----------|-------------|---------------|------|
| [bulletproof-nuxt](apps/bulletproof-nuxt) | Canonical Nuxt full-stack business app | Nuxt Layers, shadcn-vue, Regle, Zod v4, Drizzle ORM | [Live](https://bulletproof-nuxt.pages.dev) |
| `apps/chat` | Canonical AI chat app reference | Nuxt, AI SDK, shadcn-vue/reka-ui | Planned |
| `apps/dashboard` | Canonical dashboard app reference | Nuxt, Regle, Pinia Colada | Planned |

### Reference Apps

Reference Apps preserve alternative implementations and past experiments for comparison and learning.

| Showcase | Description | Key Libraries | Demo |
|----------|-------------|---------------|------|
| [reference/bulletproof-vue-vite](apps/reference/bulletproof-vue-vite) | Vue SPA (direct port from React) | Vue Router, TanStack Query, Pinia | [Live](https://bulletproof-vue.pages.dev) |
| [reference/bulletproof-nuxt-veevalidate](apps/reference/bulletproof-nuxt-veevalidate) | Nuxt full-stack VeeValidate legacy reference | VeeValidate, Zod v3 | - |
| [reference/bulletproof-nuxt-tanstack-form](apps/reference/bulletproof-nuxt-tanstack-form) | Nuxt full-stack TanStack Form comparison | TanStack Form, Zod v4 | - |
| [reference/bulletproof-nuxt-formwerk](apps/reference/bulletproof-nuxt-formwerk) | Nuxt full-stack Formwerk comparison | Formwerk, Zod v4 | - |
| [reference/bulletproof-nuxt-pinia-colada](apps/reference/bulletproof-nuxt-pinia-colada) | Nuxt full-stack Pinia Colada comparison | Pinia Colada, Nuxt | - |
| [reference/bulletproof-nuxt-original-ui](apps/reference/bulletproof-nuxt-original-ui) | Nuxt port of the original Bulletproof React UI composition | Nuxt Layers, Regle, Reka UI | - |

## 🗺️ Roadmap

Ideas we're exploring — suggestions welcome!

- Nuxt + Nuxt UI integration
- Testing strategies deep-dive
- Performance optimization guides

Have an idea? [Start a discussion](https://github.com/hirotaka/pragmatic-nuxt/discussions)!

## 🤝 Contributing

Contributions are welcome! Whether it's fixing bugs, improving documentation, or proposing new showcases:

1. Clone this repo
2. Create a branch: `git checkout -b your-feature`
3. Make your changes
4. Test your changes
5. Push your branch and open a Pull Request

## 📄 License

[MIT](/LICENSE)

## 🙏 Credits

The Bulletproof series is inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react) by Alan Alickovic.
