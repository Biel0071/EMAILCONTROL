import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\435ca6e4-b577-4b5a-9515-a2e90f9d2993';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function run() {
  console.log('Launching browser with executable:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  const screens = [
    {
      name: '01_central_emails_dark.png',
      url: 'http://127.0.0.1:1000/?screen=inbox&theme=dark',
      wait: 2500,
      title: 'Central de E-mail — Dark Mode (Visual Executivo & Diretrizes IUS)'
    },
    {
      name: '02_central_emails_white.png',
      url: 'http://127.0.0.1:1000/?screen=inbox&theme=light',
      wait: 2500,
      title: 'Central de E-mail — White Mode (Claro Executivo)'
    },
    {
      name: '03_conexao_google_dark.png',
      url: 'http://127.0.0.1:1000/?screen=connect&theme=dark',
      wait: 1500,
      title: 'Tela de Conexão Google — Dark Mode'
    },
    {
      name: '04_conexao_google_white.png',
      url: 'http://127.0.0.1:1000/?screen=connect&theme=light',
      wait: 1500,
      title: 'Tela de Conexão Google — White Mode'
    },
    {
      name: '05_sincronizacao_dark.png',
      url: 'http://127.0.0.1:1000/?screen=sync&theme=dark',
      wait: 1500,
      title: 'Tela de Sincronização Inteligente — Dark Mode'
    },
    {
      name: '06_sincronizacao_white.png',
      url: 'http://127.0.0.1:1000/?screen=sync&theme=light',
      wait: 1500,
      title: 'Tela de Sincronização Inteligente — White Mode'
    }
  ];

  for (const s of screens) {
    console.log(`Navigating to ${s.title}...`);
    await page.goto(s.url, { waitUntil: 'networkidle0', timeout: 30000 });
    if (s.wait) {
      await new Promise(r => setTimeout(r, s.wait));
    }
    const outputPath = path.join(ARTIFACT_DIR, s.name);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Saved screenshot: ${outputPath}`);
  }

  // Also capture a detailed view of an email with Modo Leitura
  console.log('Navigating to email reader clean mode...');
  await page.goto('http://127.0.0.1:1000/?screen=inbox&theme=dark', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on Modo Leitura if available
  try {
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Modo Leitura')) {
        await b.click();
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }
    const cleanModePath = path.join(ARTIFACT_DIR, '07_leitor_modo_leitura_dark.png');
    await page.screenshot({ path: cleanModePath, fullPage: false });
    console.log(`Saved clean mode screenshot: ${cleanModePath}`);
  } catch (err) {
    console.warn('Could not click clean mode button:', err);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
