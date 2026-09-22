import fs from 'fs';
import { CONFIG } from './config.ts';
import { authService } from './auth.ts';
import { gmailClient, cleanHtmlToText } from './gmailClient.ts';
import { complianceEngine } from './complianceEngine.ts';
import { MOCK_EMAILS, MOCK_SYNC_STATE } from '../src/data/mockData.ts';
import type { EmailItem, SyncProgressState } from '../src/types/index.ts';

class SyncEngine {
  private currentState: SyncProgressState = {
    step: 1,
    percent: 0,
    processedEmails: 0,
    totalEmails: 0,
    threadsCount: 0,
    sendersCount: 0,
    analyzedCount: 0,
    categoriesCount: { clientes: 0, financeiro: 0, fornecedores: 0, legislacao: 0 },
    prioritiesCount: { urgentes: 0, alta: 0, pendentes: 0, aguardando: 0 },
    status: 'idle',
    currentActivity: 'Pronto para sincronizar',
  };
  private isSyncing = false;
  private cachedEmails: EmailItem[] = [];

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      if (process.env.VITEST === 'true') {
        this.cachedEmails = [...MOCK_EMAILS];
        this.currentState = { ...MOCK_SYNC_STATE };
        return;
      }
      if (fs.existsSync(CONFIG.CACHE_FILE)) {
        const raw = fs.readFileSync(CONFIG.CACHE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedEmails = parsed.map(e => {
            const hasCssJunk = !e.body || e.body.trim().length === 0 || e.body.startsWith('/*') || e.body.startsWith('#outlook') || e.body.startsWith('@media') || e.body.startsWith('<');
            const sanitizedBody = hasCssJunk && e.bodyHtml ? cleanHtmlToText(e.bodyHtml) : (e.body ? e.body.trim() : (e.bodyHtml ? cleanHtmlToText(e.bodyHtml) : ''));
            const complianceAnalysis = complianceEngine.evaluate({
              subject: e.subject,
              body: sanitizedBody,
              snippet: e.snippet,
              fromName: e.fromName,
              fromEmail: e.fromEmail,
            });
            return {
              ...e,
              body: sanitizedBody,
              insight: {
                ...e.insight,
                complianceAnalysis,
              },
            };
          });
          this.saveCache();
          const threads = new Set(this.cachedEmails.map(e => e.threadId));
          const senders = new Set(this.cachedEmails.map(e => e.fromEmail));
          const catCount = { clientes: 0, financeiro: 0, fornecedores: 0, legislacao: 0 };
          const prioCount = { urgentes: 0, alta: 0, pendentes: 0, aguardando: 0 };
          for (const e of this.cachedEmails) {
            if (e.category && catCount[e.category] !== undefined) catCount[e.category]++;
            if (e.priority === 'p1') prioCount.urgentes++;
            else if (e.priority === 'p2') prioCount.alta++;
            else if (e.priority === 'p3') prioCount.pendentes++;
            else if (e.priority === 'p4') prioCount.aguardando++;
          }
          this.currentState = {
            step: 7,
            percent: 100,
            processedEmails: this.cachedEmails.length,
            totalEmails: this.cachedEmails.length,
            threadsCount: threads.size,
            sendersCount: senders.size,
            analyzedCount: this.cachedEmails.length,
            categoriesCount: catCount,
            prioritiesCount: prioCount,
            status: 'completed',
            currentActivity: 'Sincronização concluída com sucesso',
            estimatedRemainingTime: 'Concluído',
          };
          return;
        }
      }
      if (authService.getMode() === 'live') {
        this.cachedEmails = [];
      } else {
        this.cachedEmails = [...MOCK_EMAILS];
      }
    } catch {
      this.cachedEmails = [];
    }
  }

  private saveCache() {
    if (process.env.VITEST === 'true') return;
    try {
      fs.writeFileSync(CONFIG.CACHE_FILE, JSON.stringify(this.cachedEmails, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving email cache:', err);
    }
  }

  public getEmails(): EmailItem[] {
    if (process.env.VITEST === 'true') {
      return this.cachedEmails;
    }
    const isLive = authService.getMode() === 'live';
    if (isLive) {
      // In live mode, strictly return cached real emails. Never silently fall back to MOCK_EMAILS.
      return this.cachedEmails;
    }
    return this.cachedEmails.length > 0 ? this.cachedEmails : MOCK_EMAILS;
  }

  public getEmailById(id: string): EmailItem | undefined {
    return this.cachedEmails.find(e => e.id === id);
  }


  public updateEmail(id: string, updates: Partial<EmailItem>): EmailItem | undefined {
    const idx = this.cachedEmails.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.cachedEmails[idx] = { ...this.cachedEmails[idx], ...updates };
      this.saveCache();
      return this.cachedEmails[idx];
    }
    return undefined;
  }

  public deleteEmail(id: string): boolean {
    const idx = this.cachedEmails.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.cachedEmails.splice(idx, 1);
      this.saveCache();
      return true;
    }
    return false;
  }

  public addEmail(email: EmailItem): void {
    this.cachedEmails.unshift(email);
    this.saveCache();
  }

  public resetCache(): void {
    if (process.env.VITEST === 'true') {
      this.cachedEmails = [...MOCK_EMAILS];
      return;
    }
    if (fs.existsSync(CONFIG.CACHE_FILE)) {
      try {
        fs.unlinkSync(CONFIG.CACHE_FILE);
      } catch (err) {
        console.error('Error removing cache file:', err);
      }
    }
    if (authService.getMode() === 'live') {
      this.cachedEmails = [];
    } else {
      this.cachedEmails = [...MOCK_EMAILS];
    }
  }

  public getCounts() {
    const emails = this.getEmails();
    return {
      inbox: emails.length,
      important: emails.filter(e => e.isStarred || e.priority === 'p1' || e.priority === 'p2').length,
      urgent: emails.filter(e => e.priority === 'p1').length,
      pending: emails.filter(e => e.actionRequired).length,
      waiting: emails.filter(e => e.actionLabel?.toLowerCase().includes('aguardando') || e.statusLabel?.toLowerCase().includes('resposta')).length,
      clientes: emails.filter(e => e.category === 'clientes').length,
      financeiro: emails.filter(e => e.category === 'financeiro').length,
      fornecedores: emails.filter(e => e.category === 'fornecedores').length,
      legislacao: emails.filter(e => e.category === 'legislacao').length,
      // Diretrizes IUS Natura
      iusAplicavel: emails.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'APLICAVEL').length,
      iusExclusao: emails.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'CAL_EXCLUSAO').length,
      iusMA: emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('MA')).length,
      iusSSO: emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('SSO')).length,
      iusSI: emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('SI')).length,
      iusTRAB: emails.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('TRAB')).length,
    };
  }

  public getStatus(): SyncProgressState & { isMock: boolean } {
    return {
      ...this.currentState,
      isMock: authService.getMode() === 'mock',
    };
  }

  public async startSync(): Promise<SyncProgressState> {
    if (this.isSyncing) {
      return this.currentState;
    }

    const mode = authService.getMode();

    if (mode === 'live') {
      // Launch background async sync smoothly
      this.runLiveSync().catch((err) => {
        console.error('Unhandled error in runLiveSync:', err);
      });
      return this.currentState;
    } else {
      this.runMockSync().catch((err) => {
        console.error('Unhandled error in runMockSync:', err);
      });
      return this.currentState;
    }
  }

  private async runLiveSync(): Promise<SyncProgressState> {
    this.isSyncing = true;
    this.currentState = {
      step: 1,
      percent: 5,
      processedEmails: 0,
      totalEmails: 0,
      threadsCount: 0,
      sendersCount: 0,
      analyzedCount: 0,
      categoriesCount: { clientes: 0, financeiro: 0, fornecedores: 0, legislacao: 0 },
      prioritiesCount: { urgentes: 0, alta: 0, pendentes: 0, aguardando: 0 },
      status: 'syncing',
      currentActivity: 'Conectando ao Gmail API...',
      estimatedRemainingTime: 'Calculando...',
    };

    try {
      // Step 1: Conectado ao Gmail API (0% -> 15%)
      const profile = await gmailClient.getProfile();
      const totalMessages = profile.messagesTotal || 0;

      this.currentState = {
        ...this.currentState,
        step: 1,
        percent: 15,
        totalEmails: totalMessages,
        currentActivity: `Autenticado com sucesso (${profile.emailAddress || 'Gmail'}). Conectando à caixa de entrada...`,
        estimatedRemainingTime: '~15 segundos',
      };

      await new Promise(r => setTimeout(r, 400));

      // Step 2: E-mails encontrados na caixa de entrada (30%)
      const listData = await gmailClient.listMessages({ maxResults: 30 });
      const messageRefs = listData.messages || [];
      const batchCount = messageRefs.length;

      this.currentState = {
        ...this.currentState,
        step: 2,
        percent: 30,
        totalEmails: batchCount,
        currentActivity: `Detectando mensagens (${batchCount} para sincronização prioritária de ${totalMessages.toLocaleString('pt-BR')} no Gmail)...`,
      };

      await new Promise(r => setTimeout(r, 400));

      // Step 3: Conversas identificadas e agrupadas (45%)
      this.currentState = {
        ...this.currentState,
        step: 3,
        percent: 45,
        currentActivity: 'Identificando tópicos e agrupando conversas em threads...',
      };

      await new Promise(r => setTimeout(r, 400));

      // Step 4: Remetentes mapeados (60%)
      this.currentState = {
        ...this.currentState,
        step: 4,
        percent: 60,
        currentActivity: 'Mapeando remetentes, empresas e domínios de contato...',
      };

      await new Promise(r => setTimeout(r, 400));

      // Step 5: Analisando conteúdo e contexto com IA (60% -> 90%)
      this.currentState = {
        ...this.currentState,
        step: 5,
        percent: 60,
        currentActivity: 'Analisando mensagens com IA e identificando o que realmente importa...',
      };

      const threadsSet = new Set<string>();
      const sendersSet = new Set<string>();
      const items: EmailItem[] = [];
      let processed = 0;

      for (const ref of messageRefs) {
        if (!ref.id) continue;
        try {
          const item = await gmailClient.getMessage(ref.id);
          items.push(item);
          if (item.threadId) threadsSet.add(item.threadId);
          if (item.fromEmail) sendersSet.add(item.fromEmail);
          processed++;

          // Update counts
          if (item.category === 'clientes') this.currentState.categoriesCount.clientes++;
          else if (item.category === 'financeiro') this.currentState.categoriesCount.financeiro++;
          else if (item.category === 'fornecedores') this.currentState.categoriesCount.fornecedores++;
          else if (item.category === 'legislacao') this.currentState.categoriesCount.legislacao++;

          if (item.priority === 'p1') this.currentState.prioritiesCount.urgentes++;
          else if (item.priority === 'p2') this.currentState.prioritiesCount.alta++;
          else if (item.priority === 'p3') this.currentState.prioritiesCount.pendentes++;
          else if (item.priority === 'p4') this.currentState.prioritiesCount.aguardando++;
          else if (item.actionLabel?.toLowerCase().includes('aguardando') || item.statusLabel?.toLowerCase().includes('resposta')) {
            this.currentState.prioritiesCount.aguardando++;
          }

          const pct = Math.min(90, Math.round(60 + (processed / Math.max(1, messageRefs.length)) * 30));
          this.currentState.percent = pct;
          this.currentState.processedEmails = processed;
          this.currentState.threadsCount = threadsSet.size;
          this.currentState.sendersCount = sendersSet.size;
          this.currentState.analyzedCount = processed;
          this.currentState.currentActivity = `Analisando ${processed}/${messageRefs.length}: "${item.subject.slice(0, 36)}..."`;
        } catch (e) {
          console.error(`Error processing msg ${ref.id}:`, e);
        }
      }

      // Step 6: Classificando prioridades operacionais (95%)
      this.currentState = {
        ...this.currentState,
        step: 6,
        percent: 95,
        currentActivity: 'Estruturando categorização oficial e ações prioritárias...',
      };

      await new Promise(r => setTimeout(r, 400));

      // Step 7: Identificando ações e prazos concluído (100%)
      this.currentState = {
        ...this.currentState,
        step: 7,
        percent: 100,
        status: 'completed',
        currentActivity: `Sincronização concluída com sucesso! ${items.length} e-mails processados.`,
        estimatedRemainingTime: 'Concluído',
      };

      this.cachedEmails = items;
      this.saveCache();
    } catch (err: any) {
      console.error('Error in runLiveSync:', err);
      let errorType: 'api_not_enabled' | 'auth_expired' | 'rate_limit' | 'generic' = 'generic';
      let activationUrl: string | undefined = undefined;

      const errMsg = err.message || '';
      if (errMsg.includes('has not been used in project') || errMsg.includes('is disabled')) {
        errorType = 'api_not_enabled';
        const urlMatch = errMsg.match(/https:\/\/[^\s]+/);
        activationUrl = urlMatch ? urlMatch[0] : 'https://console.developers.google.com/apis/api/gmail.googleapis.com/overview';
      } else if (errMsg.includes('invalid_grant') || errMsg.includes('Token has been expired') || err.code === 401) {
        errorType = 'auth_expired';
      } else if (err.code === 429 || errMsg.includes('rate limit') || errMsg.includes('quota')) {
        errorType = 'rate_limit';
      }

      this.currentState = {
        ...this.currentState,
        status: 'error',
        errorMessage: errMsg || 'Falha ao sincronizar com o Gmail',
        errorType,
        activationUrl,
      };
    } finally {
      this.isSyncing = false;
    }

    return this.currentState;
  }

  private async runMockSync(): Promise<SyncProgressState> {
    this.isSyncing = true;
    this.currentState = {
      step: 1,
      percent: 15,
      processedEmails: 1200,
      totalEmails: 10742,
      threadsCount: 310,
      sendersCount: 220,
      analyzedCount: 150,
      categoriesCount: { clientes: 350, financeiro: 280, fornecedores: 190, legislacao: 140 },
      prioritiesCount: { urgentes: 5, alta: 22, pendentes: 45, aguardando: 30 },
      status: 'syncing',
      currentActivity: 'Conectado ao Gmail (Modo Demonstração)',
      estimatedRemainingTime: '~10 segundos',
    };

    const steps = [
      { step: 2, percent: 30, processed: 3800, act: 'E-mails encontrados na caixa de entrada' },
      { step: 3, percent: 45, processed: 6100, act: 'Conversas identificadas e agrupadas' },
      { step: 4, percent: 60, processed: 7500, act: 'Remetentes e empresas mapeadas' },
      { step: 5, percent: 78, processed: 8421, act: 'Analisando conteúdo e contexto com IA' },
      { step: 6, percent: 92, processed: 9900, act: 'Classificando prioridades operacionais' },
      { step: 7, percent: 100, processed: 10742, act: 'Identificando ações e prazos concluído' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        const s = steps[i];
        this.currentState = {
          ...this.currentState,
          step: s.step,
          percent: s.percent,
          processedEmails: s.processed,
          currentActivity: s.act,
          status: s.step === 7 ? 'completed' : 'syncing',
          estimatedRemainingTime: s.step === 7 ? 'Concluído' : '~5 segundos',
        };
        i++;
      } else {
        clearInterval(interval);
        this.isSyncing = false;
      }
    }, 800);

    return this.currentState;
  }
}

export const syncEngine = new SyncEngine();
