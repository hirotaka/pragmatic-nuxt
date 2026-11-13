<template>
  <div class="border-grid bg-muted/40 rounded-2xl border p-2 shadow-sm">
    <div class="border-grid relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed opacity-80">
      <svg
        class="absolute inset-0 h-full w-full stroke-foreground/10"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="placeholder-pattern"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
          </pattern>
        </defs>
        <rect
          stroke="none"
          fill="url(#placeholder-pattern)"
          width="100%"
          height="100%"
        />
      </svg>
      <slot>
        <Icon
          name="i-lucide-panels-top-left"
          class="text-muted-foreground size-12"
        />
      </slot>
    </div>
  </div>
</template>
