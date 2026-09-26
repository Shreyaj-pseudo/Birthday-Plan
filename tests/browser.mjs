import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

async function assertPlayableVideo(page, filename) {
  const video = page.locator('video');
  await video.waitFor();
  await page.waitForFunction(expected => {
    const element = document.querySelector('video');
    return element?.currentSrc.endsWith(expected) && (element.readyState >= 1 || element.error);
  }, filename);
  const media = await video.evaluate(element => ({ duration: element.duration, error: element.error?.code ?? null }));
  assert.equal(media.error, null, `${filename} must be readable by Chrome`);
  assert.ok(Number.isFinite(media.duration) && media.duration > 0, `${filename} must contain playable video`);
}

await mkdir('.artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('data:')) external.push(request.url());
  });
  await page.goto('http://127.0.0.1:4173');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '.artifacts/landing-laptop.png', fullPage: true });
  await page.getByRole('button', { name: 'Watch my message' }).click();
  await page.getByRole('dialog', { name: 'A few words from me.' }).waitFor();
  await page.screenshot({ path: '.artifacts/opening-message.png', fullPage: true });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Explore your cake' }).click();
  await page.locator('.scene-curtain').waitFor({ state: 'hidden' });
  await page.locator('canvas').waitFor();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: '.artifacts/cake-laptop.png', fullPage: true });
  const canvas = await page.locator('canvas').boundingBox();
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width / 2 + 110, canvas.y + canvas.height / 2, { steps: 10 });
  await page.mouse.up();
  assert.equal(await page.getByRole('dialog').count(), 0, 'Dragging must not select a slice');
  await page.mouse.click(canvas.x + canvas.width / 2 + 70, canvas.y + canvas.height / 2);
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(600);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.story-panel')).transform === 'none');
  const panelBox = await page.locator('.story-panel').boundingBox();
  assert.equal(Math.round(panelBox.x + panelBox.width), 1440, 'Video drawer must finish fully onscreen');
  await page.screenshot({ path: '.artifacts/selected-laptop.png', fullPage: true });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Red velvet/ }).click();
  assert.equal(await page.getByRole('heading', { name: 'Red velvet' }).count(), 1);
  await assertPlayableVideo(page, 'red-velvet-diya.mp4');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.textContent?.includes('Red velvet'));
  await page.getByRole('button', { name: /Hazelnut chocolate/ }).click();
  assert.equal(await page.getByRole('heading', { name: 'Hazelnut chocolate' }).count(), 1);
  await assertPlayableVideo(page, 'hazelnut-chocolate-archana.mp4');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Mango passion/ }).click();
  await assertPlayableVideo(page, 'mango-passion-paawni.mp4');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Brownie chocolate/ }).click();
  await assertPlayableVideo(page, 'brownie-chocolate-manaswini.mp4');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({ path: '.artifacts/cake-small-laptop.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal overflow on laptop');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.scene').evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText('This birthday experience is made for a laptop screen.').waitFor();
  await page.screenshot({ path: '.artifacts/laptop-only-message.png', fullPage: true });
  assert.deepEqual(errors, []);
  assert.deepEqual(external, [], 'All runtime assets must be local');

  const fallback = await context.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (type.includes('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto('http://127.0.0.1:4173');
  await fallback.getByRole('button', { name: 'Explore your cake' }).click();
  await fallback.locator('.scene-curtain').waitFor({ state: 'hidden' });
  await fallback.getByText('Your cake is waiting.').waitFor();
  await fallback.getByRole('button', { name: /Hazelnut chocolate/ }).click();
  await fallback.getByRole('heading', { name: 'Hazelnut chocolate' }).waitFor();
  console.log('Browser checks passed: laptop landing, video, 3D click and drag, keyboard, reduced motion, fallback, local assets.');
} finally { await browser.close(); }
