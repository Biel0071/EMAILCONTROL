import React from 'react';
import { 
  Inbox, 
  Star, 
  AlertCircle, 
  Clock, 
  CornerUpLeft, 
  Users, 
  CreditCard, 
  Package, 
  Scale, 
  Settings, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Leaf, 
  HeartPulse, 
  Lock, 
  Briefcase, 
  X
} from 'lucide-react';
import { EmailCategory, FilterFolder } from '../types';

interface SidebarProps {
  currentFolder: FilterFolder;
  onSelectFolder: (folder: FilterFolder) => void;
  currentCategory: EmailCategory | 'all';
  onSelectCategory: (category: EmailCategory | 'all') => void;
  userEmail: string;
  isAuthenticated?: boolean;
  mode?: 'live' | 'mock';
  accountType?: 'personal' | 'enterprise';
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  counts: {
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
  };
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFolder,
  onSelectFolder,
  currentCategory,
  onSelectCategory,
  userEmail,
  isAuthenticated = false,
  mode = 'mock',
  accountType = 'enterprise',
  isOpenMobile = false,
  onCloseMobile,
  counts,
  onOpenSettings,
}) => {
  const isLive = isAuthenticated && mode === 'live';
  const isEnterprise = accountType === 'enterprise' || !userEmail.toLowerCase().endsWith('@gmail.com');

  const sidebarContent = (
    <aside className="w-60 bg-slate-50 dark:bg-[#0e121b] border-r border-slate-200 dark:border-[#1f2737] flex flex-col justify-between shrink-0 select-none h-full text-slate-700 dark:text-slate-300 transition-colors">
      <div className="p-3 overflow-y-auto space-y-4">
        {/* Mobile Header with Close button */}
        <div className="flex items-center justify-between lg:hidden pb-1 border-b border-slate-200 dark:border-[#1f2737]">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">NAVEGAÇÃO</span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Connected Account Card - Truthful state */}
        <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 shadow-xs ${
          isLive 
            ? 'bg-white dark:bg-[#131823] border-slate-200 dark:border-[#1f2737]' 
            : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/25'
        }`}>
          <div className="relative flex-shrink-0">
            <span className={`w-2.5 h-2.5 block rounded-full ${
              isLive ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-400 ring-2 ring-amber-400/20'
            }`}></span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold flex items-center justify-between">
              <span className={isLive ? 'text-slate-800 dark:text-slate-200' : 'text-amber-700 dark:text-amber-300'}>
                {isLive 
                  ? (isEnterprise ? 'Gmail Empresarial' : 'Gmail Pessoal') 
                  : (isEnterprise ? 'Modo Demo (Empresa)' : 'Modo Demo (Pessoal)')}
              </span>
              {isLive ? (
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              )}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={userEmail}>
              {userEmail}
            </div>
          </div>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1">
          {/* Caixa de entrada */}
          <button
            onClick={() => {
              onSelectFolder('inbox');
              onSelectCategory('all');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentFolder === 'inbox' && currentCategory === 'all'
                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Caixa de entrada</span>
            </div>
            <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 tnum">
              {counts.inbox}
            </span>
          </button>

          {/* Importantes */}
          <button
            onClick={() => {
              onSelectFolder('important');
              onSelectCategory('all');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentFolder === 'important'
                ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Importantes</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.important}</span>
          </button>

          {/* Urgentes */}
          <button
            onClick={() => {
              onSelectFolder('urgent');
              onSelectCategory('all');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentFolder === 'urgent'
                ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Urgentes</span>
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold tnum">{counts.urgent}</span>
          </button>

          {/* Pendentes */}
          <button
            onClick={() => {
              onSelectFolder('pending');
              onSelectCategory('all');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentFolder === 'pending'
                ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Pendentes</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.pending}</span>
          </button>

          {/* Aguardando resposta */}
          <button
            onClick={() => {
              onSelectFolder('waiting');
              onSelectCategory('all');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentFolder === 'waiting'
                ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CornerUpLeft className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Aguardando resposta</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.waiting}</span>
          </button>
        </nav>

        {/* Categories Section */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5">
            CATEGORIAS
          </div>
          <nav className="space-y-0.5">
            {/* Clientes */}
            <button
              onClick={() => onSelectCategory(currentCategory === 'clientes' ? 'all' : 'clientes')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentCategory === 'clientes'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Clientes</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.clientes}</span>
            </button>

            {/* Financeiro */}
            <button
              onClick={() => onSelectCategory(currentCategory === 'financeiro' ? 'all' : 'financeiro')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentCategory === 'financeiro'
                  ? 'bg-emerald-50 dark:bg-teal-950/40 text-emerald-700 dark:text-teal-300 border border-emerald-200 dark:border-teal-800/50 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
                <span>Financeiro</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.financeiro}</span>
            </button>

            {/* Fornecedores */}
            <button
              onClick={() => onSelectCategory(currentCategory === 'fornecedores' ? 'all' : 'fornecedores')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentCategory === 'fornecedores'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Fornecedores</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.fornecedores}</span>
            </button>

            {/* Legislação */}
            <button
              onClick={() => onSelectCategory(currentCategory === 'legislacao' ? 'all' : 'legislacao')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentCategory === 'legislacao'
                  ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Legislação Geral</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.legislacao}</span>
            </button>
          </nav>
        </div>

        {/* IUS Guidelines Compliance Section */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase px-2 mb-1.5 flex items-center justify-between">
            <span>DIRETRIZES IUS NATURA</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">CAL</span>
          </div>
          <nav className="space-y-0.5">
            {/* Legislação Aplicável (CAL) */}
            <button
              onClick={() => {
                onSelectFolder('ius_aplicavel');
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentFolder === 'ius_aplicavel' && currentCategory === 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Legislação Aplicável</span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400/90 font-medium tnum">{counts.iusAplicavel ?? 0}</span>
            </button>

            {/* CAL de Exclusão */}
            <button
              onClick={() => {
                onSelectFolder('ius_exclusao');
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentFolder === 'ius_exclusao' && currentCategory === 'all'
                  ? 'bg-slate-100 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <span>CAL de Exclusão</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{counts.iusExclusao ?? 0}</span>
            </button>

            {/* Sub-escopos principais */}
            <div className="pt-1.5 pb-0.5 px-2">
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Principais Escopos
              </span>
            </div>

            {/* MA - Meio Ambiente */}
            <button
              onClick={() => {
                onSelectFolder('ius_ma');
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentFolder === 'ius_ma' && currentCategory === 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Meio Ambiente (MA)</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tnum">{counts.iusMA ?? 0}</span>
            </button>

            {/* SSO - Saúde e Segurança */}
            <button
              onClick={() => {
                onSelectFolder('ius_sso');
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentFolder === 'ius_sso' && currentCategory === 'all'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Saúde & Segurança (SSO)</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tnum">{counts.iusSSO ?? 0}</span>
            </button>

            {/* SI - Segurança da Informação / LGPD */}
            <button
              onClick={() => {
                onSelectFolder('ius_si');
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentFolder === 'ius_si' && currentCategory === 'all'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Seg. Informação / LGPD</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tnum">{counts.iusSI ?? 0}</span>
            </button>

            {/* TRAB - Trabalhista */}
            <button
              onClick={() => {
                onSelectFolder('ius_trab');
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentFolder === 'ius_trab' && currentCategory === 'all'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182030]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>Trabalhista (CLT/MTE)</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tnum">{counts.iusTRAB ?? 0}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1f2737] space-y-1.5 bg-slate-100/70 dark:bg-[#0c0f17] transition-colors">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-[#182030] text-xs transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Configurações</span>
        </button>

        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-[#182030] text-xs transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Abrir no Gmail</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Google</span>
        </a>

        <div className="px-2.5 pt-2 border-t border-slate-200/80 dark:border-[#1f2737]/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span className="font-mono">IUS Email Control</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">v1.0.0</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile Modal Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
