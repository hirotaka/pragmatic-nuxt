const author = {
  name: "Fixture Author",
  to: "https://authors.example.test/first",
  avatar: { src: "https://images.example.test/avatar.svg", alt: "" },
};

interface DocumentFixture {
  path: string;
  file: string;
  data: {
    title: string;
    description: string;
    seo?: { title: string; description: string };
    sitemap: false;
    navigation: false;
  };
  body: string;
}

export const seoDocuments: [DocumentFixture, DocumentFixture] = [
  {
    path: "/docs/seo-fixture",
    file: "1.docs/seo-fixture.md",
    data: {
      title: "Fixture document",
      description: "Visible fixture document description.",
      sitemap: false,
      navigation: false,
    },
    body: "## Fixture section\n\n[Next fixture](/docs/seo-fixture-overrides?utm_source=fixture-navigation)",
  },
  {
    path: "/docs/seo-fixture-overrides",
    file: "1.docs/seo-fixture-overrides.md",
    data: {
      title: "Second fixture document",
      description: "Visible second document description.",
      seo: { title: "Fixture document search title", description: "Fixture document search description." },
      sitemap: false,
      navigation: false,
    },
    body: "## Second fixture section\n\nA document used only during this test.",
  },
];

interface PostFixture {
  path: string;
  file: string;
  data: {
    title: string;
    description: string;
    seo?: { title: string; description: string };
    image: {
      src: string;
      alt: string;
      shareSrc?: string;
      dimensions?: { width: number; height: number };
    };
    authors: typeof author[];
    date: string;
    badge: { label: string };
  };
  body: string;
  expectedCoverSrcset: string | null;
}

export const seoPosts: [PostFixture, PostFixture] = [
  {
    path: "/blog/seo-fixture",
    file: "3.blog/seo-fixture.md",
    data: {
      title: "Fixture article",
      description: "A fixture description with \"quotes\".",
      image: {
        src: "https://picsum.photos/id/42/640/360",
        alt: "",
        shareSrc: "/share/blog/asian-cuisine.jpg",
        dimensions: { width: 640, height: 360 },
      },
      authors: [author],
      date: "2024-02-03",
      badge: { label: "Fixture" },
    },
    body: "## Fixture article section\n\nFirst test article body.",
    expectedCoverSrcset: [
      "https://picsum.photos/id/42/640/360 640w",
      "https://picsum.photos/id/42/960/540 960w",
      "https://picsum.photos/id/42/1280/720 1280w",
      "https://picsum.photos/id/42/1920/1080 1920w",
      "https://picsum.photos/id/42/2304/1296 2304w",
    ].join(", "),
  },
  {
    path: "/blog/seo-fixture-overrides",
    file: "3.blog/seo-fixture-overrides.md",
    data: {
      title: "Second fixture article",
      description: "Visible second article description.",
      seo: { title: "Second article search title", description: "Second article search description." },
      image: { src: "https://images.example.test/cover.svg", alt: "" },
      authors: [author, { ...author, name: "Second Fixture Author", to: "https://authors.example.test/second" }],
      date: "2024-05-06",
      badge: { label: "Fixture" },
    },
    body: "## Second fixture section\n\nSecond test article body.",
    expectedCoverSrcset: null,
  },
];

export const seoFixtures = [...seoDocuments, ...seoPosts];
