import { test, expect } from '@playwright/test';

test('short guide closes, advances and can be reopened from Info', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'First time? Take a quick tour' }).click();
  const guide = page.locator('.quick-guide');
  await expect(guide).toBeVisible();
  await expect(guide.getByRole('heading')).toHaveText('Your menu is down here.');
  await page.screenshot({ path: '.playwright/quick-guide.png' });
  await guide.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(guide.getByRole('heading')).toHaveText('One question at a time.');
  await guide.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(guide.getByRole('heading')).toHaveText('Compare with your ears.');
  await guide.getByRole('button', { name: 'Got it' }).click();
  await expect(guide).not.toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Info' }).click();
  await page.getByRole('button', { name: 'Show quick guide' }).click();
  await expect(guide).toBeVisible();
  await expect(guide.getByRole('heading')).toHaveText('Your menu is down here.');
  await page.keyboard.press('Escape');
  await expect(guide).not.toBeVisible();
});

test('fonts are local and unknown assets remain inaccessible', async ({ page, request }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('800 44px "Scroll Display"'))).toBe(true);
  expect((await request.get('/fonts/BarlowCondensed-ExtraBold.ttf')).status()).toBe(200);
  expect((await request.get('/fonts/settings.py')).status()).toBe(404);
});
