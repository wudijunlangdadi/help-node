import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });

  // Screenshot 1: Mode page
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'E:/hao_agent/help_node/screenshot-mode.png', fullPage: true });
  console.log('Screenshot 1: Mode page saved');

  // Screenshot 2: Article list
  const englishBtn = page.locator('text=English').first();
  if (await englishBtn.isVisible()) {
    await englishBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'E:/hao_agent/help_node/screenshot-articles.png', fullPage: true });
    console.log('Screenshot 2: Article list saved');
  }

  // Screenshot 3: Dark mode
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
  // Toggle to dark mode
  const themeBtn = page.locator('button[aria-label*="深色"], button[aria-label*="dark"]').first();
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'E:/hao_agent/help_node/screenshot-dark.png', fullPage: true });
    console.log('Screenshot 3: Dark mode saved');
  }

  await browser.close();
  console.log('Done! Screenshots saved.');
})();
