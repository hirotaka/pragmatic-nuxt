import { expect, test } from "@nuxt/test-utils/playwright";
import { waitForNuxtHydration } from "./support/nuxt-navigation";

test.use({ colorScheme: "light" });

test("the theme and Typeset follow the dark class", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

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
      radius: getComputedStyle(document.documentElement).getPropertyValue("--radius").trim(),
    };
    probe.remove();
    return result;
  });

  const light = await readTheme();
  expect(Number.parseFloat(light.radius)).toBeCloseTo(0.625);
  expect(Number.parseFloat(light.flow)).toBeGreaterThan(0);
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  const dark = await readTheme();

  expect(dark.background).not.toBe(light.background);
  expect(dark.typesetColor).not.toBe(light.typesetColor);
});

test("the GitHub link renders its bundled brand icon without icon API requests", async ({ page }) => {
  const iconApiRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/api\/_nuxt_icon\/|api\.iconify\.design|cdn\.jsdelivr\.net\/npm\/@iconify-json/.test(request.url())) {
      iconApiRequests.push(request.url());
    }
  });

  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response).not.toBeNull();
  expect(await response!.text()).toContain("iconify--uil");
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

test("the user menu uses semantic popover colors in dark mode", async ({ page }) => {
  await page.goto("/app", { waitUntil: "domcontentloaded" });
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
  await expect(menu).toHaveCSS("animation-name", "enter");

  const toasterBackground = await page.locator(".toaster").evaluate(element =>
    getComputedStyle(element).getPropertyValue("--normal-bg").trim());
  const popover = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--popover").trim());
  expect(toasterBackground).toBe(popover);
});
