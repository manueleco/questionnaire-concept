import { test, expect } from '@playwright/test';

for (const width of [320, 375, 414, 768]) {
  test(`all cards and dialogs fit internally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('/');
    await page.getByRole('button', { name: "Let's listen" }).waitFor();
    // Layout isolation: reveal the actual rendered cards without inventing answers
    // or submitting data. The separate flow test verifies unlocking and persistence.
    await page.locator('.page').evaluateAll(els => els.forEach(el => (el as HTMLElement).hidden = false));
    const cards = page.locator('.card');
    expect(await cards.count()).toBe(9);
    for (const card of await cards.all()) {
      const size = await card.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
      expect(size.width).toBeGreaterThan(0);
      expect(size.scroll).toBeLessThanOrEqual(size.width + 1);
      const outside = await card.evaluate(el => {
        const bounds = el.getBoundingClientRect();
        return [...el.querySelectorAll('button, select, input, textarea, .waveform, .time')]
          .filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.left < bounds.left - 1 || r.right > bounds.right + 1); })
          .map(e => e.className || e.tagName);
      });
      expect(outside).toEqual([]);
    }
    await page.locator('[data-page="2"] .card').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.playwright/audio-mobile-${width}.png` });
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Info' }).click();
    const info = page.locator('#info');
    await expect(info).toBeVisible();
    expect(await info.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await page.getByRole('button', { name: 'Try your own A/B/C files' }).click();
    const importer = page.locator('#import-dialog');
    await expect(importer).toBeVisible();
    expect(await importer.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  });
}

test('short touch viewport retains the start button and navigation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 640 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8317');
  await expect(page.getByRole('button', { name: "Let's listen" })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Take a quick tour' })).toBeInViewport();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeInViewport();
  await page.screenshot({ path: '.playwright/welcome-short-mobile.png' });
  await context.close();
});
