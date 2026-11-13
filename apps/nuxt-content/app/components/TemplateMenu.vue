<script setup lang="ts">
import { ChevronDown, ExternalLink, LayoutTemplate } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";

const items = [
  { label: "Starter", href: "https://starter-template.stackhacker.io/" },
  { label: "Chat", href: "https://chat-template.stackhacker.io/" },
  { label: "Docs", href: "https://docs-template.stackhacker.io/" },
  { label: "Landing", href: "https://landing-template.stackhacker.io/" },
  { label: "Portfolio", href: "https://portfolio-template.stackhacker.io/" },
  { label: "SaaS", href: "https://saas-template.stackhacker.io/" },
  { label: "Changelog", href: "https://changelog-template.stackhacker.io/" },
];
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
      >
        <LayoutTemplate
          class="size-3.5"
          aria-hidden="true"
        />
        SaaS
        <ChevronDown
          class="size-3.5"
          aria-hidden="true"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      class="w-56"
    >
      <DropdownMenuItem
        v-for="item in items"
        :key="item.label"
        as-child
      >
        <a
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.label }}
          <ExternalLink
            class="ml-auto size-3.5 opacity-70"
            aria-hidden="true"
          />
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
