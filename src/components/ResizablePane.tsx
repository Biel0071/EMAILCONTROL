import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizablePaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  storageKey?: string;
  defaultLeftPercent?: number;
  minLeftPercent?: number;
  maxLeftPercent?: number;
  hasSelectedEmail?: boolean;
}

export const ResizablePane: React.FC<ResizablePaneProps> = ({
  left,
  right,
  storageKey = 'email_control_pane_ratio',
  defaultLeftPercent = 38,
  minLeftPercent = 25,
  maxLeftPercent = 60,
  hasSelectedEmail = true,
}) => {
  const [leftPercent, setLeftPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= minLeftPercent && parsed <= maxLeftPercent) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return defaultLeftPercent;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor window resize for responsive mode
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDragging = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const newPercent = (newWidth / rect.width) * 100;

      if (newPercent >= minLeftPercent && newPercent <= maxLeftPercent) {
        setLeftPercent(newPercent);
        try {
          localStorage.setItem(storageKey, newPercent.toFixed(1));
        } catch {
          // ignore
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, minLeftPercent, maxLeftPercent, storageKey]);

  // Mobile / Small Screen Adaptive View
  if (isMobile) {
    return (
      <div className="flex-1 flex overflow-hidden w-full h-full">
        {hasSelectedEmail ? (
          <div className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-[#0c1017]">
            {right}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0a0d14]">
            {left}
          </div>
        )}
      </div>
    );
  }

  // Desktop 2-Pane Resizable Layout
  return (
    <div
      ref={containerRef}
      className={`flex-1 flex overflow-hidden select-none relative ${
        isDragging ? 'cursor-col-resize select-none touch-none' : ''
      }`}
    >
      {/* Left Pane (Inbox List) */}
      <div
        style={{ width: `${leftPercent}%` }}
        className="h-full flex flex-col shrink-0 min-w-[320px] max-w-[700px] border-r border-slate-200 dark:border-[#1f2737] overflow-hidden"
      >
        {left}
      </div>

      {/* Resizer Divider (Supports Mouse & Touch Pointer Events) */}
      <div
        onPointerDown={startDragging}
        className="w-2 hover:w-2.5 bg-transparent hover:bg-emerald-500/20 active:bg-emerald-500/40 transition-all cursor-col-resize flex items-center justify-center -ml-[4px] z-30 group touch-none"
        title="Arraste para ajustar proporção Lista / Leitura"
      >
        <div className="w-[3px] h-8 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 group-active:bg-emerald-500 transition-colors flex items-center justify-center shadow-sm">
          <GripVertical className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Right Pane (Email Preview / Reader) */}
      <div
        style={{ width: `${100 - leftPercent}%` }}
        className="h-full flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#0c1017]"
      >
        {right}
      </div>
    </div>
  );
};
