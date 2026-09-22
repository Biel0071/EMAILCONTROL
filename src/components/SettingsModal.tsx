import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Sparkles, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  HardDrive, 
  Key,
  Info
} from 'lucide-react';
import { AuthStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  authStatus: AuthStatus | null;
  onRefreshAuth: () => void;
}

interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  buildDate: string;
  changelog: string[];
  downloadUrl: string;
  installerFileName: string;
  portableFileName: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  authStatus,
  onRefreshAuth,
}) => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'updates' | 'credentials'>('general');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [customClientId, setCustomClientId] = useState('');
  const [customClientSecret, setCustomClientSecret] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsSuccess, setCredsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-check version on open
      fetchUpdateInfo();
    }
  }, [isOpen]);

  const fetchUpdateInfo = async () => {
    setCheckingUpdate(true);
    try {
      const res = await fetch('/api/system/check-updates');
      if (res.ok) {
        const data = await res.json();
        setUpdateInfo(data);
      }
    } catch {
      // ignore
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClientId.trim() || !customClientSecret.trim()) return;
    setSavingCreds(true);
    try {
      const res = await fetch('/api/auth/configure-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: customClientId.trim(),
          clientSecret: customClientSecret.trim(),
        }),
      });
      if (res.ok) {
        setCredsSuccess(true);
        setTimeout(() => setCredsSuccess(false), 3000);
        onRefreshAuth();
      }
    } catch {
      // ignore
    } finally {
      setSavingCreds(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-[#1f2737] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f2737] bg-slate-50 dark:bg-[#0c1019]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Configurações do IUS Email Control
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Plataforma Executiva de Controle de E-mails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#1c2436] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#1f2737] bg-slate-100/70 dark:bg-[#0e131e] px-6 gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Geral & Aparência
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'updates'
                ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>Versão & Atualizações</span>
            {updateInfo?.hasUpdate && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'credentials'
                ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Credenciais Google
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: GERAL & APARÊNCIA */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              {/* Theme Toggle Card */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1019] border border-slate-200 dark:border-[#1f2737]">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Tema da Interface
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Selecione entre visual Dark Graphite ou White Executivo
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-[#182030] p-1 rounded-lg border border-slate-300 dark:border-[#2a364f]">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#10141d] text-emerald-300 border border-emerald-500/30 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>White</span>
                  </button>
                </div>
              </div>

              {/* Status Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c1019] border border-slate-200 dark:border-[#1f2737]">
                  <span className="text-slate-600 dark:text-slate-400">Conta Gmail</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {authStatus?.user?.email || (authStatus?.authenticated ? 'Gmail Conectado' : 'demonstracao@ius.com.br')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c1019] border border-slate-200 dark:border-[#1f2737]">
                  <span className="text-slate-600 dark:text-slate-400">Status de Conexão</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {authStatus?.authenticated ? 'Gmail Conectado (Live)' : 'Modo Demonstração'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c1019] border border-slate-200 dark:border-[#1f2737]">
                  <span className="text-slate-600 dark:text-slate-400">Porta de Execução</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    http://localhost:1000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERSÃO & ATUALIZAÇÕES */}
          {activeTab === 'updates' && (
            <div className="space-y-4">
              {/* Current Version Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c1019] border border-slate-200 dark:border-[#1f2737] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Versão Instalada
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      v{updateInfo?.currentVersion || '1.0.0'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (Build {updateInfo?.buildDate || '2026-09-21'})
                    </span>
                  </div>
                </div>

                <button
                  onClick={fetchUpdateInfo}
                  disabled={checkingUpdate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                  <span>{checkingUpdate ? 'Verificando...' : 'Verificar Atualizações'}</span>
                </button>
              </div>

              {/* Update Status Banner */}
              {updateInfo?.hasUpdate ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-bold text-amber-600 dark:text-amber-300">
                      Nova versão disponível: v{updateInfo.latestVersion}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-200/90 leading-relaxed">
                    Uma nova compilação do IUS Email Control foi gerada com melhorias e correções. Você pode baixar e atualizar diretamente.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <a
                      href={updateInfo.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Atualização (.exe)</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold block">Você está na versão mais recente</span>
                    <span className="text-[11px] opacity-85">O sistema está atualizado com as últimas diretrizes IUS Natura.</span>
                  </div>
                </div>
              )}

              {/* Changelog / O que há de novo */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                  Recursos Desta Versão:
                </span>
                <ul className="space-y-1 bg-slate-50 dark:bg-[#0c1019] p-3 rounded-xl border border-slate-200 dark:border-[#1f2737] text-[11px] text-slate-600 dark:text-slate-400">
                  {(updateInfo?.changelog || [
                    'Versão executável Windows (.exe) com suporte a instalação e modo portátil',
                    'Motor de Conformidade e Diretrizes IUS Natura (11 escopos oficiais)',
                    'Leitor de e-mails em sandbox com proteção contra vazamento CSS',
                    'Temas Dark Mode e White Mode com alternância instantânea',
                    'Download e streaming de anexos',
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Informação sobre os arquivos executáveis (.exe) */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0e141f] border border-slate-200 dark:border-[#1b2636] space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                  Arquivos Executáveis para Envio e Instalação:
                </span>
                <p>
                  • <strong>Instalador (.exe):</strong> <code className="text-emerald-600 dark:text-emerald-300 font-mono">IUS-Email-Control-Setup-1.0.0.exe</code> — cria atalho na Área de Trabalho e instala na máquina.
                </p>
                <p>
                  • <strong>Portátil (.exe):</strong> <code className="text-emerald-600 dark:text-emerald-300 font-mono">IUS-Email-Control-Portable-1.0.0.exe</code> — pronto para rodar direto do pendrive ou download sem precisar instalar.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CREDENCIAIS GOOGLE */}
          {activeTab === 'credentials' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1019] border border-slate-200 dark:border-[#1f2737] space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  Credenciais Google OAuth Integradas
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  O aplicativo já inclui as credenciais padrão do projeto para funcionar imediatamente em outro computador. Se você desejar utilizar seu próprio Client ID e Client Secret do Google Cloud, informe-os abaixo:
                </p>
              </div>

              <form onSubmit={handleSaveCredentials} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Client ID
                  </label>
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="709504419734-...apps.googleusercontent.com"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#090d14] border border-slate-300 dark:border-[#1f2737] text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Client Secret
                  </label>
                  <input
                    type="password"
                    value={customClientSecret}
                    onChange={(e) => setCustomClientSecret(e.target.value)}
                    placeholder="GOCSPX-..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#090d14] border border-slate-300 dark:border-[#1f2737] text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {credsSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Credenciais salvas com sucesso!</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingCreds || !customClientId.trim() || !customClientSecret.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingCreds ? 'Salvando...' : 'Salvar Credenciais'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-[#1f2737] bg-slate-50 dark:bg-[#0c1019] flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            IUS Email Control • v{updateInfo?.currentVersion || '1.0.0'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-[#182030] dark:hover:bg-[#222c42] text-slate-800 dark:text-slate-200 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
