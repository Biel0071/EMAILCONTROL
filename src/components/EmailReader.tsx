import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Archive, 
  Trash2, 
  Mail, 
  MailCheck,
  Clock, 
  ExternalLink, 
  Star, 
  Download, 
  Reply, 
  ReplyAll,
  Forward, 
  Paperclip,
  Check,
  Copy,
  Scale,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileArchive,
  Eye,
  ShieldCheck,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  File,
  X,
  Send,
  Code2,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { EmailItem, EmailAttachment } from '../types';
import { AIInsightPanel } from './AIInsightPanel';
import { ReplyModal } from './ReplyModal';
import { useTheme } from '../context/ThemeContext';

interface EmailReaderProps {
  email: EmailItem | null;
  onBack: () => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onToggleStar: (id: string, currentStarred: boolean) => void;
  onSendReply: (emailId: string, replyText: string) => Promise<void>;
  isAuthenticated?: boolean;
}

/**
 * Strips HTML tags, styles, scripts, comments and zero-width markers
 */
function cleanEmailText(text: string, htmlFallback?: string): string {
  let source = text || '';
  // Detect if body is corrupted by style blocks or CSS comments
  if (!source || source.startsWith('/*') || source.startsWith('#outlook') || source.startsWith('@media') || source.startsWith('<')) {
    source = htmlFallback || source;
  }
  if (!source) return '';

  return source
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\u200B-\u200D\uFEFF\u034F\u200E\u200F\u2000-\u200A\u202F\u205F]/g, '')
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();
}

/**
 * Isolated Sandboxed HTML Renderer for Email Content
 * Prevents global stylesheet collisions, sandboxes link navigation, and handles auto-resize
 */
const EmailHtmlRenderer: React.FC<{ 
  html: string; 
  contrastMode: 'original' | 'adaptive';
  isDark: boolean;
}> = ({ html, contrastMode, isDark }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(450);

  // Compose safe sandboxed document
  const buildSrcDoc = () => {
    const isNightMode = isDark && contrastMode === 'adaptive';
    const bgStyle = isNightMode 
      ? 'background: #0d121c !important; color: #e2e8f0 !important;' 
      : 'background: #ffffff !important; color: #1e293b !important;';
    const linkColor = isNightMode ? '#34d399' : '#059669';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 16px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      ${bgStyle}
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 6px;
    }
    table {
      max-width: 100% !important;
    }
    a {
      color: ${linkColor};
      text-underline-offset: 2px;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const syncHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          const scrollHeight = Math.max(
            doc.body.scrollHeight,
            doc.documentElement.scrollHeight,
            300
          );
          setIframeHeight(scrollHeight + 24);
        }
      } catch {
        // Fallback default
      }
    };

    iframe.addEventListener('load', syncHeight);

    // Also observe mutations in case images or fonts load asynchronously
    let observer: ResizeObserver | null = null;
    try {
      const doc = iframe.contentDocument;
      if (doc && doc.body) {
        observer = new ResizeObserver(() => syncHeight());
        observer.observe(doc.body);
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(syncHeight, 400);

    return () => {
      iframe.removeEventListener('load', syncHeight);
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [html, contrastMode, isDark]);

  return (
    <div className="w-full relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#1f2737] bg-white dark:bg-[#0d121c] shadow-xs">
      <iframe
        ref={iframeRef}
        srcDoc={buildSrcDoc()}
        title="Email Content"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        style={{ height: `${iframeHeight}px`, minHeight: '320px' }}
        className="w-full border-0 block transition-all bg-white dark:bg-[#0d121c]"
      />
    </div>
  );
};

export const EmailReader: React.FC<EmailReaderProps> = ({
  email,
  onBack,
  onArchive,
  onTrash,
  onMarkUnread,
  onToggleStar,
  onSendReply,
  isAuthenticated = false,
}) => {
  const { theme } = useTheme();
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [forwardRecipient, setForwardRecipient] = useState('');
  const [forwardNote, setForwardNote] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [readingMode, setReadingMode] = useState<'formatted' | 'clean'>('formatted');
  const [contrastMode, setContrastMode] = useState<'original' | 'adaptive'>('original');
  const [previewAttachment, setPreviewAttachment] = useState<EmailAttachment | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Sync default reading mode when email changes
  useEffect(() => {
    if (email) {
      setReadingMode(email.bodyHtml ? 'formatted' : 'clean');
      setShowDetails(false);
    }
  }, [email?.id]);

  if (!email) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#080b10] p-8 text-center select-none transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#0e121b] border border-slate-200 dark:border-[#1f2737] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-sm">
          <Mail className="w-8 h-8 opacity-60 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Nenhum e-mail selecionado</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-2 leading-relaxed">
          Selecione uma mensagem na caixa de entrada para inspecionar o conteúdo completo, anexos e a inteligência operacional IUS.
        </p>
      </div>
    );
  }

  const handleCopyLink = () => {
    const link = email.gmailLink || window.location.href;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmail = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAttachment = (att: EmailAttachment) => {
    const url = `/api/emails/${email.id}/attachments/${att.id}?filename=${encodeURIComponent(att.name)}`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = att.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setDownloadNotice(`Download de "${att.name}" iniciado.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handleDownloadAllAttachments = () => {
    if (email.attachments && email.attachments.length > 0) {
      email.attachments.forEach((att, idx) => {
        setTimeout(() => {
          handleDownloadAttachment(att);
        }, idx * 400);
      });
      setDownloadNotice(`Download de todos os ${email.attachments.length} anexo(s) iniciado.`);
      setTimeout(() => setDownloadNotice(null), 4000);
    }
  };

  const handleForwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwardRecipient.trim()) return;
    setDownloadNotice(`E-mail encaminhado para ${forwardRecipient}.`);
    setIsForwardOpen(false);
    setForwardRecipient('');
    setForwardNote('');
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const getAttachmentStyle = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) {
      return {
        icon: <FileText className="w-4 h-4 text-rose-500" />,
        badgeBg: 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400',
        label: 'PDF',
      };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return {
        icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badgeBg: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
        label: ext.toUpperCase(),
      };
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return {
        icon: <FileText className="w-4 h-4 text-blue-500" />,
        badgeBg: 'bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400',
        label: ext.toUpperCase(),
      };
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return {
        icon: <ImageIcon className="w-4 h-4 text-purple-500" />,
        badgeBg: 'bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400',
        label: ext.toUpperCase(),
      };
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return {
        icon: <FileArchive className="w-4 h-4 text-amber-500" />,
        badgeBg: 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400',
        label: ext.toUpperCase(),
      };
    }
    return {
      icon: <File className="w-4 h-4 text-slate-500" />,
      badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
      label: ext.toUpperCase() || 'ARQ',
    };
  };

  const getCategoryBadge = (cat: EmailItem['category']) => {
    switch (cat) {
      case 'clientes':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs">
            Clientes
          </span>
        );
      case 'financeiro':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            Financeiro
          </span>
        );
      case 'fornecedores':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
            Fornecedores
          </span>
        );
      case 'legislacao':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 shadow-2xs">
            Legislação Geral
          </span>
        );
    }
  };

  // Sender monogram initials
  const senderInitials = email.fromName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() || 'U';

  const isCorporateSender = email.fromEmail.includes('@') && 
    !email.fromEmail.endsWith('@gmail.com') && 
    !email.fromEmail.endsWith('@hotmail.com') && 
    !email.fromEmail.endsWith('@yahoo.com');

  const pristineCleanText = cleanEmailText(email.body, email.bodyHtml);

  return (
    <div className="h-full flex flex-1 overflow-hidden bg-white dark:bg-[#080b10] text-slate-800 dark:text-slate-200 transition-colors">
      {/* Middle Reading View */}
      <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-[#1f2737] overflow-hidden min-w-0">
        {/* Executive Reading Header Toolbar */}
        <div className="h-14 border-b border-slate-200 dark:border-[#1f2737] px-4 flex items-center justify-between shrink-0 bg-slate-50/90 dark:bg-[#0e121b] transition-colors gap-2">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-[#182030] transition-colors cursor-pointer"
              title="Voltar à lista"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-[#1f2737] mx-0.5 sm:mx-1"></div>

            {/* Quick triage actions */}
            <button
              onClick={() => onArchive(email.id)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-[#182030] transition-colors cursor-pointer"
              title="Arquivar mensagem"
            >
              <Archive className="w-4 h-4" />
            </button>

            <button
              onClick={() => onTrash(email.id)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Mover para a lixeira"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onMarkUnread(email.id)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-[#182030] transition-colors cursor-pointer"
              title={email.isRead ? 'Marcar como não lido' : 'Marcar como lido'}
            >
              {email.isRead ? <Mail className="w-4 h-4" /> : <MailCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            <button
              onClick={() => onToggleStar(email.id, email.isStarred)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
              title={email.isStarred ? 'Remover estrela' : 'Adicionar estrela'}
            >
              <Star
                className={`w-4 h-4 ${
                  email.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-[#182030] transition-colors cursor-pointer"
              title="Copiar link da mensagem"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-[#182030] transition-colors cursor-pointer hidden sm:inline-flex"
              title="Imprimir e-mail"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Tools: Reading Mode, Contrast Toggle, AI & Open in Gmail */}
          <div className="flex items-center gap-2 shrink-0">
            {/* HTML vs Clean Text reading toggle */}
            {email.bodyHtml && (
              <div className="flex items-center bg-slate-200/70 dark:bg-[#121722] p-0.5 rounded-lg border border-slate-300/80 dark:border-[#1f2737] text-xs font-medium">
                <button
                  onClick={() => setReadingMode('formatted')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    readingMode === 'formatted'
                      ? 'bg-white dark:bg-[#1c2436] text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Visualização Original Formatada (HTML)"
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Original HTML</span>
                </button>
                <button
                  onClick={() => setReadingMode('clean')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    readingMode === 'clean'
                      ? 'bg-white dark:bg-[#1c2436] text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Modo Leitura: texto limpo, tipografia confortável"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Modo Leitura</span>
                </button>
              </div>
            )}

            {/* Dark Mode contrast selector when viewing HTML (only relevant in dark theme) */}
            {email.bodyHtml && readingMode === 'formatted' && theme === 'dark' && (
              <button
                onClick={() => setContrastMode(prev => prev === 'original' ? 'adaptive' : 'original')}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#1f2737] bg-[#121722] text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Alternar contraste do fundo do e-mail"
              >
                {contrastMode === 'original' ? (
                  <>
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>Fundo Original</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 text-emerald-400" />
                    <span>Noturno Adaptado</span>
                  </>
                )}
              </button>
            )}

            {/* AI Toggle Button */}
            <button
              onClick={() => setShowAIPanel(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                showAIPanel
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                  : 'bg-white dark:bg-[#121722] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#1f2737] hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={showAIPanel ? 'Ocultar painel de inteligência' : 'Exibir painel de inteligência'}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Inteligência</span>
              <span className="sm:hidden">IA</span>
            </button>

            {/* Executive CTA: Abrir no Gmail */}
            <a
              href={email.gmailLink || 'https://mail.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Abrir no Gmail</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>

        {/* Temporary Notification Banner */}
        {downloadNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/70 border-b border-emerald-200 dark:border-emerald-800/60 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{downloadNotice}</span>
            </div>
            <button onClick={() => setDownloadNotice(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Email Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Executive Sender Header Card */}
          <div className="bg-slate-50 dark:bg-[#0e121b] border border-slate-200 dark:border-[#1f2737] rounded-xl p-4 sm:p-5 transition-colors shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Refined Avatar Monogram */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ring-2 ring-emerald-500/20 select-none">
                  {senderInitials}
                </div>

                {/* Sender Info & Recipient */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-slate-950 dark:text-slate-100 truncate">
                      {email.fromName}
                    </span>
                    {isCorporateSender && (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <ShieldCheck className="w-3 h-3" /> Corporativo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <button
                      onClick={() => handleCopyEmail(email.fromEmail)}
                      className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Clique para copiar e-mail"
                    >
                      <span className="truncate">{email.fromEmail}</span>
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
                    </button>
                    <span>•</span>
                    <span className="text-slate-600 dark:text-slate-400">para <strong className="font-medium">{email.to || 'mim'}</strong></span>
                    <button
                      onClick={() => setShowDetails(p => !p)}
                      className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer ml-1 font-medium"
                    >
                      <span>{showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}</span>
                      {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Date & Time with Star button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#141924] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1f2737] font-mono shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{email.date}</span>
                </div>
                <button
                  onClick={() => onToggleStar(email.id, email.isStarred)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1f2737] bg-white dark:bg-[#141924] text-slate-400 hover:text-amber-500 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors cursor-pointer shadow-2xs"
                  title={email.isStarred ? 'Remover favorito' : 'Marcar como favorito'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      email.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Expandable Message Details Drawer */}
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#1f2737]/80 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div><span className="font-semibold text-slate-500 dark:text-slate-400">De:</span> {email.fromName} &lt;{email.fromEmail}&gt;</div>
                  <div><span className="font-semibold text-slate-500 dark:text-slate-400">Para:</span> {email.to || 'destinatário'}</div>
                  <div><span className="font-semibold text-slate-500 dark:text-slate-400">Data/Hora:</span> {email.date}</div>
                  <div><span className="font-semibold text-slate-500 dark:text-slate-400">Thread ID:</span> <span className="font-mono">{email.threadId}</span></div>
                  <div><span className="font-semibold text-slate-500 dark:text-slate-400">Segurança:</span> Criptografia padrão TLS / SPF verificado</div>
                  <div><span className="font-semibold text-slate-500 dark:text-slate-400">ID da Mensagem:</span> <span className="font-mono">{email.id}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Subject Title & Executive Badges Bar */}
          <div className="space-y-3 border-b border-slate-200 dark:border-[#1f2737]/80 pb-5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-snug">
              {email.subject}
            </h1>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {getCategoryBadge(email.category)}

              {/* Compliance CAL Status Badges */}
              {email.insight?.complianceAnalysis?.aplicabilidade === 'APLICAVEL' && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-2xs">
                  <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Legislação Aplicável ({email.insight.complianceAnalysis.escopos.join(', ')})</span>
                </span>
              )}
              {email.insight?.complianceAnalysis?.aplicabilidade === 'CAL_EXCLUSAO' && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 shadow-2xs">
                  CAL de Exclusão
                </span>
              )}
              {email.insight?.complianceAnalysis?.aplicabilidade === 'PARA_IUS_NATURA' && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 flex items-center gap-1.5 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Para Ius Natura</span>
                </span>
              )}
              {email.insight?.complianceAnalysis?.aplicabilidade === 'AVALIAR_CLIENTE_ATIVO' && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800/60 flex items-center gap-1.5 shadow-2xs">
                  <Scale className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Avaliar Cliente Ativo</span>
                </span>
              )}

              {/* Action Required Pill */}
              {email.actionRequired && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 shadow-2xs">
                  {email.actionLabel || 'Ação necessária'}
                </span>
              )}

              {/* Status Label */}
              {email.statusLabel && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  {email.statusLabel}
                </span>
              )}
            </div>

            {/* BD Full text action alert if applicable */}
            {email.insight?.complianceAnalysis?.requerAcaoBD && (
              <div className="mt-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-tight">
                    <span className="font-bold">Aviso IUS Natura:</span> Norma regulatória publicada em ementa/extrato. Requer solicitação do texto integral ao BD (<span className="font-mono">BD@iusnatura.com.br</span>).
                  </p>
                </div>
                <a
                  href={`mailto:BD@iusnatura.com.br?subject=${encodeURIComponent(`Solicitação de Texto Integral - ${email.subject}`)}`}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-white dark:text-amber-300 border border-amber-500/30 text-xs font-semibold shrink-0 transition-colors shadow-2xs"
                >
                  Solicitar ao BD
                </a>
              </div>
            )}
          </div>

          {/* Email Body Content Area */}
          <div className="email-body-content min-w-0">
            {email.bodyHtml && readingMode === 'formatted' ? (
              <EmailHtmlRenderer 
                html={email.bodyHtml} 
                contrastMode={contrastMode}
                isDark={theme === 'dark'}
              />
            ) : (
              <div className="p-5 sm:p-6 rounded-xl bg-slate-50/60 dark:bg-[#0e121b]/60 border border-slate-200 dark:border-[#1f2737] shadow-xs">
                <div className="email-content-view text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-normal">
                  {pristineCleanText || email.body}
                </div>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
            <div className="pt-5 border-t border-slate-200 dark:border-[#1f2737]/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {email.attachments.length}{' '}
                    {email.attachments.length === 1 ? 'Anexo disponível' : 'Anexos disponíveis'}
                  </span>
                </span>
                {email.attachments.length > 1 && (
                  <button
                    onClick={handleDownloadAllAttachments}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar todos os anexos</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {email.attachments.map((att) => {
                  const style = getAttachmentStyle(att.name);

                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#131824] border border-slate-200 dark:border-[#1f2737] hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                        {/* File type badge */}
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-extrabold text-[11px] shrink-0 ${style.badgeBg}`}>
                          {style.label}
                        </div>

                        {/* File Details */}
                        <div className="min-w-0 flex-1">
                          <p 
                            className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer" 
                            title={att.name}
                            onClick={() => setPreviewAttachment(att)}
                          >
                            {att.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{att.size}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setPreviewAttachment(att)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-[#182030] transition-colors cursor-pointer"
                          title="Visualizar detalhes do anexo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(att)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-200/80 dark:hover:bg-[#182030] transition-colors cursor-pointer"
                          title="Baixar anexo"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Bar (Reply / Reply All / Forward) */}
          <div className="flex items-center gap-2.5 pt-5 border-t border-slate-200 dark:border-[#1f2737]/60 flex-wrap">
            <button
              onClick={() => setIsReplyOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <Reply className="w-4 h-4" />
              <span>Responder</span>
            </button>

            <button
              onClick={() => setIsReplyOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#141a26] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1f2737] hover:border-slate-300 dark:hover:border-slate-600 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <ReplyAll className="w-4 h-4" />
              <span>Responder a todos</span>
            </button>

            <button
              onClick={() => setIsForwardOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#141a26] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1f2737] hover:border-slate-300 dark:hover:border-slate-600 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Forward className="w-4 h-4" />
              <span>Encaminhar</span>
            </button>

            <button
              onClick={() => onArchive(email.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#141a26] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1f2737] hover:border-slate-300 dark:hover:border-slate-600 text-xs font-semibold transition-all cursor-pointer shadow-xs ml-auto"
            >
              <Archive className="w-4 h-4" />
              <span>Arquivar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discrete Right AI Intelligence Panel */}
      {showAIPanel && (
        <AIInsightPanel 
          insight={email.insight} 
          category={email.category} 
          isAuthenticated={isAuthenticated} 
        />
      )}

      {/* Reply Modal */}
      <ReplyModal
        email={email}
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        onSendReply={onSendReply}
      />

      {/* Forward Modal */}
      {isForwardOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#131823] border border-slate-200 dark:border-[#1f2737] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1f2737]">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Forward className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Encaminhar e-mail</span>
              </div>
              <button
                onClick={() => setIsForwardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c2436] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleForwardSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Encaminhar para:
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: colega@empresa.com.br"
                  value={forwardRecipient}
                  onChange={(e) => setForwardRecipient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0a0d14] border border-slate-300 dark:border-[#1f2737] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mensagem adicional (opcional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Acrescente instruções ou notas para o destinatário..."
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0a0d14] border border-slate-300 dark:border-[#1f2737] rounded-lg p-3 text-xs text-slate-900 dark:text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-colors"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0d14] border border-slate-200 dark:border-[#1f2737] text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-300">Assunto:</span> Fwd: {email.subject}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForwardOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182030] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!forwardRecipient.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Encaminhar Mensagem</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#131823] border border-slate-200 dark:border-[#1f2737] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1f2737]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${getAttachmentStyle(previewAttachment.name).badgeBg}`}>
                  {getAttachmentStyle(previewAttachment.name).label}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {previewAttachment.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {previewAttachment.size} • {previewAttachment.mimeType || 'Arquivo anexo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c2436] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0d14] border border-slate-200 dark:border-[#1f2737] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">E-mail de origem:</span>
                <span className="font-semibold truncate max-w-[240px] text-right">{email.subject}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Remetente:</span>
                <span className="font-mono text-[11px] truncate max-w-[240px]">{email.fromEmail}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Identificador do anexo:</span>
                <span className="font-mono text-[11px] truncate max-w-[240px]">{previewAttachment.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182030] cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleDownloadAttachment(previewAttachment);
                  setPreviewAttachment(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Arquivo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
