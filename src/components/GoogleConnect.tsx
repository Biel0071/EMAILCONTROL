import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  Lock, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  X,
  ExternalLink,
  Key,
  Sun,
  Moon,
  Star,
  Clock,
  CornerUpLeft,
  Users,
  CreditCard,
  Package,
  Scale,
  AlertTriangle
} from 'lucide-react';
import { AuthStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GoogleConnectProps {
  onConnectGoogle: (options?: { domain?: string; accountType?: 'personal' | 'enterprise' }) => void;
  onEnterMockMode: (accountType?: 'personal' | 'enterprise') => void;
  authStatus: AuthStatus | null;
  loading: boolean;
}

export const GoogleConnect: React.FC<GoogleConnectProps> = ({
  onConnectGoogle,
  onEnterMockMode,
  authStatus,
  loading,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [accountType, setAccountType] = useState<'personal' | 'enterprise'>('personal');
  const [corporateDomain, setCorporateDomain] = useState<string>('');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [inputClientId, setInputClientId] = useState<string>('');
  const [inputClientSecret, setInputClientSecret] = useState<string>('');
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const handleConnectClick = () => {
    if (!authStatus?.hasGoogleCredentials) {
      setShowConfigModal(true);
    } else {
      onConnectGoogle({
        domain: accountType === 'enterprise' ? corporateDomain : undefined,
        accountType,
      });
    }
  };

  const handleSaveAndConnect = async () => {
    if (!inputClientId.trim() || !inputClientSecret.trim()) {
      setConfigError('Por favor, preencha o Client ID e o Client Secret.');
      return;
    }
    setIsSavingConfig(true);
    setConfigError(null);
    try {
      const res = await fetch('/api/auth/configure-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: inputClientId.trim(),
          clientSecret: inputClientSecret.trim(),
          domain: accountType === 'enterprise' ? corporateDomain : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error) {
        setConfigError(data.error);
      }
    } catch (err: any) {
      setConfigError(err.message || 'Erro ao conectar ao Google.');
    } finally {
      setIsSavingConfig(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#090d13] text-slate-800 dark:text-slate-200 radial-glow selection:bg-emerald-500 selection:text-black overflow-x-hidden transition-colors">
      {/* Top Header */}
      <header className="w-full px-8 lg:px-16 pt-8 flex items-center justify-between z-20">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl tracking-tighter shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span>ius</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              EMAIL CONTROL
            </span>
            <span className="text-[10px] tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-semibold mt-0.5">
              Camada Operacional Gmail
            </span>
          </div>
        </div>

        {/* Top-Right: Corporate Badge and Theme Switcher */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2.5 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            <span>Plataforma Corporativa</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Diretrizes IUS</span>
          </div>

          {/* Theme Toggle Pill */}
          <div 
            className="flex items-center bg-slate-200/80 dark:bg-[#121722] p-0.5 rounded-lg border border-slate-300 dark:border-[#1f2737] shadow-2xs"
            role="group"
            aria-label="Controle de Tema"
          >
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Ativar Modo Claro (White)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>White</span>
            </button>
            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1c2436] text-emerald-300 shadow-xs border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Ativar Modo Escuro (Dark)"
            >
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1780px] mx-auto px-6 lg:px-14 py-8 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
        {/* LEFT COLUMN: Headline & Value Proposition */}
        <section className="w-full lg:w-[35%] flex flex-col justify-center space-y-7 pr-0 lg:pr-4">
          <div className="w-11 h-[3px] bg-emerald-500 rounded-full"></div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Seu Gmail.<br />
            Entendido,<br />
            organizado e sob<br />
            <span className="text-emerald-600 dark:text-emerald-400">controle.</span>
          </h1>

          <p className="text-slate-600 dark:text-neutral-400 text-base sm:text-lg max-w-md font-normal leading-relaxed">
            Transforme sua caixa de entrada empresarial em um centro inteligente de controle.
          </p>

          {/* Value Bullets */}
          <div className="space-y-4 pt-1">
            {/* Feature 1 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#141b24] border border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">Inteligência</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">Analisa e identifica o que realmente importa sem fabricar dados.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#141b24] border border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0 shadow-xs">
                <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">Organização</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">Classifica em 4 categorias oficiais e prioriza automaticamente.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#141b24] border border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">Segurança</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">Conexão oficial e segura com o Google via OAuth 2.0.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: 3D Perspective Preview (Laptop Mockup) */}
        <section className="laptop-viewport hidden md:flex flex-1 justify-center items-center py-6 px-2 pointer-events-none select-none">
          <div className="laptop-frame relative w-[540px] xl:w-[630px] rounded-2xl bg-slate-200 dark:bg-[#10141b] border-[7px] border-slate-300 dark:border-[#222834] p-3 text-xs shadow-2xl transition-colors">
            {/* Bezel Camera */}
            <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-black rounded-full mx-auto mb-2.5 border border-slate-300 dark:border-white/10"></div>
            
            {/* Screen Inner */}
            <div className="rounded-lg bg-slate-100 dark:bg-[#0c1017] border border-slate-300/80 dark:border-white/5 overflow-hidden flex flex-col h-[370px] transition-colors">
              {/* Top Bar */}
              <div className="h-10 border-b border-slate-200 dark:border-white/5 px-3 flex items-center justify-between bg-white dark:bg-[#10151f]">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-slate-900 dark:text-white text-[11px]">ius EMAIL CONTROL</span>
                </div>
                <div className="bg-slate-100 dark:bg-[#18202d] border border-slate-200 dark:border-transparent rounded-md px-3 py-1 text-[10px] text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 w-64">
                  <SearchIcon />
                  <span>Pesquisar e-mails, pessoas, empresas...</span>
                </div>
                <div className="w-4"></div>
              </div>

              {/* Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Mini Sidebar */}
                <div className="w-44 border-r border-slate-200 dark:border-white/5 p-2 space-y-3 bg-slate-50 dark:bg-[#0d121a] text-[10px]">
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-transparent font-semibold px-2 py-1.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Caixa de entrada
                  </div>
                  <div className="text-slate-600 dark:text-neutral-400 space-y-1.5 px-2">
                    <div className="py-0.5 flex items-center gap-1.5"><Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30" /><span>Importantes</span></div>
                    <div className="py-0.5 text-rose-600 dark:text-rose-400 flex items-center gap-1.5"><AlertTriangle className="w-2.5 h-2.5" /><span>Urgentes</span></div>
                    <div className="py-0.5 flex items-center gap-1.5"><Clock className="w-2.5 h-2.5 text-slate-400" /><span>Pendentes</span></div>
                    <div className="py-0.5 text-[9.5px] flex items-center gap-1.5"><CornerUpLeft className="w-2.5 h-2.5 text-slate-400" /><span>Aguardando</span></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-[9.5px] text-slate-500 dark:text-neutral-400 space-y-1 px-2">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase">Categorias</p>
                    <p className="flex items-center gap-1.5"><Users className="w-2.5 h-2.5 text-blue-500" /><span>Clientes</span></p>
                    <p className="flex items-center gap-1.5"><CreditCard className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" /><span>Financeiro</span></p>
                    <p className="flex items-center gap-1.5"><Package className="w-2.5 h-2.5 text-indigo-500" /><span>Fornecedores</span></p>
                    <p className="flex items-center gap-1.5"><Scale className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" /><span>Legislação</span></p>
                  </div>
                </div>

                {/* Mini Email List */}
                <div className="flex-1 bg-white dark:bg-[#090d14] p-2 space-y-1.5 overflow-hidden">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200 dark:bg-white/[0.03] dark:border-white/5 text-[10px]">
                    <div className="flex items-center gap-2">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300 flex items-center justify-center text-[8px] font-bold">DX</div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-neutral-200">Débora Xavier</span>
                        <p className="text-[8.5px] text-slate-500 dark:text-neutral-400 truncate w-36">Leis Municipais - Atualização</p>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-400 dark:text-neutral-500">10:15</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-100 dark:bg-white/[0.015] dark:border-transparent text-[10px]">
                    <div className="flex items-center gap-2">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/30 dark:text-rose-300 flex items-center justify-center text-[8px] font-bold">CH</div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-neutral-300">Cliente Horizonte</span>
                        <p className="text-[8.5px] text-slate-500 dark:text-neutral-400 truncate w-36">Re: Pedido de orçamento</p>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-400 dark:text-neutral-500">10:42</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-100 dark:bg-white/[0.015] dark:border-transparent text-[10px]">
                    <div className="flex items-center gap-2">
                      <Star className="w-2.5 h-2.5 text-slate-300 dark:text-neutral-600 shrink-0" />
                      <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/30 dark:text-teal-300 flex items-center justify-center text-[8px] font-bold">FA</div>
                      <div>
                        <span className="font-medium text-slate-800 dark:text-neutral-300">Fornecedor ABC</span>
                        <p className="text-[8.5px] text-slate-500 dark:text-neutral-400 truncate w-36">Nota fiscal emitida #28491</p>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-400 dark:text-neutral-500">09:31</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection Base */}
            <div className="h-2 w-28 bg-slate-300 dark:bg-[#333d4e] rounded-b-md mx-auto -mb-1 mt-1 opacity-70"></div>
          </div>
        </section>

        {/* RIGHT COLUMN: Authentication Floating Card */}
        <section className="w-full lg:w-[410px] xl:w-[460px] flex flex-col items-center justify-center">
          <div className="w-full glass-card rounded-2xl p-7 sm:p-9 shadow-2xl">
            {/* Card Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 dark:bg-emerald-500/20 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl shadow-xs">
                <span>ius</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EMAIL CONTROL</span>
            </div>

            {/* Account Selector: Qualquer Gmail vs Empresa */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-[#121722] p-1 border border-slate-200 dark:border-[#1f2737] mb-5">
              <button
                type="button"
                onClick={() => setAccountType('personal')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  accountType === 'personal'
                    ? 'bg-white text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Qualquer Gmail</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('enterprise')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  accountType === 'enterprise'
                    ? 'bg-white text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Empresa (Workspace)</span>
              </button>
            </div>

            {/* Titles */}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {accountType === 'enterprise' ? 'Conecte seu Gmail empresarial' : 'Conecte qualquer conta Gmail'}
            </h2>
            <p className="text-slate-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 mb-5 leading-relaxed">
              {accountType === 'enterprise'
                ? 'Conecte sua conta Google Workspace para importar, organizar e analisar os e-mails corporativos com as diretrizes IUS.'
                : 'Conecte sua conta Google para sincronizar, organizar e gerenciar seus e-mails com conformidade e segurança.'}
            </p>

            {/* Optional Enterprise Domain Filter */}
            {accountType === 'enterprise' && (
              <div className="mb-4 text-left">
                <label className="block text-[11px] font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Domínio da empresa (opcional)
                </label>
                <input
                  type="text"
                  value={corporateDomain}
                  onChange={(e) => setCorporateDomain(e.target.value)}
                  placeholder="ex: iusnatura.com.br"
                  className="w-full bg-slate-50 dark:bg-[#10141d] border border-slate-300 dark:border-[#1f2737] focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-500 dark:text-neutral-500 mt-1">
                  Direciona a tela Google diretamente para contas corporativas.
                </p>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              onClick={handleConnectClick}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 dark:hover:bg-neutral-100 text-slate-900 font-semibold py-3.5 px-5 rounded-full flex items-center justify-between transition-all duration-200 border border-slate-300 dark:border-transparent shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Google Multicolor 'G' Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" fill="#4285F4" />
                  <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" fill="#34A853" />
                  <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
                  <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
                </svg>
                <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-neutral-800">
                  {loading 
                    ? 'Conectando ao Google...' 
                    : accountType === 'enterprise' 
                    ? 'Continuar com Google Workspace' 
                    : 'Continuar com Gmail'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Quick Setup or Demo Mode box if credentials not yet configured */}
            {!authStatus?.hasGoogleCredentials && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-xs text-left shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-semibold mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Conectar ao seu Gmail real</span>
                </div>
                <p className="text-slate-600 dark:text-neutral-400 text-[11px] leading-relaxed mb-3">
                  Para o navegador abrir a tela de login da sua conta Google, informe o Client ID e Secret do Google Cloud uma única vez:
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="w-full mb-2 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#161d28] dark:hover:bg-[#1d2737] text-slate-900 dark:text-slate-100 font-semibold text-xs border border-slate-300 dark:border-[#263347] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Configurar Acesso Oficial do Google (2 min)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEnterMockMode(accountType)}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {accountType === 'enterprise' 
                      ? 'Explorar com Gmail Empresarial (Demonstração)' 
                      : 'Explorar com Qualquer Gmail (Demonstração)'}
                  </span>
                </button>
              </div>
            )}

            {/* Security Assurances */}
            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Conexão segura com sua conta Google</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Seus dados permanecem vinculados à conta autorizada</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>A sincronização pode ser interrompida a qualquer momento</span>
              </li>
            </ul>

            {/* Security Subcard */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.08] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-500 dark:text-neutral-400 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                <p>Seus dados são protegidos e utilizados apenas para operação do Email Control.</p>
              </div>
            </div>
          </div>

          {/* Enterprise Badge */}
          <div className="flex items-center gap-3 mt-5 px-3 max-w-sm">
            <Building2 className="w-5 h-5 text-slate-400 dark:text-neutral-500 shrink-0" />
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-500 leading-snug">
              Solução desenvolvida para empresas que valorizam organização, produtividade e segurança.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 lg:px-16 pb-8 pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-500 border-t border-transparent z-10">
        <div className="space-y-0.5">
          <p className="font-semibold tracking-widest text-[11px] text-slate-600 dark:text-neutral-400 uppercase">
            IUS | EMAIL CONTROL
          </p>
          <p className="text-[11px]">© 2026 IUS. Todos os direitos reservados.</p>
        </div>
      </footer>
      {/* Google Cloud Credentials Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121722] border border-slate-200 dark:border-[#1f2737] rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1f2737]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Conectar com sua Conta Google Real</h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">Abrir login oficial do Gmail no seu navegador</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowConfigModal(false); setConfigError(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c2436] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
              Para o Google abrir a tela oficial de login da sua conta, informe as credenciais OAuth do Google Cloud (processo gratuito e feito 1 única vez):
            </p>

            {/* Steps Quick Guide */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0e16] border border-slate-200 dark:border-[#1a2333] space-y-2 text-xs text-slate-700 dark:text-neutral-300">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider">Como obter em 2 minutos:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-neutral-300">
                <li>
                  Acesse o{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 underline font-medium inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Clique em <strong>Criar Credenciais &gt; ID do cliente OAuth</strong></li>
                <li>Tipo de aplicativo: <strong>Aplicativo da Web</strong></li>
                <li>
                  Em <em>URIs de redirecionamento autorizados</em>, insira:
                  <div className="mt-1">
                    <code className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#161f2e] border border-emerald-300 dark:border-emerald-500/30 px-2 py-1 rounded font-mono select-all block break-all text-[10px]">
                      http://localhost:1000/api/auth/google/callback
                    </code>
                  </div>
                </li>
                <li>Copie e cole o <strong>Client ID</strong> e o <strong>Client Secret</strong> abaixo:</li>
              </ol>
            </div>

            {configError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{configError}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Google Client ID
                </label>
                <input
                  type="text"
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  placeholder="ex: 123456789-abcdef.apps.googleusercontent.com"
                  className="w-full bg-slate-50 dark:bg-[#0a0e16] border border-slate-300 dark:border-[#1f2737] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 outline-none font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Google Client Secret
                </label>
                <input
                  type="password"
                  value={inputClientSecret}
                  onChange={(e) => setInputClientSecret(e.target.value)}
                  placeholder="ex: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-50 dark:bg-[#0a0e16] border border-slate-300 dark:border-[#1f2737] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 outline-none font-mono transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleSaveAndConnect}
                disabled={isSavingConfig}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                {isSavingConfig ? 'Conectando ao Google...' : 'Salvar e Abrir Login do Gmail no Navegador'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  onEnterMockMode(accountType);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#17202e] dark:hover:bg-[#1f2b3e] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-transparent transition-colors cursor-pointer"
              >
                Acessar Modo Demonstração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function SearchIcon() {
  return (
    <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
