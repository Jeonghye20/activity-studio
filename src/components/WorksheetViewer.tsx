'use client';

import { useEffect, useRef, useState } from 'react';
import type { Worksheet } from '@/types/worksheet';
import type { CurriculumUnit } from '@/types/worksheet';

interface Props {
  sheet: Worksheet;
  showAnswers?: boolean;
  units?: CurriculumUnit[];
  hideMeta?: boolean;
}

declare global {
  interface Window {
    WS?: {
      render: (
        sheet: Worksheet,
        root: HTMLElement,
        opt?: {
          answers?: boolean;
          edit?: unknown;
          unitLabel?: (code: string) => string;
          onSubmit?: (data: unknown) => void;
          hideMeta?: boolean;
        }
      ) => void;
    };
  }
}

export default function WorksheetViewer({ sheet, showAnswers = false, units, hideMeta = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.WS) { setLoaded(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/ws/ws.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = '/ws/ws.js';
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.WS) return;
    const unitLabel = units
      ? (code: string) => {
          const u = units.find(u => u.code === code);
          return u ? `${code} ${u.title}` : code;
        }
      : undefined;
    window.WS.render(sheet, containerRef.current, { answers: showAnswers, unitLabel, hideMeta });
  }, [loaded, sheet, showAnswers, units]);

  return (
    <div ref={containerRef} style={{ minHeight: 200 }}>
      {!loaded && (
        <div style={{ padding: 40, color: 'var(--mute)', textAlign: 'center', fontSize: 14 }}>
          활동지를 불러오는 중...
        </div>
      )}
    </div>
  );
}
