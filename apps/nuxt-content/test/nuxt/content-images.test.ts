import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, expect, it } from "vitest";
import BlogPostGrid from "~/components/blocks/blog/BlogPostGrid.vue";
import ChangelogTimeline from "~/components/blocks/changelog/ChangelogTimeline.vue";

let wrapper: Awaited<ReturnType<typeof mountSuspended>>;
afterEach(() => wrapper?.unmount());

it("eager-loads the first four Blog cards and defers later covers and avatars", async () => {
  const posts = Array.from({ length: 5 }, (_, index) => ({
    path: `/blog/fixture-${index}`,
    title: `Fixture ${index}`,
    date: "2024-02-03",
    image: { src: "https://picsum.photos/id/42/640/360" },
    authors: [{ name: "Fixture Author", avatar: { src: "https://images.example.test/avatar.svg" } }],
  }));
  wrapper = await mountSuspended(BlogPostGrid, { props: { posts } });
  const cards = wrapper.findAll("a.group");
  expect(cards).toHaveLength(5);
  for (const [index, card] of cards.entries()) {
    const images = card.findAll("img");
    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image.attributes("alt")).toBe("");
      expect(image.attributes("loading")).toBe(index < 4 ? "eager" : "lazy");
    }
    expect(images[0]?.attributes("fetchpriority")).toBe(index === 0 ? "high" : undefined);
    expect(images[0]?.attributes("srcset")).toContain("https://picsum.photos/id/42/1280/720 1280w");
  }
});

it("prioritizes only the first Changelog image and keeps an imageless entry valid", async () => {
  wrapper = await mountSuspended(ChangelogTimeline, {
    props: {
      versions: [
        { title: "First", date: "2024-02-03", image: "https://images.example.test/first.svg" },
        { title: "Second", date: "2024-02-04", image: "https://images.example.test/second.svg" },
        { title: "Without an image", date: "2024-02-05" },
      ],
    },
    global: { stubs: { ContentRenderer: true } },
  });
  const entries = wrapper.findAll("article");
  expect(entries).toHaveLength(3);
  expect(entries[0]?.get("img").attributes()).toMatchObject({
    src: "https://images.example.test/first.svg", alt: "", loading: "eager", fetchpriority: "high",
  });
  expect(entries[1]?.get("img").attributes()).toMatchObject({
    src: "https://images.example.test/second.svg", alt: "", loading: "lazy",
  });
  expect(entries[1]?.get("img").attributes("fetchpriority")).toBeUndefined();
  expect(entries[2]?.find("img").exists()).toBe(false);
});
