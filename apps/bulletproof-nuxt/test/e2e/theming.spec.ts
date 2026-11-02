import { expect, test } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";
import { waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test.use({ colorScheme: "light" });

test("compiled theme styles and a Typeset probe respond to the dark class", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // A temporary DOM probe checks the loaded CSS, not a theme-switching UI.
  const readTheme = () => page.evaluate(() => {
    const probe = document.createElement("div");
    probe.className = "typeset";
    const first = document.createElement("p");
    first.textContent = "First";
    const second = document.createElement("p");
    second.textContent = "Second";
    probe.append(first, second);
    document.body.append(probe);

    const result = {
      background: getComputedStyle(document.body).backgroundColor,
      typesetColor: getComputedStyle(probe).color,
      flow: getComputedStyle(second).marginBlockStart,
    };
    probe.remove();
    return result;
  });

  const light = await readTheme();
  expect(Number.parseFloat(light.flow)).toBeGreaterThan(0);
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  const dark = await readTheme();

  expect(dark.background).not.toBe(light.background);
  expect(dark.typesetColor).not.toBe(light.typesetColor);
});

test("home renders the bundled GitHub SVG without icon API requests or mobile overflow", async ({ page }) => {
  const iconApiRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/api\/_nuxt_icon\/|api\.iconify\.design|cdn\.jsdelivr\.net\/npm\/@iconify-json/.test(request.url())) {
      iconApiRequests.push(request.url());
    }
  });

  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response).not.toBeNull();
  const html = await response!.text();
  const documentHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  // Require SVG markup, not a class name appearing only in the payload or stylesheet.
  expect(documentHtml).toMatch(/<svg\b[^>]*\bclass=["'][^"']*\biconify--uil\b[^"']*["'][^>]*>/i);
  await waitForNuxtHydration(page);

  const link = page.getByRole("link", { name: "Github Repo" });
  await expect(link).toHaveAttribute("href", "https://github.com/hirotaka/bulletproof-vue");
  const icon = link.locator("svg.iconify--uil");
  await expect(icon).toBeVisible();
  await expect(icon).toHaveAttribute("aria-hidden", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(iconApiRequests).toEqual([]);
});

test("the dark user menu renders the semantic popover background and foreground", async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "dark-user-menu", team.id, "ADMIN");
  await login(page.request, baseURL, account);
  await page.goto("/app", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.getByRole("button", { name: /Open user menu/ }).click();

  const expected = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--popover)";
    probe.style.color = "var(--popover-foreground)";
    document.body.append(probe);
    const colors = {
      background: getComputedStyle(probe).backgroundColor,
      foreground: getComputedStyle(probe).color,
    };
    probe.remove();
    return colors;
  });

  const menu = page.getByRole("menu");
  await expect(menu).toHaveCSS("background-color", expected.background);
  await expect(menu).toHaveCSS("color", expected.foreground);
});
