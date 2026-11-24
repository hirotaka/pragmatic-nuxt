import { writeFile, unlink } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { createPage, setup, url } from "@nuxt/test-utils/e2e";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seoDocuments, seoFixtures, seoPosts } from "../fixtures/content/seo-inputs";
import { e2eNuxtConfig } from "./nuxt-config";

loadEnvFile(new URL("../../.env.test", import.meta.url));
const siteUrl = "https://nuxt-content.test";

describe("public SEO outputs", async () => {
  const created: URL[] = [];
  beforeAll(async () => {
    for (const fixture of seoFixtures) {
      const target = new URL(`../../content/${fixture.file}`, import.meta.url);
      await writeFile(target, `---\n${JSON.stringify(fixture.data)}\n---\n\n${fixture.body}\n`, { flag: "wx" });
      created.push(target);
    }
  });
  afterAll(async () => {
    await Promise.all(created.map(target => unlink(target)));
  });

  await setup({
    rootDir: fileURLToPath(new URL("../..", import.meta.url)),
    browser: true,
    nuxtConfig: e2eNuxtConfig,
  });

  it.each(["/pricing", seoPosts[0].path, seoDocuments[0].path])("normalizes trailing slashes once and preserves queries (%s)", async (path) => {
    const query = "?utm_source=slash-check&ref=one%2Ftwo&tag=a&tag=b";
    const response = await fetch(url(`${path}/${query}`), { redirect: "manual" });
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`${path}${query}`);
    const destination = await fetch(url(`${path}${query}`), { redirect: "manual" });
    expect(destination.status).toBe(200);
    expect(destination.headers.get("location")).toBeNull();
    expect(await destination.text()).toContain(`href="${siteUrl}${path}"`);
  });

  it("keeps redirects same-origin when leading and trailing slashes repeat", async () => {
    const target = new URL(url("/pricing"));
    target.pathname = "//pricing///";
    const response = await fetch(target, { redirect: "manual" });
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("/pricing");
  });

  it("normalizes trailing slashes for HEAD requests", async () => {
    const response = await fetch(url("/pricing/"), { method: "HEAD", redirect: "manual" });
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("/pricing");
  });

  it.each(["/", "/api/slash-probe/", "/_nuxt/slash-probe/", "/__sitemap__/slash-probe/", "/robots.txt/", "/docs/getting-started.md/"])("leaves root, API, internal and file URLs outside slash normalization (%s)", async (path) => {
    const response = await fetch(url(path), { redirect: "manual" });
    expect(response.status).not.toBe(308);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([
    { path: "/docs", method: "GET" },
    { path: "/docs/", method: "GET" },
    { path: "/docs", method: "HEAD" },
    { path: "/docs/", method: "HEAD" },
  ])("permanently redirects Docs entry in one hop ($method $path)", async ({ path, method }) => {
    const query = "?utm_source=slash-check&ref=one%2Ftwo&tag=a&tag=b";
    const response = await fetch(url(`${path}${query}`), { method, redirect: "manual" });
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`/docs/getting-started${query}`);
    const destination = await fetch(url(`/docs/getting-started${query}`), { method, redirect: "manual" });
    expect(destination.status).toBe(200);
    expect(destination.headers.get("location")).toBeNull();
  });

  it.each([
    "/",
    "/pricing",
    seoPosts[0].path,
    "/docs/getting-started",
    "/robots.txt",
    "/sitemap.xml",
    "/docs/getting-started.md",
    "/__nuxt_content/docs/sql_dump.txt",
    "/docs",
    "/pricing/",
  ])("sends basic security headers for public responses (%s)", async (path) => {
    for (const method of ["GET", "HEAD"]) {
      const response = await fetch(url(path), { method, redirect: "manual" });
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    }
  });

  it.each(["/docs/getting-started", seoPosts[0].path, "/seo-security-missing-probe"])("protects documents from cross-origin framing (%s)", async (path) => {
    const response = await fetch(url(path), { headers: { accept: "text/html" } });
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("content-security-policy")?.split("; ")).toEqual(expect.arrayContaining([
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ]));
  });

  it.each(["text/html", "application/json"])("keeps the stricter error-response referrer policy (%s)", async (accept) => {
    for (const method of ["GET", "HEAD"]) {
      const response = await fetch(url("/seo-security-missing-probe"), { method, headers: { accept }, redirect: "manual" });
      expect(response.status).toBe(404);
      expect(response.headers.get("content-type")).toContain(accept);
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    }
  });

  it.each([
    { name: "server-rendered", javaScriptEnabled: false },
    { name: "hydrated", javaScriptEnabled: true },
  ])("maps Docs input to unique metadata and queryless canonicals ($name)", async ({ javaScriptEnabled }) => {
    const page = await createPage(undefined, { javaScriptEnabled });
    try {
      const query = "?page=2&sort=date&filter=red&search=installation&q=installation&category=guides&tag=nuxt&utm_source=seo-check&fbclid=sample-fb&gclid=sample-g";
      for (const [index, fixture] of seoDocuments.entries()) {
        const currentQuery = javaScriptEnabled && index > 0 ? "?utm_source=fixture-navigation" : query;
        if (javaScriptEnabled && index > 0) {
          const timeOrigin = await page.evaluate(() => performance.timeOrigin);
          await page.getByRole("link", { name: "Next fixture", exact: true }).click();
          await page.waitForURL(url(`${fixture.path}${currentQuery}`));
          expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
        }
        else {
          await page.goto(url(`${fixture.path}${currentQuery}`), {
            waitUntil: javaScriptEnabled ? "hydration" : "domcontentloaded",
          });
        }
        await page.getByRole("heading", { level: 1, name: fixture.data.title, exact: true }).waitFor();
        if (javaScriptEnabled) {
          await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        }
        const { data } = fixture;
        const title = data.seo?.title ?? data.title;
        const description = data.seo?.description ?? data.description;
        expect(new URL(page.url()).search).toBe(currentQuery);
        expect(await page.getByRole("heading", { level: 1 }).allTextContents()).toEqual([data.title]);
        expect((await page.locator("article header > p").innerText()).trim()).toBe(data.description);
        expect(await page.locator("head title").allTextContents()).toEqual([`${title} - Stackhacker UI SaaS template`]);
        const metadata = {
          "meta[name=description]": description,
          "meta[property='og:title']": title,
          "meta[property='og:description']": description,
          "meta[property='og:image']": "https://ui.stackhacker.io/templates/saas-light.png",
          "meta[property='og:url']": `${siteUrl}${fixture.path}`,
          "meta[name='twitter:card']": "summary_large_image",
        };
        for (const [selector, value] of Object.entries(metadata)) {
          expect(await page.locator(`head ${selector}`).count()).toBe(1);
          expect(await page.locator(`head ${selector}`).getAttribute("content")).toBe(value);
        }
        const canonical = page.locator("head link[rel=canonical]");
        expect(await canonical.count()).toBe(1);
        expect(await canonical.getAttribute("href")).toBe(`${siteUrl}${fixture.path}`);
        expect(await page.locator("head link[rel=icon]").count()).toBe(1);
      }
    }
    finally {
      await page.close();
    }
  });

  it.each(seoPosts)("maps article input to metadata and BlogPosting in initial HTML ($path)", async ({ path, data, expectedCoverSrcset }) => {
    const page = await createPage(undefined, { javaScriptEnabled: false });
    try {
      await page.route("**/*", (route) => {
        if (route.request().resourceType() === "image") return route.fulfill({
          path: fileURLToPath(new URL("../fixtures/images/content.svg", import.meta.url)),
          contentType: "image/svg+xml",
        });
        if (!route.request().url().startsWith(url("/"))) return route.abort();
        return route.continue();
      });
      await page.goto(url(path), { waitUntil: "domcontentloaded" });
      expect(await page.getByRole("heading", { level: 1 }).allTextContents()).toEqual([data.title]);
      expect((await page.locator("article header > p").innerText()).trim()).toBe(data.description);
      const cover = page.locator("article > div > img");
      expect(await cover.count()).toBe(1);
      for (const [attribute, value] of Object.entries({
        src: data.image.src, alt: "", width: "640", height: "360", loading: "eager", fetchpriority: "high",
      })) {
        expect(await cover.getAttribute(attribute)).toBe(value);
      }
      expect(await cover.getAttribute("srcset")).toBe(expectedCoverSrcset);
      expect(await cover.getAttribute("sizes")).toContain("1104px");
      expect((await page.locator("article header").getByRole("link").allTextContents()).map(name => name.trim()))
        .toEqual(data.authors.map(author => author.name));
      expect(await page.locator("article header time").innerText()).toBe(new Date(data.date).toLocaleDateString("en", {
        year: "numeric", month: "short", day: "numeric",
      }));
      const title = data.seo?.title ?? data.title;
      const description = data.seo?.description ?? data.description;
      expect(await page.locator("head title").allTextContents()).toEqual([`${title} - Stackhacker UI SaaS template`]);
      for (const [selector, value] of Object.entries({
        "meta[name=description]": description,
        "meta[property='og:title']": title,
        "meta[property='og:description']": description,
        "meta[property='og:image']": data.image.src,
        "meta[property='og:url']": `${siteUrl}${path}`,
      })) {
        expect(await page.locator(`head ${selector}`).count()).toBe(1);
        expect(await page.locator(`head ${selector}`).getAttribute("content")).toBe(value);
      }
      expect(await page.locator("head link[rel=canonical]").count()).toBe(1);
      expect(await page.locator("head link[rel=canonical]").getAttribute("href")).toBe(`${siteUrl}${path}`);

      const graph: Record<string, unknown>[] = (await page.locator("script[type='application/ld+json']").allTextContents())
        .flatMap(script => JSON.parse(script)["@graph"]);
      const articles = graph.filter(node => [node["@type"]].flat().includes("BlogPosting"));
      expect(articles).toHaveLength(1);
      const [article] = articles;
      const webpage = graph.find(node => [node["@type"]].flat().includes("WebPage"));
      expect(webpage?.url).toBe(`${siteUrl}${path}`);
      expect(webpage?.["@id"]).toEqual(expect.stringMatching(/\S/));
      expect(article).toMatchObject({
        headline: data.title,
        description: data.description,
        datePublished: data.date,
        isPartOf: { "@id": webpage?.["@id"] },
        mainEntityOfPage: { "@id": webpage?.["@id"] },
      });
      expect(article).not.toHaveProperty("dateModified");
      expect(article).not.toHaveProperty("publisher");
      const images = graph.filter(node => [node["@type"]].flat().includes("ImageObject") && node.url === data.image.src);
      expect(images).toHaveLength(1);
      expect([article?.image].flat()).toEqual(images.map(node => ({ "@id": node["@id"] })));
      const authors = graph.filter(node => [node["@type"]].flat().includes("Person") && data.authors.some(author => author.name === node.name));
      expect(authors.map(node => node.name).sort()).toEqual(data.authors.map(author => author.name).sort());
      expect([article?.author].flat()).toEqual(authors.map(node => ({ "@id": node["@id"] })));
    }
    finally {
      await page.close();
    }
  });

  it.each(["/blog", "/docs/getting-started", "/pricing"])("keeps article schema scoped to blog posts (%s)", async (path) => {
    const page = await createPage(undefined, { javaScriptEnabled: false });
    try {
      await page.goto(url(path), { waitUntil: "domcontentloaded" });
      const graph: Record<string, unknown>[] = (await page.locator("script[type='application/ld+json']").allTextContents())
        .flatMap(script => JSON.parse(script)["@graph"]);
      expect(graph.some(node => [node["@type"]].flat().includes("WebPage"))).toBe(true);
      expect(graph.filter(node => [node["@type"]].flat().includes("Article"))).toEqual([]);
      expect(graph.filter(node => [node["@type"]].flat().includes("BlogPosting"))).toEqual([]);
    }
    finally {
      await page.close();
    }
  });

  it("publishes navigable Content in sitemap and readable Markdown exports", async () => {
    const page = await createPage(undefined, { javaScriptEnabled: false });
    try {
      const fixturePaths = new Set(seoFixtures.map(fixture => fixture.path));
      await page.goto(url("/docs/getting-started"), { waitUntil: "domcontentloaded" });
      const docs = await page.locator("main aside nav a[href^='/docs/']").evaluateAll(links => links.map(link => link.getAttribute("href")));
      await page.goto(url("/blog"), { waitUntil: "domcontentloaded" });
      const posts = await page.locator("main a:has(h2)").evaluateAll(links => links.map(link => link.getAttribute("href")));
      const docsPaths = docs.filter((path): path is string => !!path && !fixturePaths.has(path));
      const postPaths = posts.filter((path): path is string => !!path && !fixturePaths.has(path));
      expect(docsPaths.length).toBeGreaterThan(0);
      expect(postPaths.length).toBeGreaterThan(0);
      const contentPaths = [...new Set([...docsPaths, ...postPaths])];
      const corePaths = ["/", "/pricing", "/blog", "/changelog", "/login", "/signup"];
      for (const path of [...corePaths, ...contentPaths]) {
        const response = await fetch(url(path), { redirect: "manual" });
        expect(response.status, path).toBe(200);
        expect(response.headers.get("content-type"), path).toContain("text/html");
      }

      const sitemapResponse = await fetch(url("/sitemap.xml"));
      expect(sitemapResponse.status).toBe(200);
      expect(sitemapResponse.headers.get("content-type")).toContain("xml");
      const sitemap = await sitemapResponse.text();
      for (const path of contentPaths) expect(sitemap).toContain(`<loc>${siteUrl}${path}</loc>`);

      const robotsResponse = await fetch(url("/robots.txt"));
      expect(robotsResponse.status).toBe(200);
      expect(robotsResponse.headers.get("content-type")).toContain("text/plain");
      const robots = await robotsResponse.text();
      expect(robots).toMatch(/User-Agent: \*/i);
      expect(robots).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
      expect(robots).toContain("Content-Signal: search=yes, ai-input=yes");

      const index = await fetch(url("/llms.txt"));
      expect(index.status).toBe(200);
      expect(index.headers.get("content-type")).toContain("text/plain");
      const listing = await index.text();
      const introduction = "# Nuxt Content Showcase\n\n> A Nuxt Content showcase with documentation, sample blog articles, and editable SaaS pages built with Nuxt and shadcn-vue.";
      expect(listing).toContain(introduction);
      const markdownLinks = Array.from(listing.matchAll(/\]\(([^)]+\.md)\)/g), ([, href]) => new URL(String(href), siteUrl));
      const expectedPaths = [...corePaths, ...contentPaths].map(path => path === "/" ? "/index.md" : `${path}.md`);
      const indexedPaths = markdownLinks.map(link => link.pathname);
      expect(new Set(indexedPaths).size).toBe(indexedPaths.length);
      for (const path of expectedPaths) expect(indexedPaths).toContain(path);
      for (const link of markdownLinks) {
        expect(link.origin).toBe(siteUrl);
        const response = await fetch(url(link.pathname));
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toContain("text/markdown");
        expect((await response.text()).trim()).not.toBe("");
      }

      const full = await fetch(url("/llms-full.txt"));
      expect(full.status).toBe(200);
      expect(full.headers.get("content-type")).toContain("text/plain");
      expect(await full.text()).toContain(introduction);
    }
    finally {
      await page.close();
    }
  });

  it("serves Content Markdown with discovery headers", async () => {
    const response = await fetch(url("/docs/getting-started.md"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("vary")?.toLowerCase()).toContain("accept");
    expect(response.headers.get("link")).toContain("rel=\"describedby\"");
    const markdown = await response.text();
    expect(markdown).toContain(`canonical_url: "${siteUrl}/docs/getting-started"`);
    expect(markdown.trim()).not.toBe("");
    expect(markdown).toContain(`${siteUrl}/llms.txt`);
    expect(markdown).not.toContain("__NUXT__");
  });
});
