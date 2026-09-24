import React, { useState, useEffect, useCallback } from 'react';
import { GoogleConnect } from './components/GoogleConnect';
import { SyncProgress } from './components/SyncProgress';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { InboxList } from './components/InboxList';
import { EmailReader } from './components/EmailReader';
import { ResizablePane } from './components/ResizablePane';
import { SettingsModal } from './components/SettingsModal';
import { MOCK_EMAILS, MOCK_SYNC_STATE } from './data/mockData';
import { 
  EmailItem, 
  SyncProgressState, 
  AuthStatus, 
  FilterFolder, 
  EmailCategory, 
  AppScreen 
} from './types';

const INITIAL_SYNC_STATE: SyncProgressState = {
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

export const App: React.FC = () => {
  // Navigation & Screen states
  const [screen, setScreen] = useState<AppScreen>(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('screen') as AppScreen;
      if (p === 'connect' || p === 'sync' || p === 'inbox') return p;
    } catch {}
    return 'connect';
  });
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [syncState, setSyncState] = useState<SyncProgressState>(INITIAL_SYNC_STATE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Email filtering and selection
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FilterFolder>('inbox');
  const [currentCategory, setCurrentCategory] = useState<EmailCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [folderCounts, setFolderCounts] = useState<{
    inbox: number;
    important: number;
    urgent: number;
    pending: number;
    waiting: number;
    clientes: number;
    financeiro: number;
    fornecedores: number;
    legislacao: number;
    iusAplicavel?: number;
    iusExclusao?: number;
    iusMA?: number;
    iusSSO?: number;
    iusSI?: number;
    iusTRAB?: number;
  }>({
    inbox: 0,
    important: 0,
    urgent: 0,
    pending: 0,
    waiting: 0,
    clientes: 0,
    financeiro: 0,
    fornecedores: 0,
    legislacao: 0,
    iusAplicavel: 0,
    iusExclusao: 0,
    iusMA: 0,
    iusSSO: 0,
    iusSI: 0,
    iusTRAB: 0,
  });

  // Helper: compute folder and category counts from mock data
  const getMockCounts = useCallback(() => ({
    inbox: MOCK_EMAILS.length,
    important: MOCK_EMAILS.filter(e => e.isStarred || e.priority === 'p1' || e.priority === 'p2').length,
    urgent: MOCK_EMAILS.filter(e => e.priority === 'p1').length,
    pending: MOCK_EMAILS.filter(e => e.actionRequired).length,
    waiting: MOCK_EMAILS.filter(e => e.actionLabel?.includes('Aguardando') || e.statusLabel?.includes('resposta')).length,
    clientes: MOCK_EMAILS.filter(e => e.category === 'clientes').length,
    financeiro: MOCK_EMAILS.filter(e => e.category === 'financeiro').length,
    fornecedores: MOCK_EMAILS.filter(e => e.category === 'fornecedores').length,
    legislacao: MOCK_EMAILS.filter(e => e.category === 'legislacao').length,
    iusAplicavel: MOCK_EMAILS.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'APLICAVEL').length,
    iusExclusao: MOCK_EMAILS.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'CAL_EXCLUSAO').length,
    iusMA: MOCK_EMAILS.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('MA')).length,
    iusSSO: MOCK_EMAILS.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('SSO')).length,
    iusSI: MOCK_EMAILS.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('SI')).length,
    iusTRAB: MOCK_EMAILS.filter(e => e.insight?.complianceAnalysis?.escopos?.includes('TRAB')).length,
  }), []);

  // Fetch counts across entire inbox
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/emails/counts');
      if (res.ok) {
        const data = await res.json();
        setFolderCounts(data);
        return;
      }
    } catch {
      // ignore
    }
    setFolderCounts(getMockCounts());
  }, [getMockCounts]);

  // 1. Check initial Auth status & sync status
  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data: AuthStatus = await res.json();
        setAuthStatus(data);
        if (data.authenticated) {
          const p = new URLSearchParams(window.location.search).get('screen');
          if (!p) {
            setScreen('inbox');
          }
        }
      }

      // Also retrieve actual sync status from server
      const syncRes = await fetch('/api/sync/status');
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setSyncState(syncData);
        if (syncData.status === 'syncing') {
          setIsSyncing(true);
        }
      }
    } catch {
      // Offline / dev fallback
      setAuthStatus({
        authenticated: false,
        hasGoogleCredentials: false,
        mode: 'mock',
      });
    }
  }, []);

  useEffect(() => {
    // Check if redirect returned from Google OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchAuthStatus().then(() => {
        setScreen('sync');
        startSyncProcess();
      });
      return;
    }

    fetchAuthStatus();
  }, [fetchAuthStatus]);

  // Auto-refresh auth status whenever user focuses back to the app window (e.g. after OAuth in browser)
  useEffect(() => {
    const handleFocus = () => {
      fetchAuthStatus();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchAuthStatus]);

  // 2. Fetch Emails from API
  const fetchEmails = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (currentFolder !== 'inbox') params.set('folder', currentFolder);
      if (currentCategory !== 'all') params.set('category', currentCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/emails?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list: EmailItem[] = data.emails || [];
        setEmails(list);
        if (list.length > 0) {
          setSelectedEmailId(prev => (prev && list.some(e => e.id === prev) ? prev : list[0].id));
        } else {
          setSelectedEmailId(null);
        }
      }
      fetchCounts();
    } catch {
      // Filter mock emails locally if in mock mode or backend is offline (e.g. GitHub Pages)
      let filtered = [...MOCK_EMAILS];

        // Folder filters
        if (currentFolder === 'important') {
          filtered = filtered.filter(e => e.isStarred || e.priority === 'p1' || e.priority === 'p2');
        } else if (currentFolder === 'urgent') {
          filtered = filtered.filter(e => e.priority === 'p1');
        } else if (currentFolder === 'pending') {
          filtered = filtered.filter(e => e.actionRequired);
        } else if (currentFolder === 'waiting') {
          filtered = filtered.filter(e => e.actionLabel?.includes('Aguardando') || e.statusLabel?.includes('resposta'));
        }

        if (currentCategory !== 'all') {
          filtered = filtered.filter(e => e.category === currentCategory);
        }

        if (searchQuery.trim()) {
          const qNorm = searchQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
          if (qNorm.includes('urgente') || qNorm.includes('sem resposta') || qNorm === 'emails urgentes sem resposta' || qNorm === 'e-mails urgentes sem resposta') {
            filtered = filtered.filter(e => e.priority === 'p1' || e.actionRequired);
          } else if (qNorm.includes('nota fiscal') || qNorm.includes('notas fiscais') || qNorm.includes('danfe')) {
            filtered = filtered.filter(e => e.subject.toLowerCase().includes('nota fiscal') || e.category === 'financeiro');
          } else if (qNorm.includes('fornecedor')) {
            filtered = filtered.filter(e => e.category === 'fornecedores');
          } else if (qNorm.includes('documento')) {
            filtered = filtered.filter(e => e.actionRequired || e.hasAttachments);
          } else {
            filtered = filtered.filter(e =>
              e.subject.toLowerCase().includes(qNorm) ||
              e.body.toLowerCase().includes(qNorm) ||
              e.fromName.toLowerCase().includes(qNorm)
            );
          }
        }
        setEmails(filtered);
        if (filtered.length > 0) {
          setSelectedEmailId(prev => (prev && filtered.some(e => e.id === prev) ? prev : filtered[0].id));
        } else {
          setSelectedEmailId(null);
        }
    }
  }, [currentFolder, currentCategory, searchQuery, fetchCounts]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Client-side animated synchronization progression for static hosting (GitHub Pages)
  const startClientSideSync = useCallback(() => {
    setIsSyncing(true);
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 18;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setSyncState(prev => ({
          ...prev,
          step: 7,
          percent: 100,
          status: 'completed',
          processedEmails: prev.totalEmails || MOCK_SYNC_STATE.totalEmails,
          analyzedCount: prev.totalEmails || MOCK_SYNC_STATE.analyzedCount,
          currentActivity: 'Sincronização concluída com sucesso',
        }));
        setTimeout(() => {
          setIsSyncing(false);
          setScreen('inbox');
          fetchEmails();
        }, 500);
      } else {
        const step = Math.min(Math.floor((currentProgress / 100) * 7) + 1, 6);
        setSyncState(prev => {
          const total = prev.totalEmails || MOCK_SYNC_STATE.totalEmails;
          return {
            ...prev,
            step,
            percent: currentProgress,
            status: 'syncing',
            totalEmails: total,
            processedEmails: Math.floor((currentProgress / 100) * total),
            analyzedCount: Math.floor((currentProgress / 100) * (prev.analyzedCount || MOCK_SYNC_STATE.analyzedCount)),
            threadsCount: MOCK_SYNC_STATE.threadsCount,
            sendersCount: MOCK_SYNC_STATE.sendersCount,
            categoriesCount: MOCK_SYNC_STATE.categoriesCount,
            prioritiesCount: MOCK_SYNC_STATE.prioritiesCount,
            currentActivity: step <= 2 ? 'Mapeando remetentes e conversas' : step <= 4 ? 'Classificando categorias operacionais' : 'Analisando diretrizes e conformidade IUS',
          };
        });
      }
    }, 280);
  }, [fetchEmails]);

  // 3. Sync Progress Poll
  const startSyncProcess = async () => {
    setIsSyncing(true);
    try {
      const startRes = await fetch('/api/sync/start', { method: 'POST' });
      if (!startRes.ok) throw new Error('offline');
    } catch {
      startClientSideSync();
      return;
    }

    // Polling progress
    const timer = setInterval(async () => {
      try {
        const res = await fetch('/api/sync/status');
        if (res.ok) {
          const data = await res.json();
          setSyncState(data);
          if (data.status === 'completed' || data.status === 'error') {
            setIsSyncing(false);
            clearInterval(timer);
            fetchEmails();
          }
        }
      } catch {
        clearInterval(timer);
        setIsSyncing(false);
      }
    }, 1000);
  };

  // Google Connect action (supports any Gmail and enterprise domain)
  const handleConnectGoogle = async (options?: { domain?: string; accountType?: 'personal' | 'enterprise' }) => {
    setAuthLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.domain) params.set('domain', options.domain);
      const res = await fetch(`/api/auth/google/url?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      // If error from backend, show informative prompt
      const err = await res.json();
      alert(`Aviso: ${err.error || 'Credenciais Google não configuradas.'}\nIniciando em Modo Demonstração (${options?.accountType === 'enterprise' ? 'Empresarial' : 'Gmail Individual'}) para operação.`);
      handleEnterMockMode(options?.accountType);
    } catch (e: any) {
      alert(`Não foi possível conectar ao Google: ${e.message}.\nIniciando em Modo Demonstração Corporativo.`);
      handleEnterMockMode(options?.accountType);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEnterMockMode = async (accountType: 'personal' | 'enterprise' = 'personal') => {
    try {
      const res = await fetch('/api/auth/mock-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: accountType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setAuthStatus(data.status);
          setSyncState(MOCK_SYNC_STATE);
          setScreen('sync');
          startSyncProcess();
          return;
        }
      }
    } catch {
      // static hosting fallback
    }
    setAuthStatus({
      authenticated: true,
      hasGoogleCredentials: false,
      mode: 'mock',
      user: {
        email: accountType === 'enterprise' ? 'empresa@iusnatura.com.br' : 'usuario@gmail.com',
        name: 'IUS Natura Operações',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
    });
    setSyncState(MOCK_SYNC_STATE);
    setScreen('sync');
    startClientSideSync();
  };

  const handleDisconnect = async () => {
    if (confirm('Deseja realmente desconectar a conta do Gmail?')) {
      try {
        await fetch('/api/auth/disconnect', { method: 'POST' });
      } catch {
        // ignore
      }
      setAuthStatus({
        authenticated: false,
        hasGoogleCredentials: Boolean(authStatus?.hasGoogleCredentials),
        mode: 'mock',
      });
      setScreen('connect');
    }
  };

  const handleToggleMode = async (newMode: 'live' | 'mock') => {
    try {
      const res = await fetch('/api/auth/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) {
        fetchAuthStatus();
        fetchEmails();
      } else {
        const err = await res.json();
        alert(err.error || 'Não foi possível alternar modo.');
      }
    } catch (e: any) {
      alert('Erro ao alternar modo: ' + e.message);
    }
  };

  // Email Actions
  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/emails/${id}/archive`, { method: 'POST' });
    } catch {
      // ignore
    }
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmailId === id) {
      const remaining = emails.filter(e => e.id !== id);
      setSelectedEmailId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleTrash = async (id: string) => {
    try {
      await fetch(`/api/emails/${id}/trash`, { method: 'POST' });
    } catch {
      // ignore
    }
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmailId === id) {
      const remaining = emails.filter(e => e.id !== id);
      setSelectedEmailId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      await fetch(`/api/emails/${id}/unread`, { method: 'POST' });
    } catch {
      // ignore
    }
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead: false } : e));
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      await fetch(`/api/emails/${id}/star`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star: !currentStarred }),
      });
    } catch {
      // ignore
    }
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isStarred: !currentStarred } : e));
  };

  const handleSendReply = async (emailId: string, replyText: string) => {
    const res = await fetch(`/api/emails/${emailId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyText }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao enviar resposta');
    }
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, actionRequired: false, statusLabel: 'Respondido' } : e));
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute counts for sidebar: prefer accurate global counts from server, fall back to current emails
  const sidebarCounts = folderCounts.inbox > 0 ? folderCounts : {
    inbox: emails.length,
    important: emails.filter(e => e.isStarred || e.priority === 'p1' || e.priority === 'p2').length,
    urgent: emails.filter(e => e.priority === 'p1').length,
    pending: emails.filter(e => e.actionRequired).length,
    waiting: emails.filter(e => e.actionLabel?.toLowerCase().includes('aguardando') || e.statusLabel?.toLowerCase().includes('resposta')).length,
    clientes: emails.filter(e => e.category === 'clientes').length,
    financeiro: emails.filter(e => e.category === 'financeiro').length,
    fornecedores: emails.filter(e => e.category === 'fornecedores').length,
    legislacao: emails.filter(e => e.category === 'legislacao').length,
    iusAplicavel: emails.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'APLICAVEL').length,
    iusExclusao: emails.filter(e => e.insight?.complianceAnalysis?.aplicabilidade === 'CAL_EXCLUSAO').length,
    iusMA: emails.filter(e => e.insight?.complianceAnalysis?.escopos.includes('MA')).length,
    iusSSO: emails.filter(e => e.insight?.complianceAnalysis?.escopos.includes('SSO')).length,
    iusSI: emails.filter(e => e.insight?.complianceAnalysis?.escopos.includes('SI')).length,
    iusTRAB: emails.filter(e => e.insight?.complianceAnalysis?.escopos.includes('TRAB')).length,
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || null;

  const getFilterTitle = () => {
    if (currentCategory !== 'all') {
      switch (currentCategory) {
        case 'clientes':
          return 'Clientes';
        case 'financeiro':
          return 'Financeiro';
        case 'fornecedores':
          return 'Fornecedores';
        case 'legislacao':
          return 'Legislação Geral';
        default:
          return currentCategory;
      }
    }
    switch (currentFolder) {
      case 'important':
        return 'Importantes';
      case 'urgent':
        return 'Urgentes';
      case 'pending':
        return 'Pendentes';
      case 'waiting':
        return 'Aguardando resposta';
      case 'ius_aplicavel':
        return 'Legislação Aplicável (CAL)';
      case 'ius_exclusao':
        return 'CAL de Exclusão';
      case 'ius_ma':
        return 'Meio Ambiente (MA)';
      case 'ius_sso':
        return 'Saúde e Segurança (SSO)';
      case 'ius_si':
        return 'Segurança da Informação / LGPD (SI)';
      case 'ius_trab':
        return 'Trabalhista (TRAB)';
      default:
        return 'Caixa de entrada';
    }
  };

  // ============================================================
  // RENDER CONDITIONAL SCREENS
  // ============================================================

  if (screen === 'connect') {
    return (
      <GoogleConnect
        onConnectGoogle={handleConnectGoogle}
        onEnterMockMode={handleEnterMockMode}
        authStatus={authStatus}
        loading={authLoading}
      />
    );
  }

  if (screen === 'sync') {
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-[#080b10] text-slate-900 dark:text-slate-100">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          authStatus={authStatus}
          onToggleMode={handleToggleMode}
          onRefreshSync={startSyncProcess}
          isSyncing={isSyncing}
          onDisconnect={handleDisconnect}
        />
        <SyncProgress
          syncState={syncState}
          onContinueInBackground={() => setScreen('inbox')}
          isAuthenticated={Boolean(authStatus?.authenticated)}
          onRetry={startSyncProcess}
        />
      </div>
    );
  }

  // TELA 03: CENTRAL DE E-MAIL (Canonical 3-Pane Interface)
  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Master Topbar with mobile drawer trigger */}
      <Topbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        authStatus={authStatus}
        onToggleMode={handleToggleMode}
        onRefreshSync={startSyncProcess}
        isSyncing={isSyncing}
        onDisconnect={handleDisconnect}
        onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)}
      />

      {/* 3-Pane Body: Sidebar | InboxList | EmailReader */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Pane 1: Navigation Sidebar (desktop persistent + mobile drawer) */}
        <Sidebar
          currentFolder={currentFolder}
          onSelectFolder={(folder) => {
            setCurrentFolder(folder);
            setCurrentCategory('all');
            setMobileSidebarOpen(false);
          }}
          currentCategory={currentCategory}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setMobileSidebarOpen(false);
          }}
          userEmail={authStatus?.user?.email || (authStatus?.mode === 'live' ? 'Gmail Conectado' : 'demonstracao@ius.com.br')}
          isAuthenticated={Boolean(authStatus?.authenticated)}
          mode={authStatus?.mode}
          accountType={authStatus?.accountType}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          counts={sidebarCounts}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Resizable Separator between Pane 2 (List) and Pane 3 (Preview) */}
        <ResizablePane
          storageKey="email_control_pane_ratio"
          defaultLeftPercent={38}
          minLeftPercent={25}
          maxLeftPercent={60}
          hasSelectedEmail={Boolean(selectedEmailId)}
          left={
            <InboxList
              emails={emails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={(email) => {
                setSelectedEmailId(email.id);
                if (!email.isRead) {
                  fetch(`/api/emails/${email.id}/read`, { method: 'POST' }).catch(() => {});
                  setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isRead: true } : e));
                }
              }}
              onToggleStar={handleToggleStar}
              filterLabel={getFilterTitle()}
              isSyncing={isSyncing}
              onRefreshSync={startSyncProcess}
            />
          }
          right={
            <EmailReader
              email={selectedEmail}
              isAuthenticated={Boolean(authStatus?.authenticated)}
              onBack={() => {
                // If on mobile/small screen or user wants to deselect
                setSelectedEmailId(null);
              }}
              onArchive={handleArchive}
              onTrash={handleTrash}
              onMarkUnread={handleMarkUnread}
              onToggleStar={handleToggleStar}
              onSendReply={handleSendReply}
            />
          }
        />
      </div>

      {/* Settings Modal with Version, Updates and Credentials */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        authStatus={authStatus}
        onRefreshAuth={fetchAuthStatus}
      />
    </div>
  );
};
