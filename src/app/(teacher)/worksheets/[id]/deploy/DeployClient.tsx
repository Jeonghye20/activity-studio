'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { WorksheetSummary } from '@/types/worksheet';
import TypeCover from '@/components/TypeCover';
import TypeTag  from '@/components/TypeTag';
import type { TypeKey } from '@/lib/types';

/* 시연용 QR */
function QRPlaceholder() {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,0,1,0,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,1,0,1,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,1,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,1,0],
    [1,1,1,0,1,1,1,1,0,1,0,1,1,0,1,1,1,0,1,1,1],
    [0,0,0,1,0,0,0,1,1,0,1,0,0,1,0,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,0,0,1,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,1,0,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1,1,1,1,1],
  ];
  const cell = 10;
  const size = pattern.length * cell;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-label="QR 코드">
      {pattern.map((row, ri) =>
        row.map((v, ci) =>
          v === 1 ? (
            <rect key={`${ri}-${ci}`} x={ci * cell} y={ri * cell} width={cell} height={cell} fill="#fff" />
          ) : null
        )
      )}
    </svg>
  );
}

type Mode = 'settings' | 'done';

interface Props {
  sheet: Pick<WorksheetSummary, 'id' | 'title' | 'type'>;
}

export default function DeployClient({ sheet }: Props) {
  const [mode, setMode]         = useState<Mode>('settings');
  const [classes, setClasses]   = useState<Set<string>>(new Set(['3반']));
  const [methods, setMethods]   = useState<Set<string>>(new Set(['링크', 'QR']));
  const [deadline, setDeadline] = useState('수업 끝날 때');
  const [resubmit, setResubmit] = useState('피드백 후 1번');
  const [copied, setCopied]     = useState(false);

  function toggle<T>(set: Set<T>, val: T): Set<T> {
    const next = new Set(set); if (next.has(val)) next.delete(val); else next.add(val); return next;
  }

  const classArr   = ['1반', '2반', '3반', '4반'];
  const methodArr  = ['링크', 'QR', '수업 코드'];
  const deadlineArr = [
    { id: '수업 끝날 때',   sub: '수업 중에만 풀 수 있어요' },
    { id: '오늘 밤 12시',   sub: '집에서도 마무리할 수 있어요' },
    { id: '날짜 지정',      sub: '직접 날짜를 고르세요' },
  ];
  const resubmitArr = [
    { id: '피드백 후 1번',      flow: '제출 · 피드백 · 재제출 1번', def: true },
    { id: '마감 전까지 언제든',  flow: '제출 · 고치기 · 다시 제출' },
    { id: '받지 않음',          flow: '제출 · 끝' },
  ];

  const classSummary  = [...classes].join(', ') || '—';
  const methodSummary = [...methods].join(' + ') || '—';

  /* ── 배포 완료 화면 ── */
  if (mode === 'done') {
    const CODE = 'T7Y75';

    function handleCopy() {
      navigator.clipboard?.writeText(`https://studio.example/j/${CODE}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <div className="p-main">
        <div className="done-head">
          <div className="ok">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path d="M5 12l4 4L19 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1>배포했어요</h1>
            <p>2학년 {classSummary} · 마감 {deadline}</p>
          </div>
        </div>

        <div className="done-grid">
          {/* QR + 코드 카드 */}
          <div className="beam">
            <div className="qr-box">
              <QRPlaceholder />
            </div>
            <div>
              <p className="join-k">수업 코드로 접속</p>
              <div className="code">
                {CODE.split('').map((ch, i) => <span key={i}>{ch}</span>)}
              </div>
              <div className="copy-url">
                <b>studio.example/j/{CODE}</b>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? '복사됨' : '링크 복사'}
                </button>
              </div>
              <div className="beam-acts">
                <button
                  className="btn ghost"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
                  onClick={() => window.print()}
                >
                  A4 인쇄
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드 */}
          <div>
            {/* 요약 카드 */}
            <div className="sumcard">
              <div className="cover" style={{ aspectRatio: '21/9' }}>
                <TypeCover type={sheet.type as TypeKey} block={false} />
              </div>
              <div className="body">
                <TypeTag type={sheet.type as TypeKey} />
                <h3>{sheet.title}</h3>
                <dl className="dl">
                  <dt>대상</dt><dd>2학년 {classSummary}</dd>
                  <dt>방식</dt><dd>{methodSummary}</dd>
                  <dt>마감</dt><dd>{deadline}</dd>
                  <dt>재제출</dt><dd>{resubmit}</dd>
                </dl>
              </div>
            </div>

            {/* 다음 액션 */}
            <div className="next-acts">
              <Link href="/class" className="btn primary" style={{ textDecoration: 'none' }}>
                수업 중 현황 보기
                <span>수업 관리</span>
              </Link>
              <Link href="/student-preview" className="btn ghost" style={{ textDecoration: 'none' }}>
                학생 화면 미리보기
                <span>시연</span>
              </Link>
              <Link href="/home" className="btn ghost" style={{ textDecoration: 'none' }}>
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── 배포 설정 화면 ── */
  return (
    <div className="p-main">
      <nav className="crumb">
        <Link href={`/worksheets/${sheet.id}`}>{sheet.title}</Link>
        <span aria-hidden="true">›</span>
        <span>배포</span>
      </nav>

      <div className="page-head">
        <div>
          <h1>배포</h1>
          <p>수업 대상과 방식을 설정하세요.</p>
        </div>
      </div>

      <div className="dp">
        {/* 왼쪽: 설정 폼 */}
        <div>
          {/* 대상 */}
          <div className="dsec">
            <h2>대상</h2>
            <p>여러 반을 함께 고를 수 있어요.</p>
            <div className="picks">
              {classArr.map(c => (
                <button
                  key={c}
                  className="btn ghost"
                  aria-pressed={classes.has(c)}
                  onClick={() => setClasses(toggle(classes, c))}
                  style={{
                    borderColor: classes.has(c) ? 'var(--ink)' : undefined,
                    background: classes.has(c) ? 'var(--canvas)' : undefined,
                    fontWeight: classes.has(c) ? 800 : 700,
                  }}
                >
                  {classes.has(c) && '✓ '}{c}
                </button>
              ))}
            </div>
          </div>

          {/* 방식 */}
          <div className="dsec">
            <h2>방식</h2>
            <p>여러 방식을 함께 쓸 수 있어요.</p>
            <div className="picks">
              {methodArr.map(m => (
                <button
                  key={m}
                  className="btn ghost"
                  aria-pressed={methods.has(m)}
                  onClick={() => setMethods(toggle(methods, m))}
                  style={{
                    borderColor: methods.has(m) ? 'var(--ink)' : undefined,
                    background: methods.has(m) ? 'var(--canvas)' : undefined,
                    fontWeight: methods.has(m) ? 800 : 700,
                  }}
                >
                  {methods.has(m) && '✓ '}{m}
                </button>
              ))}
            </div>
          </div>

          {/* 마감 */}
          <div className="dsec">
            <h2>마감</h2>
            <p>재제출도 마감 전까지만 받아요.</p>
            <div className="opts3">
              {deadlineArr.map(d => (
                <button
                  key={d.id}
                  className="ocard"
                  aria-pressed={deadline === d.id}
                  onClick={() => setDeadline(d.id)}
                >
                  <b>{d.id}</b>
                  <small>{d.sub}</small>
                </button>
              ))}
            </div>
          </div>

          {/* 재제출 */}
          <div className="dsec">
            <h2>재제출</h2>
            <p></p>
            <div className="opts3">
              {resubmitArr.map(r => (
                <button
                  key={r.id}
                  className="ocard"
                  aria-pressed={resubmit === r.id}
                  onClick={() => setResubmit(r.id)}
                >
                  {r.def && <span className="def">기본</span>}
                  <b>{r.id}</b>
                  <small style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'var(--canvas)', borderRadius: 6, padding: '3px 8px',
                    fontSize: 12, fontWeight: 700, color: 'var(--ink-2)',
                  }}>
                    {r.flow}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 요약 카드 */}
        <div className="dp-side">
          <div className="recap">
            <div className="cover">
              <TypeCover type={sheet.type as TypeKey} block={false} />
            </div>
            <div className="in">
              <TypeTag type={sheet.type as TypeKey} />
              <h3 style={{ marginTop: 10 }}>{sheet.title}</h3>
              <ol>
                <li><i>1</i><span>대상 <b>{classSummary}</b></span></li>
                <li><i>2</i><span>방식 <b>{methodSummary}</b></span></li>
                <li><i>3</i><span>마감 <b>{deadline}</b></span></li>
                <li><i>4</i><span>재제출 <b>{resubmit}</b></span></li>
              </ol>
              <button
                className="btn primary"
                disabled={classes.size === 0 || methods.size === 0}
                onClick={() => setMode('done')}
              >
                {classes.size > 0 ? `${classSummary}에 배포하기` : '배포하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
