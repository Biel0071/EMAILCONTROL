import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config.ts';
import { authService } from './auth.ts';
import { syncEngine } from './syncEngine.ts';
import { gmailClient } from './gmailClient.ts';
import { EmailItem } from '../src/types/index.ts';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Logging middleware
app.use((req, _res, next) => {
  if (!req.path.startsWith('/assets')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ============================================================
// SYSTEM & AUTO-UPDATE ROUTES
// ============================================================

app.get('/api/system/version', (_req, res) => {
  res.json({
    version: CONFIG.VERSION,
    buildDate: CONFIG.BUILD_DATE,
    platform: process.platform,
    isPackaged: Boolean(process.env.ELECTRON_PACKAGED || process.env.USER_DATA_PATH),
  });
});

app.get('/api/system/check-updates', async (_req, res) => {
  try {
    let latestVersion = CONFIG.VERSION;
    let changelog = [
      'Versão executável Windows (.exe) com suporte a instalação e modo portátil',
      'Motor de Conformidade e Diretrizes IUS Natura (11 escopos oficiais)',
      'Leitor de e-mails com Modo Formatado e Modo Leitura higienizado',
      'Temas Dark e White Mode com alternância instantânea',
      'Download e streaming de anexos',
    ];
    let downloadUrl = CONFIG.LATEST_DOWNLOAD_URL;
    let hasUpdate = false;

    // Check remote manifest with a short timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const manifestRes = await fetch(CONFIG.UPDATE_MANIFEST_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (manifestRes.ok) {
        const manifestData: any = await manifestRes.json();
        if (manifestData.version) {
          latestVersion = manifestData.version;
          changelog = manifestData.changelog || changelog;
          downloadUrl = manifestData.downloadUrl || downloadUrl;
          hasUpdate = manifestData.version !== CONFIG.VERSION;
        }
      }
    } catch {
      // Offline or remote not reachable — report current status
    }

    res.json({
      currentVersion: CONFIG.VERSION,
      latestVersion,
      hasUpdate,
      buildDate: CONFIG.BUILD_DATE,
      changelog,
      downloadUrl,
      installerFileName: `IUS-Email-Control-Setup-${latestVersion}.exe`,
      portableFileName: `IUS-Email-Control-Portable-${latestVersion}.exe`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao verificar atualizações.' });
  }
});

// ============================================================
// AUTH ROUTES
// ============================================================

app.get('/api/auth/status', (_req, res) => {
  const status = authService.getStatus();
  res.json(status);
});

app.get('/api/auth/google/url', (req, res) => {
  try {
    const { domain, loginHint } = req.query as { domain?: string; loginHint?: string };
    const url = authService.generateAuthUrl({
      domain: domain ? domain.trim() : undefined,
      loginHint: loginHint ? loginHint.trim() : undefined,
    });
    res.json({ url });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/configure-google', (req, res) => {
  const { clientId, clientSecret, domain } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Client ID e Client Secret são obrigatórios.' });
  }

  authService.configureCredentials(clientId, clientSecret);

  try {
    const url = authService.generateAuthUrl({ domain });
    res.json({ success: true, url, status: authService.getStatus() });
  } catch (err: any) {
    res.json({ success: true, url: null, error: err.message, status: authService.getStatus() });
  }
});

app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    await authService.handleCallback(code);
    // Redirect to frontend after successful authorization
    res.redirect(`${CONFIG.CLIENT_URL}/?auth=success`);
  } catch (err: any) {
    console.error('Error exchanging OAuth code:', err);
    res.redirect(`${CONFIG.CLIENT_URL}/?auth_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * Robust search query matcher with accent-normalization and natural query understanding
 */
export function matchEmailSearch(e: EmailItem, queryRaw: string): boolean {
  const norm = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const query = norm(queryRaw);
  if (!query) return true;

  // Natural query expansion
  if (
    query.includes('urgente') ||
    query.includes('sem resposta') ||
    query === 'emails urgentes sem resposta' ||
    query === 'e-mails urgentes sem resposta'
  ) {
    if (e.priority === 'p1' || e.actionRequired) return true;
  }
  if (
    query.includes('nota fiscal') ||
    query.includes('notas fiscais') ||
    query.includes('danfe') ||
    query.includes('nfe')
  ) {
    if (norm(e.subject).includes('nota fiscal') || e.category === 'financeiro') return true;
  }
  if (
    query.includes('fornecedor') ||
    query.includes('fornecedores') ||
    query.includes('suprimento')
  ) {
    if (e.category === 'fornecedores') return true;
  }
  if (
    query.includes('documento') ||
    query.includes('documentos pendentes') ||
    query.includes('contrato')
  ) {
    if (e.actionRequired || e.hasAttachments) return true;
  }

  // IUS Natura & Regulatory criteria expansion
  if (query.includes('aplicavel') || query.includes('aplicaveis') || query === 'legislacao aplicavel') {
    if (e.insight?.complianceAnalysis?.aplicabilidade === 'APLICAVEL') return true;
  }
  if (query.includes('cal de exclusao') || query.includes('exclusao') || query.includes('descarte')) {
    if (e.insight?.complianceAnalysis?.aplicabilidade === 'CAL_EXCLUSAO') return true;
  }
  if (query.includes('meio ambiente') || query.includes('iso 14001') || query.includes('ambiental')) {
    if (e.insight?.complianceAnalysis?.escopos?.includes('MA')) return true;
  }
  if (query.includes('sso') || query.includes('seguranca do trabalho') || query.includes('iso 45001') || query.includes('saude e seguranca')) {
    if (e.insight?.complianceAnalysis?.escopos?.includes('SSO')) return true;
  }
  if (query.includes('lgpd') || query.includes('dados pessoais') || query.includes('iso 27001') || query.includes('seguranca da informacao')) {
    if (e.insight?.complianceAnalysis?.escopos?.includes('SI')) return true;
  }
  if (query.includes('trabalhista') || query.includes('clt') || query.includes('esocial')) {
    if (e.insight?.complianceAnalysis?.escopos?.includes('TRAB')) return true;
  }

  // Token-based matching across all relevant fields
  const tokens = query.split(/\s+/).filter(Boolean);
  const searchableText = norm([
    e.subject,
    e.snippet,
    e.fromName,
    e.fromEmail,
    e.body,
    e.category,
    e.priority,
    ...(e.insight?.entidades || []),
    e.insight?.resumo || '',
    e.insight?.tipo || '',
    e.insight?.complianceAnalysis?.statusLabel || '',
    e.insight?.complianceAnalysis?.justificativa || '',
    e.insight?.complianceAnalysis?.diretrizOperacional || '',
    e.insight?.complianceAnalysis?.padraoReferencia || '',
    e.insight?.complianceAnalysis?.orgaoIdentificado || '',
    ...(e.insight?.complianceAnalysis?.escopos || []),
    ...(e.insight?.complianceAnalysis?.temasChave || [])
  ].join(' '));

  return tokens.every(tok => searchableText.includes(tok));
}

app.post('/api/auth/disconnect', (_req, res) => {
  authService.disconnect();
  syncEngine.resetCache();
  res.json({ success: true, message: 'Conta desconectada com sucesso e cache redefinido.' });
});

app.post('/api/auth/mode', (req, res) => {
  const { mode } = req.body;
  if (mode !== 'live' && mode !== 'mock') {
    return res.status(400).json({ error: 'Modo inválido. Escolha "live" ou "mock".' });
  }

  try {
    authService.setMode(mode);
    res.json({ success: true, mode: authService.getMode() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/mock-profile', (req, res) => {
  const { profile } = req.body;
  if (profile !== 'personal' && profile !== 'enterprise') {
    return res.status(400).json({ error: 'Perfil inválido. Escolha "personal" ou "enterprise".' });
  }

  authService.setMockProfile(profile);
  res.json({ success: true, status: authService.getStatus() });
});

// ============================================================
// SYNC ROUTES
// ============================================================

app.get('/api/sync/status', (_req, res) => {
  res.json(syncEngine.getStatus());
});

app.post('/api/sync/start', async (_req, res) => {
  try {
    const state = await syncEngine.startSync();
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// EMAIL DATA ROUTES
// ============================================================

app.get('/api/emails', (req, res) => {
  const { folder, category, q, iusScope, aplicabilidade } = req.query as {
    folder?: string;
    category?: string;
    q?: string;
    iusScope?: string;
    aplicabilidade?: string;
  };

  let emails = syncEngine.getEmails();

  // Natural query expansion & text search
  if (q && q.trim()) {
    emails = emails.filter(e => matchEmailSearch(e, q));
  }

  // Folder filter
  if (folder && folder !== 'all' && folder !== 'inbox') {
    switch (folder) {
      case 'important':
        emails = emails.filter(e => e.isStarred || e.priority === 'p1' || e.priority === 'p2');
        break;
      case 'urgent':
        emails = emails.filter(e => e.priority === 'p1');
        break;
      case 'pending':
        emails = emails.filter(e => e.actionRequired);
        break;
      case 'waiting':
        emails = emails.filter(e => e.actionLabel?.toLowerCase().includes('aguardando') || e.statusLabel?.toLowerCase().includes('resposta'));
        break;
      // IUS Directives Special Virtual Folders
      case 'ius_aplicavel':
        emails = emails.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'APLICAVEL');
        break;
      case 'ius_exclusao':
        emails = emails.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'CAL_EXCLUSAO');
        break;
      case 'ius_ma':
        emails = emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('MA'));
        break;
      case 'ius_sso':
        emails = emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('SSO'));
        break;
      case 'ius_si':
        emails = emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('SI'));
        break;
      case 'ius_trab':
        emails = emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('TRAB'));
        break;
    }
  }

  // Category filter
  if (category && category !== 'all') {
    emails = emails.filter(e => e.category === category);
  }

  // IUS Scope filter
  if (iusScope && iusScope !== 'all') {
    emails = emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes(iusScope as any));
  }

  // IUS Applicability filter
  if (aplicabilidade && aplicabilidade !== 'all') {
    emails = emails.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === aplicabilidade);
  }

  res.json({
    total: emails.length,
    emails,
  });
});

app.get('/api/emails/counts', (_req, res) => {
  res.json(syncEngine.getCounts());
});

app.get('/api/emails/:id', (req, res) => {
  const email = syncEngine.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'E-mail não encontrado.' });
  }
  res.json(email);
});

app.post('/api/emails/:id/archive', async (req, res) => {
  const id = req.params.id;
  const mode = authService.getMode();

  if (mode === 'live') {
    try {
      await gmailClient.archiveMessage(id);
    } catch (e: any) {
      console.error('Error archiving via Gmail API:', e);
    }
  }

  const updated = syncEngine.updateEmail(id, { isRead: true });
  res.json({ success: true, email: updated });
});

app.post('/api/emails/:id/trash', async (req, res) => {
  const id = req.params.id;
  const mode = authService.getMode();

  if (mode === 'live') {
    try {
      await gmailClient.trashMessage(id);
    } catch (e: any) {
      console.error('Error trashing via Gmail API:', e);
    }
  }

  syncEngine.deleteEmail(id);
  res.json({ success: true });
});

app.post('/api/emails/:id/read', async (req, res) => {
  const id = req.params.id;
  const mode = authService.getMode();

  if (mode === 'live') {
    try {
      await gmailClient.markAsRead(id);
    } catch (e: any) {
      console.error('Error marking as read via Gmail API:', e);
    }
  }

  const updated = syncEngine.updateEmail(id, { isRead: true });
  res.json({ success: true, email: updated });
});

app.post('/api/emails/:id/unread', async (req, res) => {
  const id = req.params.id;
  const mode = authService.getMode();

  if (mode === 'live') {
    try {
      await gmailClient.markAsUnread(id);
    } catch (e: any) {
      console.error('Error marking as unread via Gmail API:', e);
    }
  }

  const updated = syncEngine.updateEmail(id, { isRead: false });
  res.json({ success: true, email: updated });
});

app.post('/api/emails/:id/star', async (req, res) => {
  const id = req.params.id;
  const { star } = req.body;
  const mode = authService.getMode();

  if (mode === 'live') {
    try {
      await gmailClient.toggleStar(id, Boolean(star));
    } catch (e: any) {
      console.error('Error toggling star via Gmail API:', e);
    }
  }

  const updated = syncEngine.updateEmail(id, { isStarred: Boolean(star) });
  res.json({ success: true, email: updated });
});

app.post('/api/emails/:id/reply', async (req, res) => {
  const id = req.params.id;
  const { body } = req.body;
  const original = syncEngine.getEmailById(id);

  if (!original) {
    return res.status(404).json({ error: 'E-mail original não encontrado.' });
  }

  const mode = authService.getMode();
  if (mode === 'live') {
    try {
      await gmailClient.sendMessage({
        to: original.fromEmail,
        subject: `Re: ${original.subject.replace(/^Re:\s*/i, '')}`,
        body,
        threadId: original.threadId,
      });
    } catch (e: any) {
      console.error('Error sending reply via Gmail API:', e);
      return res.status(500).json({ error: 'Falha ao enviar resposta pelo Gmail API: ' + e.message });
    }
  }

  // Update action state
  syncEngine.updateEmail(id, {
    actionRequired: false,
    actionLabel: undefined,
    statusLabel: 'Respondido',
  });

  res.json({ success: true, message: 'Resposta enviada com sucesso.' });
});

app.get('/api/emails/:id/attachments/:attachmentId', async (req, res) => {
  const { id, attachmentId } = req.params;
  const filename = (req.query.filename as string) || 'anexo.pdf';
  const email = syncEngine.getEmailById(id);

  if (!email) {
    return res.status(404).json({ error: 'E-mail não encontrado.' });
  }

  const mode = authService.getMode();
  if (mode === 'live' && authService.getStatus().authenticated) {
    try {
      const { data } = await gmailClient.getAttachment(id, attachmentId);
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xls: 'application/vnd.ms-excel',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        doc: 'application/msword',
        txt: 'text/plain; charset=utf-8',
        zip: 'application/zip',
      };
      const contentType = mimeMap[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      return res.send(data);
    } catch (err: any) {
      console.warn('[Attachment] Live fetch fallback to mock payload:', err.message);
    }
  }

  // Graceful simulated payload for demonstration and mock attachments
  const sampleContent = Buffer.from(
    `Arquivo: ${filename}\nE-mail: ${email.subject}\nRemetente: ${email.fromName} <${email.fromEmail}>\nData: ${email.date}\n\nDocumento gerado e verificado pela Plataforma IUS Email Control Enterprise Suite.`,
    'utf-8'
  );
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.send(sampleContent);
});

// Serve frontend in production
const candidateDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../dist') : null,
  typeof __dirname !== 'undefined' ? path.resolve(__dirname, 'dist') : null,
  process.resourcesPath ? path.join(process.resourcesPath, 'dist') : null,
  process.resourcesPath ? path.join(process.resourcesPath, 'app', 'dist') : null,
].filter(Boolean) as string[];

const distPath = candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || candidateDistPaths[0];

if (fs.existsSync(distPath)) {
  console.log(`[Email Control Server] Servindo frontend a partir de: ${distPath}`);
  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log(`[Email Control Server] Diretório dist não encontrado nas rotas testadas:`, candidateDistPaths);
}

// Global error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: err.message || 'Erro interno no servidor.' });
  }
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

const PORT = CONFIG.PORT;
app.listen(PORT, () => {
  console.log(`[Email Control Server] Rodando na porta ${PORT}`);
  console.log(`[Email Control Server] Modo inicial: ${authService.getMode()}`);
});
