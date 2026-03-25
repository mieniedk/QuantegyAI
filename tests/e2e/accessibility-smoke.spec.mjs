import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/pricing', '/privacy', '/terms', '/dpa', '/security'];

test('public pages pass accessibility smoke checks', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState('domcontentloaded');

    const issues = await page.evaluate(() => {
      const normalize = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const items = [];

      const imgs = Array.from(document.querySelectorAll('img'));
      for (const img of imgs) {
        const alt = normalize(img.getAttribute('alt'));
        if (!alt) {
          items.push({ type: 'img-missing-alt', html: img.outerHTML.slice(0, 120) });
        }
      }

      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const label = normalize(
          btn.getAttribute('aria-label')
          || btn.getAttribute('title')
          || btn.textContent,
        );
        if (!label) {
          items.push({ type: 'button-missing-name', html: btn.outerHTML.slice(0, 120) });
        }
      }

      const fields = Array.from(document.querySelectorAll('input,select,textarea'));
      for (const el of fields) {
        const type = (el.getAttribute('type') || '').toLowerCase();
        if (['hidden', 'submit', 'button', 'image'].includes(type)) continue;
        const id = el.getAttribute('id');
        const hasLabel = !!(id && document.querySelector(`label[for="${id}"]`));
        const hasAria = !!normalize(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));
        if (!hasLabel && !hasAria) {
          items.push({ type: 'field-missing-label', html: el.outerHTML.slice(0, 120) });
        }
      }

      return items;
    });

    expect(issues, `a11y smoke issues on route ${route}: ${JSON.stringify(issues, null, 2)}`).toEqual([]);
  }
});
