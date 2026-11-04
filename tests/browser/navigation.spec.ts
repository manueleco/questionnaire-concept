import { test, expect } from '@playwright/test';

for (const width of [320, 414, 1280]) {
  test(`bottom navigation and snap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('/');
    const feed = page.locator('#feed');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: "Let's listen" }).click();
    await expect.poll(() => feed.evaluate(el => Math.abs(el.scrollTop - el.clientHeight))).toBeLessThan(2);
    await expect(nav.getByRole('button', { name: 'Listen', exact: true })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('button', { name: 'Progress' }).click();
    const progress = page.getByRole('dialog', { name: 'A little progress.' });
    await expect(progress).toBeVisible();
    await expect(progress.getByRole('button', { name: /Which version sounds loudest/ })).toBeDisabled();
    await progress.getByRole('button', { name: /01 Welcome/ }).click();
    await expect.poll(() => feed.evaluate(el => el.scrollTop)).toBe(0);
    // A wheel gesture over the outer feed lands exactly at the next question.
    const box = (await feed.boundingBox())!;
    await page.mouse.move(box.x + 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => feed.evaluate(el => Math.abs(el.scrollTop - el.clientHeight))).toBeLessThan(2);
    // Long setup remains readable without shifting the app's navigation off-screen.
    const card = page.locator('[data-page="1"] .card');
    await card.getByRole('button', { name: "I'm ready" }).scrollIntoViewIfNeeded();
    const buttonBox = (await card.getByRole('button', { name: "I'm ready" }).boundingBox())!;
    const navBox = (await nav.boundingBox())!;
    expect(buttonBox.y + buttonBox.height).toBeLessThan(navBox.y);
    await expect(nav.getByRole('button', { name: 'Info' })).toBeInViewport();
    await nav.getByRole('button', { name: 'Info' }).click();
    await expect(page.locator('#info')).toBeVisible();
    await page.locator('#info .close').click();
    await nav.getByRole('button', { name: 'Home' }).click();
    await expect.poll(() => feed.evaluate(el => el.scrollTop)).toBe(0);
    await nav.getByRole('button', { name: 'Listen', exact: true }).click();
    await expect.poll(() => feed.evaluate(el => Math.abs(el.scrollTop - el.clientHeight))).toBeLessThan(2);
    expect(await card.evaluate(el => el.scrollTop)).toBe(0);
    if (await card.evaluate(el => el.scrollHeight > el.clientHeight + 2)) {
      await card.press('PageDown');
      await expect.poll(() => card.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
      await expect.poll(() => feed.evaluate(el => Math.abs(el.scrollTop - el.clientHeight))).toBeLessThan(2);
      await nav.getByRole('button', { name: 'Listen', exact: true }).click();
    }
    await page.screenshot({ path: `.playwright/setup-${width}.png` });
  });
}

test('static deployment clearly keeps responses on device', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 404, body: 'Not found' }));
  await page.goto('/');
  await expect(page.locator('#save-status')).toContainText('saved on this device');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Info' }).click();
  await expect(page.locator('#privacy-info')).toContainText('Nothing is submitted to a research database');
});
