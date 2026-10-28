'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DEMO_SESSION, NOT_JOINED, IN_PROGRESS,
  SUBMITTED_VISIBLE, SUBMITTED_HIDDEN,
} from '../demoData';

const { worksheetTitle, classLabel, total, submitted, inProgress, notJoined } = DEMO_SESSION;

const HELP_STUDENT = {
  name: '정oo',
  reason: '문항 2 · 3번 시도 중',
  answers: [
    { q: '15세 토요일 입장료', mine: '3,500원', key: null as string | null, tries: 1, ok: true as boolean | null },
    { q: '할인 조건을 고르세요', mine: '나, 라', key: '가, 다', tries: 3, ok: false as boolean | null },
    { q: '왜 그렇게 판단했나요', mine: '조건에서 나이를 봤어요', key: null, tries: 1, ok: null },
  ],
};

const LEGEND: [string, string][] = [
  ['var(--st-done)', '제출'],
  ['#93c5fd', '진행 중'],
  ['#e5e7eb', '미접속'],
];

export default function ClassLive() {
  const [demo, setDemo] = useState(false);
  const [demoSeconds, setDemoSeconds] = useState(60);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!demo) return;
    const t = setInterval(() => setDemoSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [demo]);

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(s => Math.min(s + 1, 99)), 1000);
    return () => clearInterval(id);
  }, [tick]);

  function handleRefresh() { setLastUpdated(0); setTick(t => t + 1); }

  const notJoinedCount = demo ? 0 : notJoined;
  const inProgressCount = demo ? 4 : inProgress;
  const submittedCount = demo ? total : submitted;
  const helpCount = IN_PROGRESS.filter(s => s.needHelp).length;

  const notJoinedPct = Math.round((notJoinedCount / total) * 100);
  const inProgressPct = Math.round((inProgressCount / total) * 100);
  const submittedPct = 100 - notJoinedPct - inProgressPct;

  const showDetail = selected === HELP_STUDENT.name;

  return (
    <div className="p-main">
      <nav className="crumb">
        <Link href="/class">수업 관리</Link>
        <span aria-hidden="true">›</span>
        <span>수업 중 현황</span>
      </nav>

      <div className="page-head">
        <div>
          <h1>수업 중 현황</h1>
          <p>{worksheetTitle} · {classLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleRefresh} className="btn ghost" style={{ fontSize: 13 }}>
            {lastUpdated}초 전 업데이트 ↻
          </button>
          <button
            className="btn ghost"
            style={{ fontSize: 13 }}
            onClick={() => { setDemo(true); setDemoSeconds(60); }}
          >
            체험: {demo ? `${demoSeconds}초 뒤` : '1분 뒤 모습'} ▶
          </button>
        </div>
      </div>

      {/* 진행 막대 */}
      <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8, display: 'flex', background: '#e5e7eb' }}>
        <div style={{ width: `${submittedPct}%`, background: 'var(--st-done)', transition: 'width .5s' }} />
        <div style={{ width: `${inProgressPct}%`, background: '#93c5fd', transition: 'width .5s' }} />
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-3)', marginBottom: 14 }}>
        {LEGEND.map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
            {l}
          </span>
        ))}
      </div>

      {/* 통계 칩 4개 */}
      <div className="lv-sum">
        <button aria-pressed={false}>
          <i style={{ background: '#9ca3af' }}>미</i>
          <div><b>{notJoinedCount}</b><small>미접속</small></div>
        </button>
        <button aria-pressed={false}>
          <i style={{ background: '#3b82f6' }}>중</i>
          <div><b>{inProgressCount}</b><small>진행 중</small></div>
        </button>
        <button aria-pressed={false}>
          <i style={{ background: 'var(--st-done)' }}>제</i>
          <div><b>{submittedCount}</b><small>제출</small></div>
        </button>
        <button
          aria-pressed={showDetail}
          onClick={() => setSelected(s => s === HELP_STUDENT.name ? null : HELP_STUDENT.name)}
        >
          <i style={{ background: 'var(--st-help)' }}>도</i>
          <div>
            <b style={{ color: helpCount > 0 ? 'var(--st-help)' : undefined }}>{helpCount}</b>
            <small>도움 필요</small>
          </div>
        </button>
      </div>

      {/* 칸반 보드 + 사이드 드로어 */}
      <div className="lv">
        <div className="board">
          <KanbanCol
            title="미접속"
            color="#9ca3af"
            items={demo ? [] : NOT_JOINED.map(n => ({ name: n, needHelp: false }))}
            selected={selected}
            onSelect={setSelected}
          />
          <KanbanCol
            title="진행 중"
            color="#3b82f6"
            items={demo
              ? IN_PROGRESS.slice(2).map(s => ({ ...s, needHelp: false }))
              : IN_PROGRESS}
            selected={selected}
            onSelect={setSelected}
          />
          <KanbanCol
            title="제출"
            color="var(--st-done)"
            items={[
              ...SUBMITTED_VISIBLE.map(n => ({ name: n, needHelp: false })),
              ...(demo ? NOT_JOINED.map(n => ({ name: n, needHelp: false })) : []),
            ]}
            hiddenCount={SUBMITTED_HIDDEN}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* 사이드 드로어 */}
        <div className="drawer">
          {showDetail ? (
            <>
              <div className="dh">
                <div>
                  <b>{HELP_STUDENT.name}</b>
                  <small>도움 필요 · {HELP_STUDENT.reason}</small>
                </div>
                <button
                  className="btn ghost"
                  style={{ marginLeft: 'auto', fontSize: 12, height: 32, padding: '0 10px' }}
                  onClick={() => setSelected(null)}
                >
                  닫기
                </button>
              </div>
              {HELP_STUDENT.answers.map((a, i) => (
                <div key={i} className="ans-card">
                  <div className="t">
                    <span>{i + 1}. {a.q}</span>
                    <span className="state">
                      {a.ok === true
                        ? <span style={{ color: 'var(--st-done)' }}>✓</span>
                        : a.ok === false
                          ? <span style={{ color: 'var(--st-help)' }}>✕ {a.tries}번</span>
                          : <span style={{ color: 'var(--ink-3)' }}>서술형</span>}
                    </span>
                  </div>
                  <div className="mine">{a.mine}</div>
                  {a.key && <div className="key">정답: {a.key}</div>}
                </div>
              ))}
              <div className="nudge">
                <Link href="/class/feedback" className="btn primary" style={{ textDecoration: 'none', fontSize: 13 }}>
                  피드백 보내기
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="fb-prog">
                <span style={{ fontWeight: 700 }}>제출 현황</span>
                <div
                  className="bar"
                  style={{ flex: 1, height: 10, borderRadius: 5, overflow: 'hidden', background: '#e5e7eb' }}
                >
                  <div style={{
                    height: '100%',
                    width: `${Math.round((submittedCount / total) * 100)}%`,
                    background: 'var(--st-done)',
                    transition: 'width .5s',
                  }} />
                </div>
                <span style={{ fontWeight: 800 }}>{submittedCount}/{total}</span>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
                빨간 테두리 학생 카드를 누르거나 <b>도움 필요</b> 칩을 눌러 답변을 확인하세요.
              </p>
            </>
          )}
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-3)' }}>
        학생이 쓴 이유는 수업 뒤 AI가 확인하고, 교사는 따로 볼 학생만 봐요.
      </p>
    </div>
  );
}

function KanbanCol({
  title, color, items, hiddenCount, selected, onSelect,
}: {
  title: string;
  color: string;
  items: { name: string; needHelp: boolean }[];
  hiddenCount?: number;
  selected: string | null;
  onSelect: (n: string) => void;
}) {
  return (
    <div className="col">
      <h3>
        <i style={{ background: color }} />
        {title}
        <span>{items.length}{hiddenCount ? `+${hiddenCount}` : ''}명</span>
      </h3>
      {items.map(s => (
        <button
          key={s.name}
          className={`scard${s.needHelp ? ' help-card' : ''}`}
          aria-pressed={selected === s.name}
          onClick={() => onSelect(s.name)}
        >
          <div className="no">{s.needHelp ? '!' : s.name[0]}</div>
          <div>
            <b>{s.name}</b>
            {s.needHelp && <small>도움 필요</small>}
          </div>
        </button>
      ))}
      {hiddenCount !== undefined && items.length > 0 && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', padding: '6px 4px' }}>
          +{hiddenCount}명 더
        </div>
      )}
    </div>
  );
}
