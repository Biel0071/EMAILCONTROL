#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverBundle = path.join(rootDir, 'dist-server', 'index.cjs');

console.log('============================================================');
console.log('  🚀 IUS EMAIL CONTROL — INICIALIZADOR DO SISTEMA');
console.log('============================================================\n');

// 1. Check if production build exists; if not, build automatically
if (!fs.existsSync(distDir) || !fs.existsSync(serverBundle)) {
  console.log('[Sistema] Build de produção não encontrado. Compilando automaticamente...');
  try {
    execSync('npm run build:all', { cwd: rootDir, stdio: 'inherit' });
    console.log('[Sistema] Compilação concluída com sucesso!\n');
  } catch (err) {
    console.error('[ERRO] Falha ao compilar o sistema:', err.message);
    process.exit(1);
  }
}

// 2. Open browser if requested (--open or npm run online)
const shouldOpen = process.argv.includes('--open') || process.env.OPEN_BROWSER === 'true';
const port = process.env.PORT || '1000';
const url = `http://localhost:${port}`;

if (shouldOpen) {
  setTimeout(() => {
    console.log(`[Sistema] Abrindo navegador em: ${url}`);
    const openCmd = process.platform === 'win32'
      ? `start ${url}`
      : process.platform === 'darwin'
      ? `open ${url}`
      : `xdg-open ${url}`;
    exec(openCmd, (err) => {
      if (err) console.log(`[Dica] Acesse no navegador: ${url}`);
    });
  }, 1200);
}

console.log(`[Sistema] Servidor online e escutando na porta ${port}...`);
console.log(`[Sistema] Painel Web disponível em: ${url}\n`);

// 3. Start server
require(serverBundle);
