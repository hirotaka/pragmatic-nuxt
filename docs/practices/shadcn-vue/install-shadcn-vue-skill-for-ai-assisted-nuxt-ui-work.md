---
title: Install the shadcn-vue skill for AI-Assisted Nuxt UI Work
semanticId: install-shadcn-vue-skill-for-ai-assisted-nuxt-ui-work
category: component-workflow
status: confirmed
---

# Install the shadcn-vue skill for AI-Assisted Nuxt UI Work

## Practice

Installing the official shadcn-vue skill gives AI assistants like Claude Code project-aware guidance when working on a Nuxt application. The skill reads the target application's configuration to guide component discovery, installation, composition, and customization with the appropriate APIs and patterns.

## Apply When

- A Nuxt application is being built with an AI assistant.
- The assistant will use shadcn-vue components to build forms, navigation, or other parts of the application's UI.

## Do Not Apply When

- The UI does not use shadcn-vue components, so shadcn-vue's component patterns are not relevant.
- The task is limited to reading registry items without a Nuxt application's component context; CLI or MCP lookup is sufficient.

## Why

The skill combines the target application's configuration with shadcn-vue's component and styling guidance. This helps the AI assistant reuse installed components, build forms and navigation with suitable APIs, and customize components within the application's theme.

## Implementation Guidance

- Install the official shadcn-vue skill in the project through [skills.sh](https://skills.sh) with `pnpm dlx skills add unovue/shadcn-vue`, so its guidance is available to the AI assistant during component work.
- Select the target Nuxt application's directory as the CLI context. Check `shadcn-vue info --json` there, or use `--cwd`, and compare the reported paths and aliases with its `components.json`.
- Use the skill's guidance on component composition and styling, along with CLI `docs`, `search`, and `view`, to find relevant components and patterns before building custom UI. A connected MCP server can supplement registry discovery when needed.

## Minimal Nuxt Example

```jsonc
// components.json
{
  "style": "new-york",
  "tailwind": { "css": "app/assets/css/tailwind.css" },
  "aliases": { "ui": "@/components/ui" },
  "iconLibrary": "lucide"
}
```

`components.json` supplies the Nuxt application's paths, style, and icon library; other fields are omitted here. The skill runs the shadcn-vue CLI to read this context. To inspect it directly, run `pnpm dlx shadcn-vue@latest info --json` in the application directory or select that directory with `--cwd <application-directory>`.

## App Examples

- [`SKILL.md`](../../../.agents/skills/shadcn-vue/SKILL.md) is the project-installed official shadcn-vue skill entry point for component guidance.
- [`components.json`](../../../apps/bulletproof-nuxt/components.json) provides the Nuxt application's shadcn-vue configuration for CLI project context.
- [`AGENTS.md`](../../../AGENTS.md) tells agents to run shadcn-vue CLI commands in the application's directory or pass its path with `--cwd`.

## Trade-offs and Limitations

Installing the skill adds guidance that is versioned separately from the shadcn-vue component source in the application. The two do not update together automatically, so keeping the guidance aligned with the application's component APIs requires review when either changes.

In a monorepo, installing the skill does not tell the CLI which Nuxt application to inspect; the target application's directory still needs to be specified.

## Sources

- [shadcn-vue: Skills](https://www.shadcn-vue.com/docs/skills)
- [shadcn-vue: CLI](https://www.shadcn-vue.com/docs/cli)
- [shadcn-vue: MCP Server](https://www.shadcn-vue.com/docs/mcp)

## Related Practices

- [Integrate shadcn-vue with Nuxt and Cover Needed Styles](integrate-shadcn-vue-with-nuxt-and-cover-needed-styles.md)
