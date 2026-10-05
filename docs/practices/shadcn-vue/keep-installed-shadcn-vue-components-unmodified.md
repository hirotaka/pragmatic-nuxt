---
title: Keep Installed shadcn-vue Components Unmodified
semanticId: keep-installed-shadcn-vue-components-unmodified
category: component-maintenance
status: confirmed
---

# Keep Installed shadcn-vue Components Unmodified

## Practice

Keeping installed shadcn-vue component files unmodified makes it easier to incorporate updates from shadcn-vue. The copied files contain no application edits that need to be reconciled with the updated source.

## Apply When

- The UI can be built with shadcn-vue's design system as provided.
- Shadcn-vue components are being installed as source files or are already present in the project's source tree.

## Do Not Apply When

- UI components come from a package rather than shadcn-vue source files copied into the project.
- The project is building its own design system instead of using shadcn-vue's design system as provided.
- Installed shadcn-vue component files need direct changes that will be maintained across updates.

## Why

Shadcn-vue updates its distributed components, including fixes and changes to the icons or dependencies they use. Projects built with shadcn-vue's design system can review those changes and incorporate the ones they need. With no local edits to preserve, the CLI can overwrite the installed files with updated shadcn-vue source.

## Implementation Guidance

- Set up shadcn-vue in the target application and use `components.json` to find where UI component files are installed. Inspect registry items and dependencies before adding components.
- Keep installed component files unmodified. Manage application state, validation, and asynchronous actions in components that use the shared UI.
- For an update, inspect the registry item, then use the CLI's `add --overwrite` command from the application's directory or with `--cwd`. Review the resulting diff and dependencies, check affected consumers for API changes, and run the application's relevant checks.

## App Examples

- [`components.json`](../../../apps/bulletproof-nuxt/components.json) selects the directory where the CLI writes installed UI component source.
- [`Dialog.vue`](../../../apps/bulletproof-nuxt/app/components/ui/dialog/Dialog.vue) delegates dialog behavior to Reka UI within the installed component source.
- [`AppSidebar.vue`](../../../apps/bulletproof-nuxt/app/components/AppSidebar.vue) composes navigation with installed Sidebar components.
- [`FormDrawer.vue`](../../../apps/bulletproof-nuxt/app/components/FormDrawer.vue) composes form layout with installed Sheet components.
- [`DeleteDiscussionDialog.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DeleteDiscussionDialog.vue) owns asynchronous deletion and success-only closing around installed AlertDialog components.

## Trade-offs and Limitations

Shadcn-vue's Open Code lets a project change the component source to fit its own design system or behavior. Keeping those files unmodified gives up that flexibility and may add composition code to the application. Updates are not automatic; new versions may change APIs, icons, or dependencies and require changes in the components that use them.

## Sources

- [shadcn-vue: Introduction](https://www.shadcn-vue.com/docs/introduction)
- [shadcn-vue: CLI](https://www.shadcn-vue.com/docs/cli)
- [shadcn-vue: components.json](https://www.shadcn-vue.com/docs/components-json)
- [shadcn-vue: Nuxt Installation](https://www.shadcn-vue.com/docs/installation/nuxt)

## Related Practices

- [Integrate shadcn-vue with Nuxt and Cover Needed Styles](integrate-shadcn-vue-with-nuxt-and-cover-needed-styles.md)
