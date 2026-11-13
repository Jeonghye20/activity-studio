'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getDemoClasses } from '@/lib/classRosterDummy';
import {
  getAllPaperFeedback,
  savePaperFeedback,
  PAPER_PRAISE_OPTIONS,
  type PaperFeedback,
} from '@/lib/paperFeedback';

const PURPLE = '#6741d9';
const ORANGE = '#e8890c';
const GREEN = '#2b8a3e';
const RED = '#c92a2a';
const INK = '#172036';
const INK2 = '#5d6880';
const LINE = '#e3e7ef';

const DEFAULT_CODE = 'T7Y75';
const SHEET_ID = 'ws-physical';
const SHEET_TITLE = '센서가 알아채고, 장치가 움직인다';
const CLASS_LABEL = '2학년 3반';
const RETRY_NUMBERS = [1, 2, 3, 4, 5];
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.7;
const SAVE_FAIL_MSG = '사진 용량이 커서 저장하지 못했어요. 다시 찍어 주세요.';

type Status = 'none' | 'photo' | 'sent';
type Draft = { praise: string[]; comment: string; retryItems: number[] };

/* ── 사진 처리 ───────────────────────────────────────────── */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** 긴 변 1600px, JPEG 0.7 로 줄인다. rotate 는 -90(왼쪽) 또는 0 */
async function toJpeg(src: string, rotate: 0 | -90 = 0): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  if (rotate === -90) {
    canvas.width = h; canvas.height = w;
    ctx.translate(0, w);
    ctx.rotate(-Math.PI / 2);
  } else {
    canvas.width = w; canvas.height = h;
  }
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

/* ── 아이콘 ──────────────────────────────────────────────── */
function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h6l2 2h10v10H3z" />
    </svg>
  );
}
function IconPaper() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h7M9 15h7M9 18h4" />
    </svg>
  );
}
function IconRotate() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4v6h6" /><path d="M3.5 10A9 9 0 1 1 6 16.5" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" />
    </svg>
  );
}

/* ── 상태 점 ─────────────────────────────────────────────── */
function StatusDot({ status }: { status: Status }) {
  if (status === 'sent') {
    return (
      <span aria-label="보냄" style={{
        width: 18, height: 18, borderRadius: '50%', background: GREEN, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 900, flexShrink: 0,
      }}>✓</span>
    );
  }
  return (
    <span aria-label={status === 'photo' ? '사진만 올림' : '사진 없음'} style={{
      width: 10, height: 10, borderRadius: '50%', margin: 4, flexShrink: 0,
      background: status === 'photo' ? ORANGE : '#c4cad6',
    }} />
  );
}

/* ── 본문 ────────────────────────────────────────────────── */
export default function PaperFeedbackClient() {
  const params = useSearchParams();
  const code = (params.get('code') || DEFAULT_CODE).toUpperCase();

  const students = useMemo(() => {
    const c3 = getDemoClasses().find(c => c.grade === 2 && c.room === 3);
    return (c3?.students ?? []).map(s => ({ num: s.no, name: s.name }));
  }, []);
  const total = students.length;

  const [data, setData] = useState<Record<number, PaperFeedback>>({});
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<number>(1);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 처음 불러오기 — 아직 안 보낸 첫 학생을 고른다
  useEffect(() => {
    const all = getAllPaperFeedback(code);
    // localStorage 는 화면이 뜬 뒤에만 읽을 수 있음
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(all);
    const first = students.find(s => !all[s.num]?.sentAt);
    if (first) setSelected(first.num);
    setLoaded(true);
  }, [code, students]);

  const statusOf = useCallback((num: number): Status => {
    const d = data[num];
    if (!d || !d.photo) return 'none';
    return d.sentAt ? 'sent' : 'photo';
  }, [data]);

  const sentCount = students.filter(s => statusOf(s.num) === 'sent').length;
  const counts = {
    none: students.filter(s => statusOf(s.num) === 'none').length,
    photo: students.filter(s => statusOf(s.num) === 'photo').length,
    sent: sentCount,
  };

  const current = students.find(s => s.num === selected) ?? students[0];
  const saved = current ? data[current.num] : undefined;
  const draft: Draft = (current && drafts[current.num]) ?? {
    praise: saved?.praise ?? [],
    comment: saved?.comment ?? '',
    retryItems: saved?.retryItems ?? [],
  };
  const photo = saved?.photo ?? '';

  const updateDraft = (patch: Partial<Draft>) => {
    if (!current) return;
    setDrafts(prev => ({ ...prev, [current.num]: { ...draft, ...patch } }));
  };

  // Esc 로 확대 닫기
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const persist = (record: PaperFeedback): boolean => {
    const ok = savePaperFeedback(code, record);
    if (!ok) { setError(SAVE_FAIL_MSG); return false; }
    setError(null);
    setData(prev => ({ ...prev, [record.num]: record }));
    return true;
  };

  const baseRecord = (): PaperFeedback => ({
    sheetId: SHEET_ID,
    num: current.num,
    name: current.name,
    photo: '',
    praise: draft.praise,
    comment: draft.comment,
    retryItems: draft.retryItems,
    sentAt: null,
    viewed: false,
  });

  /* 사진 올리기 */
  const handleFile = async (file: File | undefined | null) => {
    if (!file || !current) return;
    if (!file.type.startsWith('image/')) {
      setError('사진 파일만 올릴 수 있어요.');
      return;
    }
    setBusy(true);
    try {
      const src = await readFile(file);
      const jpeg = await toJpeg(src);
      // 다시 올리면 보내기 전 상태로 돌아간다 (다시 보내야 학생에게 바뀐 사진이 간다)
      persist({ ...baseRecord(), ...(saved ?? {}), ...draft, photo: jpeg, sentAt: null, viewed: false });
    } catch {
      setError('이 사진은 열 수 없어요. 다른 사진으로 올려 주세요.');
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = '';
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const rotateLeft = async () => {
    if (!saved?.photo) return;
    setBusy(true);
    try {
      const jpeg = await toJpeg(saved.photo, -90);
      persist({ ...saved, photo: jpeg });
    } catch {
      setError(SAVE_FAIL_MSG);
    } finally {
      setBusy(false);
    }
  };

  /* 보내기 */
  const hasContent = draft.praise.length > 0 || draft.comment.trim().length > 0;
  const blockReason = !photo
    ? '사진을 먼저 올려 주세요.'
    : !hasContent
      ? '칭찬을 고르거나 코멘트를 써 주세요.'
      : null;

  const send = (goNext: boolean) => {
    if (blockReason || !current || !saved) return;
    const record: PaperFeedback = {
      ...saved,
      praise: draft.praise,
      comment: draft.comment.trim(),
      retryItems: [...draft.retryItems].sort((a, b) => a - b),
      sentAt: new Date().toISOString(),
      viewed: false,
    };
    if (!persist(record)) return;
    setDrafts(prev => { const n = { ...prev }; delete n[current.num]; return n; });
    showToast(`${current.name}에게 피드백을 보냈어요`);
    if (goNext) {
      const after = { ...data, [record.num]: record };
      const idx = students.findIndex(s => s.num === current.num);
      const order = [...students.slice(idx + 1), ...students.slice(0, idx)];
      const next = order.find(s => !after[s.num]?.photo);
      if (next) setSelected(next.num);
    }
  };

  const status = current ? statusOf(current.num) : 'none';

  return (
    <div className="p-main">
      <style>{`
        .pf-body { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; }
        .pf-roster { position: sticky; top: 20px; }
        .pf-cell:focus-visible, .pf-chip:focus-visible, .pf-btn:focus-visible { outline: 3px solid #b197fc; outline-offset: 2px; }
        .pf-btn:not(:disabled):hover { filter: brightness(.96); }
        .pf-btn:disabled { opacity: .4; cursor: not-allowed; }
        @media (max-width: 900px) {
          .pf-body { grid-template-columns: 1fr; }
          .pf-roster { position: static; }
        }
      `}</style>

      {/* 위치 표시 */}
      <nav className="crumb">
        <Link href="/class">수업 관리</Link>
        <span aria-hidden="true">›</span>
        <span>종이 제출 피드백</span>
      </nav>

      {/* 머리 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: INK, letterSpacing: '-0.03em' }}>
            종이 제출 피드백
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: INK2, wordBreak: 'keep-all' }}>
            {CLASS_LABEL} · {SHEET_TITLE}
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          height: 40, padding: '0 16px', borderRadius: 12,
          background: '#fff', border: `1px solid ${LINE}`,
          fontSize: 14, fontWeight: 700, color: INK2,
        }}>
          보낸 피드백
          <span style={{ fontSize: 17, fontWeight: 850, color: sentCount > 0 ? GREEN : INK }}>
            {sentCount}<span style={{ color: '#9aa3b5', fontWeight: 700 }}>/{total}</span>
          </span>
        </div>
      </div>

      <div className="pf-body">
        {/* ── 왼쪽: 반 명단 ── */}
        <aside className="pf-roster" style={{
          background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>{CLASS_LABEL} 학생 {total}명</span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: INK2, marginBottom: 12, flexWrap: 'wrap' }}>
            <Legend color="#c4cad6" label="사진 없음" n={counts.none} />
            <Legend color={ORANGE} label="사진만" n={counts.photo} />
            <Legend color={GREEN} label="보냄" n={counts.sent} />
          </div>
          <div role="listbox" aria-label="학생 명단" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {students.map(s => {
              const st = statusOf(s.num);
              const on = s.num === selected;
              return (
                <button
                  key={s.num}
                  type="button"
                  role="option"
                  aria-selected={on}
                  className="pf-cell"
                  onClick={() => { setSelected(s.num); setError(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    height: 40, padding: '0 8px 0 10px', borderRadius: 10,
                    border: on ? `2px solid ${PURPLE}` : `1px solid ${LINE}`,
                    background: on ? '#f3f0ff' : st === 'sent' ? '#f4fbf5' : '#fff',
                    cursor: 'pointer', textAlign: 'left', font: 'inherit',
                    margin: on ? 0 : 1, // 테두리 두께 차이 보정
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: on ? PURPLE : '#9aa3b5', width: 18 }}>
                    {String(s.num).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: on ? 800 : 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.name}
                  </span>
                  <StatusDot status={st} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── 오른쪽: 작업 영역 ── */}
        <section style={{
          background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: '20px 24px 22px',
          minWidth: 0,
        }}>
          {current && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 18, fontWeight: 850, color: INK, letterSpacing: '-0.02em' }}>
                  {String(current.num).padStart(2, '0')} {current.name}
                </span>
                <StatusPill status={status} />
              </div>

              {error && (
                <div role="alert" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#fff5f5', border: `1px solid #ffa8a8`, color: RED,
                  borderRadius: 12, padding: '10px 14px', marginBottom: 14,
                  fontSize: 13.5, fontWeight: 700,
                }}>
                  <span aria-hidden="true" style={{
                    width: 18, height: 18, borderRadius: '50%', background: RED, color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900,
                  }}>!</span>
                  {error}
                </div>
              )}

              {/* 숨긴 파일 입력 */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
                onChange={e => handleFile(e.target.files?.[0])} />
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={e => handleFile(e.target.files?.[0])} />

              {/* 사진 */}
              {!loaded ? (
                <div style={{ height: 300, borderRadius: 16, background: '#f3f5fa' }} />
              ) : !photo ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                  style={{
                    border: `2px dashed ${dragOver ? PURPLE : '#c4cad6'}`,
                    background: dragOver ? '#f3f0ff' : '#f7f8fb',
                    borderRadius: 16, minHeight: 300, padding: 24,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
                    transition: 'background .15s, border-color .15s',
                  }}
                >
                  <span style={{ color: dragOver ? PURPLE : '#9aa3b5' }}><IconPaper /></span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 4 }}>
                      {busy ? '사진을 줄이는 중…' : '종이 활동지 사진을 올려 주세요'}
                    </div>
                    <div style={{ fontSize: 13, color: INK2 }}>사진을 여기로 끌어다 놓아도 돼요</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button type="button" className="pf-btn" disabled={busy} onClick={() => cameraRef.current?.click()} style={btnStyle('solid')}>
                      <IconCamera /> 사진 찍기
                    </button>
                    <button type="button" className="pf-btn" disabled={busy} onClick={() => fileRef.current?.click()} style={btnStyle('outline')}>
                      <IconFolder /> 파일에서 고르기
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setZoom(true)}
                    aria-label="사진 크게 보기"
                    style={{
                      display: 'block', width: '100%', padding: 0, border: `1px solid ${LINE}`,
                      borderRadius: 16, background: '#eef1f6', cursor: 'zoom-in', overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`${current.name} 종이 활동지 사진`}
                      style={{ display: 'block', width: '100%', height: 360, objectFit: 'contain' }} />
                  </button>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                    <button type="button" className="pf-btn" disabled={busy} onClick={rotateLeft} style={btnStyle('small')}>
                      <IconRotate /> 왼쪽으로 돌리기
                    </button>
                    <button type="button" className="pf-btn" disabled={busy} onClick={() => fileRef.current?.click()} style={btnStyle('small')}>
                      <IconUpload /> 다시 올리기
                    </button>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9aa3b5' }}>사진을 누르면 크게 보여요</span>
                  </div>
                </div>
              )}

              {/* 피드백 쓰기 */}
              <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 20, paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="칭찬" hint="여러 개 고를 수 있어요">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PAPER_PRAISE_OPTIONS.map(p => {
                      const on = draft.praise.includes(p);
                      return (
                        <button key={p} type="button" className="pf-chip" aria-pressed={on}
                          onClick={() => updateDraft({ praise: on ? draft.praise.filter(x => x !== p) : [...draft.praise, p] })}
                          style={{
                            height: 38, padding: '0 14px', borderRadius: 10, cursor: 'pointer', font: 'inherit',
                            fontSize: 13.5, fontWeight: 700,
                            border: on ? `1.5px solid ${PURPLE}` : `1px solid ${LINE}`,
                            background: on ? '#f3f0ff' : '#fff',
                            color: on ? PURPLE : INK2,
                          }}>
                          {on && <span aria-hidden="true" style={{ marginRight: 4 }}>✓</span>}{p}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="코멘트">
                  <textarea
                    value={draft.comment}
                    onChange={e => updateDraft({ comment: e.target.value })}
                    placeholder="학생에게 한두 문장으로 써 주세요"
                    rows={3}
                    style={{
                      width: '100%', boxSizing: 'border-box', resize: 'vertical',
                      border: `1px solid ${LINE}`, borderRadius: 12, padding: '10px 12px',
                      font: 'inherit', fontSize: 14.5, lineHeight: 1.6, color: INK, wordBreak: 'keep-all',
                    }}
                  />
                </Field>

                <Field label="다시 볼 문항" hint="고르면 학생 화면에 주황으로 표시돼요">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {RETRY_NUMBERS.map(n => {
                      const on = draft.retryItems.includes(n);
                      return (
                        <button key={n} type="button" className="pf-chip" aria-pressed={on} aria-label={`${n}번 문항`}
                          onClick={() => updateDraft({ retryItems: on ? draft.retryItems.filter(x => x !== n) : [...draft.retryItems, n] })}
                          style={{
                            width: 44, height: 40, borderRadius: 10, cursor: 'pointer', font: 'inherit',
                            fontSize: 15, fontWeight: 800,
                            border: on ? `1.5px solid ${ORANGE}` : `1px solid ${LINE}`,
                            background: on ? ORANGE : '#fff',
                            color: on ? '#fff' : INK2,
                          }}>
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              {/* 버튼 줄 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
                <button type="button" className="pf-btn" disabled={!!blockReason} onClick={() => send(false)} style={btnStyle('gray')}>
                  보내기만
                </button>
                <span style={{ flex: 1, fontSize: 12.5, color: blockReason ? INK2 : 'transparent', fontWeight: 700, textAlign: 'right', wordBreak: 'keep-all' }}>
                  {blockReason ?? '.'}
                </span>
                <button type="button" className="pf-btn" disabled={!!blockReason} onClick={() => send(true)} style={btnStyle('solid')}>
                  보내고 다음 학생
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* 사진 확대 */}
      {zoom && photo && (
        <div
          role="dialog" aria-modal="true" aria-label="사진 크게 보기"
          onClick={() => setZoom(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,20,35,.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,.4)' }} />
          <button type="button" autoFocus onClick={() => setZoom(false)} style={{
            position: 'fixed', top: 20, right: 24, height: 40, padding: '0 16px', borderRadius: 10,
            border: 0, background: '#fff', color: INK, fontWeight: 800, cursor: 'pointer', font: 'inherit',
          }}>닫기</button>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div role="status" style={{
          position: 'fixed', left: '50%', bottom: 32, transform: 'translateX(-50%)', zIndex: 110,
          background: INK, color: '#fff', borderRadius: 12, padding: '12px 18px',
          fontSize: 14, fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span aria-hidden="true" style={{
            width: 18, height: 18, borderRadius: '50%', background: '#51cf66', color: INK,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900,
          }}>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── 작은 부품 ───────────────────────────────────────────── */
function Legend({ color, label, n }: { color: string; label: string; n: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label} {n}
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    none: { t: '사진 없음', bg: '#f1f3f5', c: INK2 },
    photo: { t: '사진만 올림', bg: '#fff4e6', c: '#b35c00' },
    sent: { t: '보냄', bg: '#ebfbee', c: GREEN },
  }[status];
  return (
    <span style={{
      height: 24, padding: '0 10px', borderRadius: 999, background: map.bg, color: map.c,
      fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center',
    }}>{map.t}</span>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>{label}</span>
        {hint && <span style={{ fontSize: 12, color: '#9aa3b5' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function btnStyle(kind: 'solid' | 'outline' | 'gray' | 'small'): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 12, cursor: 'pointer', font: 'inherit', fontWeight: 800, whiteSpace: 'nowrap',
  };
  if (kind === 'solid') return { ...base, height: 44, padding: '0 20px', fontSize: 14.5, border: 0, background: PURPLE, color: '#fff' };
  if (kind === 'outline') return { ...base, height: 44, padding: '0 18px', fontSize: 14.5, border: `1.5px solid ${PURPLE}`, background: '#fff', color: PURPLE };
  if (kind === 'gray') return { ...base, height: 44, padding: '0 18px', fontSize: 14.5, border: `1px solid ${LINE}`, background: '#f1f3f5', color: INK2 };
  return { ...base, height: 34, padding: '0 12px', fontSize: 12.5, borderRadius: 9, border: `1px solid ${LINE}`, background: '#fff', color: INK2, fontWeight: 700 };
}
