<template>
  <div class="border-grid bg-muted/40 mx-auto mt-10 max-w-5xl rounded-2xl border p-2 shadow-sm">
    <video
      class="aspect-video w-full rounded-xl object-cover"
      preload="none"
      poster="/media/saas-video-poster.jpg"
      controls
    >
      <source
        src="https://res.cloudinary.com/nuxt/video/upload/v1708511800/ui-pro/video-nuxt-ui-pro_kwfbdh.webm"
        type="video/webm"
      >
      <source
        src="https://res.cloudinary.com/nuxt/video/upload/v1708511800/ui-pro/video-nuxt-ui-pro_kwfbdh.mp4"
        type="video/mp4"
      >
      <source
        src="https://res.cloudinary.com/nuxt/video/upload/v1708511800/ui-pro/video-nuxt-ui-pro_kwfbdh.ogg"
        type="video/ogg"
      >
    </video>
  </div>
</template>
