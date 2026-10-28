'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Stepper from '@/components/Stepper';
import TypeCover from '@/components/TypeCover';
import type { WorksheetType } from '@/types/worksheet';
import type { TypeKey } from '@/lib/types';
import { addMySheet } from '../MySheetsClient';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { label: '유형 고르기' },
  { label: '채우기' },
  { label: '정답·힌트' },
  { label: '미리보기·저장' },
];

interface TypeOption {
  type: WorksheetType | 'free';
  label: string;
  desc: string;
  recommended?: boolean;
}

const TYPE_OPTIONS: TypeOption[] = [
  { type: 'concept',    label: '개념 확인',      desc: '배운 개념을 확인하고 적용' },
  { type: 'escape',     label: '탈출 게임',      desc: '관문을 통과하며 금고 열기' },
  { type: 'mystery',    label: '추리 게임',      desc: '단서를 모아 사건 해결' },
  { type: 'analysis',   label: '자료 분석',      desc: '데이터와 자료를 해석', recommended: true },
  { type: 'practice',   label: '실습 기록',      desc: '실습 과정과 결과 기록' },
  { type: 'discussion', label: '토론·의견',      desc: '의견을 쓰고 근거 정리' },
  { type: 'free',       label: '자유형 (빈 틀)',  desc: '유형 없이 자유롭게 구성' },
];

export default function NewSheetClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  /* Step 1 */
  const [selectedType, setSelectedType] = useState<WorksheetType | 'free' | null>(null);

  /* Step 2 */
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [concept, setConcept] = useState('');
  const [questions, setQuestions] = useState<string[]>(['', '', '']);
  const [qCount, setQCount] = useState(1);

  /* Step 3 */
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [hint, setHint] = useState('');

  /* Step 4 */
  const [printMode, setPrintMode] = useState<'paper' | 'screen'>('paper');
  const [shareMode, setShareMode] = useState<'none' | 'public'>('none');

  function nextStep() { if (step < 4) setStep(s => (s + 1) as Step); }
  function prevStep() { if (step > 1) setStep(s => (s - 1) as Step); }

  function handleSave() {
    const effectiveType: WorksheetType = selectedType === 'free' || !selectedType ? 'concept' : selectedType;
    addMySheet({
      id: `my-${Date.now()}`,
      worksheetId: 'ws-cs-escape',
      title: title.trim() || '(제목 없음)',
      type: effectiveType,
      unit: '',
      source: 'create',
      savedAt: new Date().toISOString(),
      shared: shareMode === 'public',
    });
    router.push('/my-sheets');
  }

  const filledQs = questions.slice(0, qCount).filter(q => q.trim() !== '');

  return (
    <div className="p-main">
      <nav className="crumb">
        <Link href="/my-sheets">내 자료</Link>
        <span aria-hidden="true">›</span>
        <span>활동지 만들기</span>
      </nav>

      <div className="page-head">
        <h1>활동지 만들기</h1>
      </div>

      <Stepper steps={STEPS} current={step} onStepClick={n => setStep(n as Step)} />

      {/* ── Step 1: 유형 고르기 ── */}
      {step === 1 && (
        <div>
          <div className="mk-types">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.type}
                className="mtype"
                aria-pressed={selectedType === opt.type}
                onClick={() => setSelectedType(opt.type)}
              >
                {opt.recommended && (
                  <span className="rec-badge" style={{ color: 'var(--ink)' }}>추천</span>
                )}
                {opt.type === 'free' ? (
                  <div className="cover" style={{ background: 'var(--line-2)', display: 'grid', placeItems: 'center' }}>
                    <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                      <line x1="16" y1="6" x2="16" y2="26" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="6" y1="16" x2="26" y2="16" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                ) : (
                  <div className="cover">
                    <TypeCover type={opt.type as TypeKey} height={80} block={false} />
                  </div>
                )}
                <div className="t">
                  <b>{opt.label}</b>
                  <p>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mk-bar">
            <p>
              {selectedType
                ? `'${TYPE_OPTIONS.find(o => o.type === selectedType)?.label}' 유형을 골랐어요.`
                : '유형을 골라 주세요.'}
            </p>
            <button
              className="btn ghost"
              style={{ fontSize: 13 }}
            >
              파일·링크로 시작하기
            </button>
            <button
              className="btn primary"
              onClick={nextStep}
              disabled={!selectedType}
            >
              다음: 채우기
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: 채우기 ── */}
      {step === 2 && (
        <div className="mk2">
          {/* 왼쪽: 아웃라인 */}
          <div className="outline">
            <h3>구성</h3>
            <div className="ol-sec">
              <b>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                기본 정보
              </b>
              <button className={`ol-it${title.trim() ? ' on' : ''}`}>
                {title.trim() ? `제목: ${title.slice(0, 16)}` : '제목 (비어 있음)'}
              </button>
              <button className={`ol-it${goal.trim() ? ' on' : ''}`}>
                {goal.trim() ? '학습목표 입력됨' : '학습목표 (선택)'}
              </button>
            </div>
            <div className="ol-sec">
              <b>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                핵심 활동
              </b>
              {questions.slice(0, qCount).map((q, i) => (
                <button key={i} className={`ol-it${q.trim() ? ' on' : ''}`}>
                  {q.trim() ? `문항 ${i + 1} ✓` : `문항 ${i + 1} (비어 있음)`}
                </button>
              ))}
              {qCount < 3 && (
                <button
                  className="ol-add"
                  onClick={() => setQCount(n => Math.min(n + 1, 3))}
                >
                  + 문항 추가
                </button>
              )}
            </div>
          </div>

          {/* 오른쪽: 편집 */}
          <div className="mk-main">
            <div style={{ background: 'var(--canvas)', borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)', marginBottom: 4 }}>
              회색 예시 위에 그대로 덮어쓰면 돼요.
            </div>
            <Field label="활동 제목">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 조건문으로 할인 판단하기"
                className="inp"
              />
            </Field>
            <Field label="학습목표 (선택)">
              <input
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="예: 조건의 참·거짓을 판단하고 근거를 설명할 수 있다."
                className="inp"
              />
            </Field>
            <Field label="개념 한 줄 (선택)">
              <input
                value={concept}
                onChange={e => setConcept(e.target.value)}
                placeholder="예: 조건문은 조건이 참일 때만 명령을 실행한다."
                className="inp"
              />
            </Field>
            {Array.from({ length: qCount }).map((_, i) => (
              <Field key={i} label={i === 0 ? '문항 1' : `문항 ${i + 1} (선택)`}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={questions[i] ?? ''}
                    onChange={e => {
                      const next = [...questions];
                      next[i] = e.target.value;
                      setQuestions(next);
                    }}
                    placeholder={
                      i === 0 ? '예: 15세 학생의 토요일 입장료는?' :
                      i === 1 ? '예: 다음 조건 중 참인 것을 고르세요.' :
                      '예: 왜 그렇게 판단했는지 써 보세요.'
                    }
                    className="inp"
                    style={{ flex: 1 }}
                  />
                  {i > 0 && (
                    <button
                      className="btn ghost"
                      style={{ flexShrink: 0, height: 44, padding: '0 10px', fontSize: 13 }}
                      onClick={() => {
                        const next = [...questions];
                        next[i] = '';
                        setQuestions(next);
                        setQCount(n => n - 1);
                      }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </Field>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                className="btn primary"
                onClick={nextStep}
                disabled={title.trim() === '' && questions[0].trim() === ''}
              >
                다음: 정답·힌트
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: 정답·힌트 ── */}
      {step === 3 && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ background: 'var(--canvas)', borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
            쓴 문항 {filledQs.length > 0 ? filledQs.length : qCount}개의 정답을 적어요.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {Array.from({ length: qCount }).map((_, i) => {
              const qText = questions[i]?.trim();
              if (!qText && i > 0) return null;
              return (
                <div key={i}>
                  <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--ink)', color: '#fff',
                      fontSize: 12, fontWeight: 800, marginRight: 8,
                    }}>
                      {i + 1}
                    </span>
                    {qText || `문항 ${i + 1}`}
                  </p>
                  <input
                    value={answers[i] ?? ''}
                    onChange={e => {
                      const next = [...answers];
                      next[i] = e.target.value;
                      setAnswers(next);
                    }}
                    placeholder="정답 또는 모범 답안"
                    className="inp"
                  />
                </div>
              );
            })}
            <Field label="힌트 · 모든 문항 공통 (선택)">
              <input
                value={hint}
                onChange={e => setHint(e.target.value)}
                placeholder="예: 기준을 하나 정하고 나눠 보세요."
                className="inp"
              />
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn ghost" onClick={prevStep}>채우기</button>
            <button className="btn primary" onClick={nextStep}>다음: 미리보기·저장</button>
          </div>
        </div>
      )}

      {/* ── Step 4: 미리보기·저장 ── */}
      {step === 4 && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* 미리보기 */}
          <div className="paper" style={{ flex: 1, minHeight: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>
                {title.trim() || '(제목 없음)'}
              </h2>
              {selectedType && selectedType !== 'free' && (
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {TYPE_OPTIONS.find(o => o.type === selectedType)?.label}
                </span>
              )}
            </div>
            {goal.trim() && (
              <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{goal}</p>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid var(--line)', marginBottom: 20 }} />
            {Array.from({ length: qCount }).map((_, i) => {
              const qText = questions[i]?.trim();
              if (!qText) return null;
              return (
                <div key={i} style={{ marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                    <strong>{i + 1}. </strong>{qText}
                  </p>
                </div>
              );
            })}
            {!questions[0].trim() && (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)' }}>(문항 없음)</p>
            )}
          </div>

          {/* 설정 패널 */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700 }}>인쇄 여부</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['paper', 'screen'] as const).map(mode => (
                  <button
                    key={mode}
                    className="btn ghost"
                    aria-pressed={printMode === mode}
                    onClick={() => setPrintMode(mode)}
                    style={{ flex: 1, fontWeight: printMode === mode ? 800 : 600 }}
                  >
                    {mode === 'paper' ? '종이·화면' : '화면 전용'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700 }}>공유</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['none', 'public'] as const).map(mode => (
                  <button
                    key={mode}
                    className="btn ghost"
                    aria-pressed={shareMode === mode}
                    onClick={() => setShareMode(mode)}
                    style={{ flex: 1, fontWeight: shareMode === mode ? 800 : 600 }}
                  >
                    {mode === 'none' ? '공유 안 함' : '전국 공유'}
                  </button>
                ))}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                공유하면 전국 선생님의 홈에 보여요
              </p>
            </div>
            <button className="btn primary" style={{ width: '100%' }} onClick={handleSave}>
              내 자료에 저장
            </button>
            <button className="btn ghost" style={{ width: '100%' }} onClick={prevStep}>
              정답·힌트
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{label}</label>
      {children}
    </div>
  );
}
