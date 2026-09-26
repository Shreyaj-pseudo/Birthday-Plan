// Encode the generated photographs for local delivery without changing their composition.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Asterisk } from '@phosphor-icons/react';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  for (const [source, destination] of [
    ['assets/source-images/cake-top.png', 'public/images/cake-top.webp'],
    ['assets/source-images/cake-sides.png', 'public/images/cake-sides.webp'],
    ['assets/source-images/candlelit-table.png', 'public/images/candlelit-table.webp'],
    ['assets/source-images/cake-stage.png', 'public/images/cake-stage.webp'],
  ]) {
    const bytes = await readFile(source);
    const encoded = await page.evaluate(async data => {
      const image = new Image();
      image.src = data;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      return canvas.toDataURL('image/webp', .9).split(',')[1];
    }, `data:image/png;base64,${bytes.toString('base64')}`);
    await writeFile(destination, Buffer.from(encoded, 'base64'));
  }
  await writeFile('public/favicon.svg', renderToStaticMarkup(createElement(Asterisk, { size: 32, color: '#344c98', weight: 'light' })));
  console.log('Local photos encoded as WebP; Phosphor favicon saved.');
} finally { await browser.close(); }
