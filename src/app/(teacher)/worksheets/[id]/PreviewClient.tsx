'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Worksheet, CurriculumUnit } from '@/types/worksheet';
import TypeTag  from '@/components/TypeTag';
import TypeCover from '@/components/TypeCover';
import WorksheetViewer from '@/components/WorksheetViewer';
import { addMySheet, loadMySheets } from '@/app/(teacher)/my-sheets/MySheetsClient';
import type { TypeKey } from '@/lib/types';

interface Props {
  sheet: Worksheet;
  units: CurriculumUnit[];
}

const GAME_TYPES: string[] = ['escape', 'mystery'];

export default function PreviewClient({ sheet, units }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = loadMySheets();
    setSaved(existing.some(s => s.worksheetId === sheet.id && s.source === 'save'));
  }, [sheet.id]);

  function handleSave() {
    if (saved) return;
    addMySheet({
      id: `save-${sheet.id}-${Date.now()}`,
      worksheetId: sheet.id,
      title: sheet.title,
      type: sheet.type,
      unit: sheet.unit,
      source: 'save',
      savedAt: new Date().toISOString().slice(0, 10),
      shared: false,
    });
    setSaved(true);
  }

  const unit = units.find(u => u.code === sheet.unit);
  const situations: Record<string, string> = {
    wrap: '정리', quiz: '형성평가', level: '심화', focus: '도입·집중',
  };

  const hasGameSrc = sheet.sections.some(s =>
    (s.blocks as Record<string, unknown>[]).some(b => b.kind === 'bitvault' && b.src)
  );
  const isGame = GAME_TYPES.includes(sheet.type) || hasGameSrc;
  const visibleSections = sheet.sections.filter(s => s.role !== 'wrap' || sheet.wrapOn !== false);

  return (
    <div className="p-main">

      {/* 위치 표시 */}
      <nav className="crumb" aria-label="breadcrumb">
        <Link href="/browse">활동지 목록</Link>
        <span aria-hidden="true">›</span>
        <span>{sheet.title}</span>
      </nav>

      {isGame ? (
        /* ── 게임형: 커버 카드 + 액션 ─────────────────── */
        <>
          <div className="pv-head gpv-head">
            {/* 왼쪽: 게임 소개 */}
            <div className="info gpv-info">
              <TypeTag type={sheet.type as TypeKey} />
              <h1>{sheet.title}</h1>
              <div className="pv-meta">
                <span>{sheet.unit.split('-')[0]} 단원{unit ? ` · ${unit.title}` : ''}</span>
              </div>
              <div className="gpv-section">
                <p className="gpv-label">학습목표</p>
                <p className="gpv-text">{sheet.goal}</p>
              </div>
            </div>

            {/* 오른쪽: 액션 */}
            <div className="pv-acts">
              <div className="row">
                <Link href={`/worksheets/${sheet.id}/deploy`} className="btn primary" style={{ textDecoration: 'none' }}>
                  그대로 배포
                </Link>
              </div>
              <div className="row">
                {hasGameSrc ? (
                  <span
                    className="btn ghost"
                    aria-disabled="true"
                    title="게임형 활동지는 직접 편집이 지원되지 않습니다"
                    style={{ opacity: 0.4, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    고쳐서 배포
                  </span>
                ) : (
                  <Link href={`/worksheets/${sheet.id}/edit`} className="btn ghost" style={{ textDecoration: 'none' }}>
                    고쳐서 배포
                  </Link>
                )}
              </div>
              <div className="row">
                <button
                  className="btn ghost"
                  onClick={handleSave}
                  disabled={saved}
                  aria-pressed={saved}
                >
                  {saved ? '담아뒀어요' : '담아두기'}
                </button>
              </div>
              <button
                className="switch"
                onClick={() => setShowAnswers(v => !v)}
                aria-pressed={showAnswers}
                style={{ width: '100%', textAlign: 'left', marginTop: 4 }}
              >
                정답 보기
                <div className={`t${showAnswers ? ' on' : ''}`} />
              </button>
            </div>
          </div>

          {/* 게임 미리보기 */}
          {(() => {
            let src = '';
            for (const sec of sheet.sections)
              for (const b of sec.blocks as (Record<string, unknown>)[])
                if (b.kind === 'bitvault' && b.src) src = b.src as string;
            return src ? (
              <iframe
                key={showAnswers ? 'ans' : 'game'}
                src={`${src}?play=/play/${sheet.id}${showAnswers ? '&answers=1' : ''}`}
                title={sheet.title}
                style={{ width: '100%', height: 700, border: 'none', borderRadius: 20, display: 'block', marginTop: 18 }}
              />
            ) : null;
          })()}
        </>

      ) : (
        /* ── 일반형: 기존 레이아웃 ─────────────────────── */
        <>
          {/* 상단 헤더 카드 */}
          <div className="pv-head">
            <div className="info">
              <TypeTag type={sheet.type as TypeKey} />
              <h1>{sheet.title}</h1>
              <p className="pv-goal">{sheet.goal}</p>
              <div className="pv-meta">
                <span>{sheet.unit.split('-')[0]} 단원{unit ? ` · ${unit.title}` : ''}</span>
                {sheet.situations.length > 0 && (
                  <span>{sheet.situations.map(s => situations[s] ?? s).join(' · ')}</span>
                )}
                {sheet.keywords && sheet.keywords.length > 0 && (
                  <span>{sheet.keywords.join(', ')}</span>
                )}
              </div>
            </div>

            <div className="pv-acts">
              <div className="row">
                <Link href={`/worksheets/${sheet.id}/deploy`} className="btn primary" style={{ textDecoration: 'none' }}>
                  그대로 배포
                </Link>
              </div>
              <div className="row">
                <Link href={`/worksheets/${sheet.id}/edit`} className="btn ghost" style={{ textDecoration: 'none' }}>
                  고쳐서 배포
                </Link>
              </div>
              <div className="row">
                <button
                  className="btn ghost"
                  onClick={handleSave}
                  disabled={saved}
                  aria-pressed={saved}
                >
                  {saved ? '담아뒀어요' : '담아두기'}
                </button>
              </div>
              <button
                className="switch"
                onClick={() => setShowAnswers(v => !v)}
                aria-pressed={showAnswers}
                style={{ width: '100%', textAlign: 'left', marginTop: 4 }}
              >
                정답 보기
                <div className={`t${showAnswers ? ' on' : ''}`} />
              </button>
            </div>
          </div>

          {/* 본문: 활동지 */}
          <div className="pv-paper">
            <WorksheetViewer sheet={sheet} showAnswers={showAnswers} units={units} hideMeta />
          </div>
        </>
      )}
    </div>
  );
}
