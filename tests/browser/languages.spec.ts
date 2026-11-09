import { test, expect } from '@playwright/test';
const labels = { en: {start:"Let's listen", ready:"I'm ready", heading:'Which version sounds loudest?', guide:'Take a quick tour', next:'Continue'}, es: {start:'Vamos a escuchar',ready:'Empezar',heading:'¿Qué versión suena más fuerte?',guide:'Ver guía breve',next:'Continuar'}, ca: {start:'Comencem a escoltar',ready:'Comença',heading:'Quina versió sona més fort?',guide:'Mira la guia breu',next:'Continua'} };
for (const lang of ['en', 'es', 'ca'] as const) {
  test(`${lang}: translated questions, guide, shell and all cards fit at 320px`, async ({page})=>{
    await page.setViewportSize({width:320,height:740}); await page.goto(`/?lang=${lang}`);
    await expect(page.locator('html')).toHaveAttribute('lang',lang);
    await page.getByRole('button',{name:labels[lang].guide,exact:true}).click();
    await expect(page.locator('.quick-guide')).toBeVisible();
    expect(await page.locator('.quick-guide').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    await page.keyboard.press('Escape');
    await page.locator('.page').evaluateAll(els=>els.forEach(el=>(el as HTMLElement).hidden=false));
    await expect(page.locator('[data-page="2"] h2')).toHaveText(labels[lang].heading);
    for (const card of await page.locator('.card').all()) expect(await card.evaluate(el=>el.clientWidth>0 && el.scrollWidth<=el.clientWidth+1)).toBe(true);
    await page.locator('[data-page="2"] .card').scrollIntoViewIfNeeded();
    await page.screenshot({path:`.playwright/i18n-${lang}-320.png`});
    await page.locator('[data-nav="info"]').click();
    expect(await page.locator('#info').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    await page.locator('#info .close').click();
  });
}

test('switching language preserves audio, rankings, timers and stores response languages',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/?lang=es');
  await page.getByRole('button',{name:labels.es.start}).click();
  const setup=page.locator('[data-page="1"]');
  await setup.locator('select').nth(0).selectOption('over-ear');await setup.locator('select').nth(1).selectOption('none');
  for(const c of await setup.locator('input[type="checkbox"]').all())await c.check();
  await setup.getByRole('button',{name:labels.es.ready}).click();
  const q=page.locator('[data-page="2"]');await q.locator('.play').click();
  for(const v of await q.locator('.version').all()){await v.click();await page.waitForTimeout(1450);}
  await q.locator('.rank-choice').nth(0).click();
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('scroll-questionnaire-demo-v1')!));
  await page.locator('#language-select').selectOption('ca');
  await expect(q.locator('h2')).toHaveText(labels.ca.heading);
  await expect(q.locator('.play')).toHaveAttribute('aria-label',"Pausa l'àudio");
  await q.locator('.rank-choice').nth(1).click();await expect(q.locator('.rank-choice').nth(2)).toHaveAttribute('aria-pressed','true');
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('scroll-questionnaire-demo-v1')!));
  expect(after.id).toBe(before.id);expect(after.mapping).toEqual(before.mapping);expect(after.answers.loudness.order).toEqual(['A','B','C']);
  expect(after.answers.loudness.language).toBe('ca');expect(after.consentLanguage).toBe('es');expect(after.timings.loudness.activeMs).toBeGreaterThanOrEqual(before.timings.loudness.activeMs);
  await q.getByRole('button',{name:labels.ca.next}).click();
  for(let i=3;i<=5;i++){const card=page.locator(`[data-page="${i}"]`);await card.getByRole('button',{name:'Cap diferència'}).click();await card.getByRole('button',{name:'Continua'}).click();}
  for(let i=6;i<=7;i++)await page.locator(`[data-page="${i}"]`).getByRole('button',{name:'Següent'}).click();
  const saving=page.waitForResponse(r=>r.url().endsWith('/api/responses/')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Envia les respostes'}).click();expect((await saving).status()).toBe(201);
  await expect(page.getByRole('heading',{name:'Gràcies per escoltar.'})).toBeVisible();
  await page.reload();await expect(page.locator('#language-select')).toHaveValue('ca');
  await expect(page.getByRole('heading',{name:'Gràcies per escoltar.'})).toBeVisible();
  page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Esborra la meva sessió'}).click();
  await expect(page.getByRole('button',{name:labels.ca.start})).toBeVisible();
});

test('unsupported URL language falls back and static demo translations work',async({page})=>{
  await page.route('**/api/**',route=>route.fulfill({status:404,body:'Not found'}));
  await page.goto('/?lang=unknown');await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.locator('#language-select').selectOption('es');
  await expect(page.locator('#save-status')).toHaveText('Demo · guardado en este dispositivo');
  await page.locator('.page').evaluateAll(els=>els.forEach(el=>(el as HTMLElement).hidden=false));
  await expect(page.locator('[data-page="2"] h2')).toHaveText(labels.es.heading);
});
