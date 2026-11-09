import { test, expect } from '@playwright/test';

test('third rank fills after two picks, can be revised, and never auto-navigates',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/?lang=es');
  await page.getByRole('button',{name:'Vamos a escuchar'}).click();
  const setup=page.locator('[data-page="1"]');await setup.locator('select').nth(0).selectOption('over-ear');await setup.locator('select').nth(1).selectOption('none');
  for(const checkbox of await setup.locator('input[type="checkbox"]').all())await checkbox.check();
  await setup.getByRole('button',{name:'Empezar'}).click();
  const question=page.locator('[data-page="2"]'),choices=question.locator('.rank-choice');
  await question.locator('.play').click();
  for (const version of await question.locator('.version').all()) { await version.click(); await page.waitForTimeout(1450); }
  await choices.nth(2).click();await choices.nth(0).click();
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(choices.nth(1).locator('.rank-num')).toHaveText('3');
  await expect(question.getByRole('button',{name:'Continuar'})).toBeInViewport();
  await expect(question.locator('h2')).toBeInViewport();
  await expect.poll(() => page.locator('#feed').evaluate(el => Math.abs(el.scrollTop - el.clientHeight * 2))).toBeLessThan(2);
  await page.screenshot({path:'.playwright/apple-ranking-375.png'});
  await choices.nth(0).click();await expect(choices.nth(0)).toHaveAttribute('aria-pressed','false');
  await choices.nth(0).click();await expect(choices.nth(0).locator('.rank-num')).toHaveText('3');
  await question.getByRole('button',{name:'Reiniciar orden'}).click();
  await expect(question.locator('.rank-choice[aria-pressed="true"]')).toHaveCount(0);
  await question.getByRole('button',{name:'Sin diferencia'}).click();
  await expect(question.getByRole('button',{name:'Sin diferencia'})).toHaveAttribute('aria-pressed','true');
});
