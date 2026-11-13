import { defineCollection, z } from "@nuxt/content";

const linkSchema = z.object({
  label: z.string(),
  to: z.string().optional(),
  icon: z.string().optional(),
  target: z.string().optional(),
  variant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).optional(),
});

const imageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
});

export const collections = {
  index: defineCollection({
    source: "0.index.yml",
    type: "page",
    schema: z.object({
      hero: z.object({ links: z.array(linkSchema) }),
      sections: z.array(z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string(),
        reverse: z.boolean().optional(),
        features: z.array(z.object({
          title: z.string().optional(),
          name: z.string().optional(),
          description: z.string(),
          icon: z.string(),
        })),
      })),
      features: z.object({
        title: z.string(),
        description: z.string(),
        items: z.array(z.object({ title: z.string(), description: z.string(), icon: z.string() })),
      }),
      highlights: z.object({
        headline: z.string().optional(),
        title: z.string(),
        description: z.string(),
        items: z.array(z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string(),
        })),
      }),
      cta: z.object({ title: z.string(), description: z.string(), links: z.array(linkSchema) }),
    }),
  }),
  docs: defineCollection({
    source: "1.docs/**/*",
    type: "page",
  }),
  pricing: defineCollection({
    source: "2.pricing.yml",
    type: "page",
    schema: z.object({
      plans: z.array(z.object({
        title: z.string(),
        description: z.string(),
        price: z.object({ month: z.string(), year: z.string() }),
        billing_period: z.string().optional(),
        billing_cycle: z.string().optional(),
        button: linkSchema,
        features: z.array(z.string()),
        highlight: z.boolean().optional(),
      })),
      logos: z.object({ title: z.string(), icons: z.array(z.string()) }),
      faq: z.object({
        title: z.string(),
        description: z.string(),
        items: z.array(z.object({ label: z.string(), content: z.string() })),
      }),
    }),
  }),
  blog: defineCollection({
    source: "3.blog.yml",
    type: "page",
  }),
  posts: defineCollection({
    source: "3.blog/**/*",
    type: "page",
    schema: z.object({
      image: imageSchema,
      authors: z.array(z.object({
        name: z.string(),
        to: z.string(),
        avatar: imageSchema,
      })),
      date: z.date(),
      badge: z.object({ label: z.string() }),
    }),
  }),
  changelog: defineCollection({
    source: "4.changelog.yml",
    type: "page",
  }),
  versions: defineCollection({
    source: "4.changelog/**/*",
    type: "page",
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      image: z.string().optional(),
    }),
  }),
};
