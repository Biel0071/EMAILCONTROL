import React, { useRef } from 'react';
import { Search, RefreshCw, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { AuthStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  authStatus: AuthStatus | null;
  onToggleMode: (mode: 'live' | 'mock') => void;
  onRefreshSync: () => void;
  isSyncing: boolean;
  onDisconnect: () => void;
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  onSearchChange,
  authStatus,
  onToggleMode,
  onRefreshSync,
  isSyncing,
  onDisconnect,
  onToggleSidebar,
}) => {
  const { theme, toggleTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const naturalQueries = [
    'e-mails urgentes sem resposta',
    'notas fiscais desta semana',
    'mensagens de fornecedores',
    'documentos pendentes',
  ];

  const isLive = Boolean(authStatus?.authenticated && authStatus?.mode === 'live');

  return (
    <header className="h-14 bg-white dark:bg-[#0e121b] border-b border-slate-200 dark:border-[#1f2737] flex items-center justify-between px-3 sm:px-4 gap-3 sm:gap-4 shrink-0 z-20 text-slate-700 dark:text-slate-300 transition-colors">
      {/* Brand Logo & Title + Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 w-auto lg:w-56 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#182030] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden cursor-pointer"
            title="Abrir navegação"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 dark:bg-emerald-500/20 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl tracking-tighter shadow-sm">
            <span>ius</span>
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase leading-none">
              EMAIL CONTROL
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400/80 font-medium tracking-tight">
              Enterprise Suite
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar and Natural Queries */}
      <div className="flex-1 max-w-4xl flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#121722] text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 pl-9 pr-14 py-2 rounded-lg border border-slate-200 dark:border-[#1f2737] focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
            placeholder="Pesquisar e-mails, pessoas, empresas, assuntos ou palavras..."
            type="text"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#131823] border border-slate-200 dark:border-[#1f2737] px-1.5 py-0.5 rounded font-mono">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Natural Search Chips */}
        <div className="hidden 2xl:flex items-center gap-1.5 shrink-0 text-[11px]">
          {naturalQueries.map((query) => (
            <button
              key={query}
              onClick={() => onSearchChange(query === searchQuery ? '' : query)}
              className={`px-2.5 py-1.5 rounded-md border text-xs transition-colors whitespace-nowrap cursor-pointer ${
                searchQuery === query
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 font-medium'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 dark:bg-[#121722] dark:hover:bg-[#182030] dark:text-slate-400 dark:hover:text-slate-200 dark:border-[#1f2737]'
              }`}
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Theme Toggle, Mode Tag, Sync Status & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Theme Toggle (Dark Mode vs White Mode) */}
        <div 
          className="flex items-center bg-slate-100 dark:bg-[#121722] p-0.5 rounded-lg border border-slate-200 dark:border-[#1f2737] shadow-2xs"
          role="group"
          aria-label="Controle de Tema"
        >
          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Ativar Modo Claro (White)"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">White</span>
          </button>
          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1c2436] text-emerald-300 shadow-xs border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Ativar Modo Escuro (Dark)"
          >
            <Moon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* Mode Tag (Live vs Mock) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#121722] px-2.5 py-1 rounded-full border border-slate-200 dark:border-[#1f2737]">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ambiente:</span>
          {authStatus?.mode === 'live' ? (
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Gmail ({authStatus?.accountType === 'personal' ? 'Pessoal' : 'Workspace'})
            </span>
          ) : (
            <button
              onClick={() => {
                if (authStatus?.authenticated) {
                  onToggleMode(authStatus.mode === 'mock' ? 'live' : 'mock');
                } else {
                  alert('Para alternar para o Gmail Real, configure as credenciais OAuth em Configurações ou no arquivo .env.');
                }
              }}
              title="Clique para alternar para modo Gmail Real"
              className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Demonstração ({authStatus?.accountType === 'personal' ? 'Pessoal' : 'Empresarial'})
            </button>
          )}
        </div>

        {/* Sync Indicator - Truthful representation */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isLive ? 'bg-emerald-400' : 'bg-amber-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isLive ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
          </span>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
              {isSyncing 
                ? (isLive ? 'Sincronizando...' : 'Sincronizando (Demo)...') 
                : (isLive ? 'Gmail sincronizado' : 'Demonstração ativa')}
            </span>
            <span className="text-[9px] text-slate-500 leading-none">
              {isLive ? 'Online' : 'Simulação IUS'}
            </span>
          </div>
          <button
            onClick={onRefreshSync}
            disabled={isSyncing}
            className={`text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-[#182030] rounded transition-colors ml-0.5 cursor-pointer ${
              isSyncing ? 'animate-spin text-emerald-500' : ''
            }`}
            title="Atualizar agora"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-[#1f2737]"></div>

        {/* User Info & Disconnect */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-medium text-xs border border-slate-300 dark:border-slate-600 overflow-hidden shrink-0">
            {authStatus?.user?.picture ? (
              <img src={authStatus.user.picture} alt={authStatus.user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{authStatus?.user?.name ? authStatus.user.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
          <div className="flex flex-col text-left max-w-[140px]">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate leading-tight" title={authStatus?.user?.name}>
              {authStatus?.user?.name || (isLive ? 'Gmail Conectado' : 'Modo Demonstração')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-none" title={authStatus?.user?.email}>
              {authStatus?.user?.email || ''}
            </span>
          </div>

          <button
            onClick={onDisconnect}
            className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors ml-1 cursor-pointer"
            title="Desconectar conta"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
