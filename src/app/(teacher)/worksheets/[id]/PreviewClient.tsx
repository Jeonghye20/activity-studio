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

const UNGRADED_KINDS = new Set(['bitvault', 'embed', 'story', 'note']);
function isGradedBlock(b: Record<string, unknown>): boolean {
  const k = b.kind as string;
  if (UNGRADED_KINDS.has(k)) return false;
  if (k === 'write') {
    const kws = b.keywords as unknown[] | undefined;
    return b.graded !== false && Array.isArray(kws) && kws.length > 0;
  }
  return true;
}

export default function PreviewClient({ sheet, units }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ansHint, setAnsHint] = useState(false);

  // 채점하는 문항이 하나도 없으면 '정답 보기'를 막는다 (정답이 없는 활동)
  const hasGraded = sheet.sections.some(s =>
    (s.blocks as Record<string, unknown>[]).some(isGradedBlock)
  );

  // 정답 보기를 지원하는 끼운 활동(answers:true embed, 예: 수리 센터)
  const embedAnswers = sheet.sections.some(s =>
    (s.blocks as Record<string, unknown>[]).some(b => b.kind === 'embed' && b.answers === true)
  );

  // 정답 보기를 켜고 끌 때 끼운 모듈에 메시지로 전달(재로딩 없음, 풀던 상태 유지)
  useEffect(() => {
    if (!embedAnswers) return;
    const iframe = document.querySelector('.pv-paper iframe') as HTMLIFrameElement | null;
    iframe?.contentWindow?.postMessage({ type: 'repair:answers', on: showAnswers }, '*');
  }, [showAnswers, embedAnswers]);

  function renderAnswerSwitch() {
    if (!hasGraded && !embedAnswers) {
      return (
        <span style={{ position: 'relative', display: 'block', marginTop: 4 }}>
          <button
            className="switch"
            aria-disabled="true"
            aria-describedby="ans-off-hint"
            onClick={e => e.preventDefault()}
            onMouseEnter={() => setAnsHint(true)}
            onMouseLeave={() => setAnsHint(false)}
            onFocus={() => setAnsHint(true)}
            onBlur={() => setAnsHint(false)}
            style={{ width: '100%', textAlign: 'left', opacity: 0.45, cursor: 'not-allowed' }}
          >
            정답 보기
            <div className="t" />
          </button>
          {ansHint && (
            <span
              id="ans-off-hint"
              role="tooltip"
              style={{
                position: 'absolute', bottom: '100%', left: 0, marginBottom: 6,
                background: 'var(--navy)', color: '#fff', fontSize: 12, lineHeight: 1.4,
                padding: '7px 10px', borderRadius: 8, width: 'max-content', maxWidth: 240,
                wordBreak: 'keep-all', zIndex: 5, boxShadow: '0 6px 16px rgba(23,32,54,.25)',
              }}
            >
              정답이 없는 활동이라 정답 보기를 쓸 수 없습니다
            </span>
          )}
        </span>
      );
    }
    return (
      <button
        className="switch"
        onClick={() => setShowAnswers(v => !v)}
        aria-pressed={showAnswers}
        style={{ width: '100%', textAlign: 'left', marginTop: 4 }}
      >
        정답 보기
        <div className={`t${showAnswers ? ' on' : ''}`} />
      </button>
    );
  }

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

  // 끼운 활동(의견 저울·뉴스룸·수리 센터)은 판 안에서 정답 보기를 따로 그리므로 띠를 넣지 않는다
  const isEmbedActivity = sheet.sections.some(s =>
    (s.blocks as Record<string, unknown>[]).some(b => b.kind === 'embed')
  );

  return (
    <div className="p-main">

      {/* 위치 표시 */}
      <nav className="crumb" aria-label="breadcrumb">
        <Link href="/browse">활동지 찾기</Link>
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
              {renderAnswerSwitch()}
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
              {renderAnswerSwitch()}
            </div>
          </div>

          {/* 정답 보기 안내 띠 (끼운 활동 제외) */}
          {showAnswers && !isEmbedActivity && (
            <div style={{
              background: '#fff3bf', border: '1px solid #ffd43b', color: '#6b4d00',
              fontSize: 14, fontWeight: 700, borderRadius: 12, padding: '12px 16px',
              margin: '18px 0 0', wordBreak: 'keep-all',
            }}>
              정답 보기 중입니다. 학생 화면에는 보이지 않습니다.
            </div>
          )}

          {/* 본문: 활동지. 끼운 모듈이 정답 보기를 맡는 경우 ws.js 를 다시 그리지 않게 showAnswers 고정 */}
          <div className="pv-paper">
            <WorksheetViewer sheet={sheet} showAnswers={embedAnswers ? false : showAnswers} units={units} hideMeta />
          </div>
        </>
      )}
    </div>
  );
}
