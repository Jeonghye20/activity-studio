'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Worksheet, CurriculumUnit, Block } from '@/types/worksheet';
import TypeCover from '@/components/TypeCover';
import WorksheetViewer from '@/components/WorksheetViewer';
import Stepper from '@/components/Stepper';
import { addMySheet } from '@/app/(teacher)/my-sheets/MySheetsClient';
import type { TypeKey } from '@/lib/types';

type Step = 1 | 2 | 3 | 4;
type EditTab = 'edit' | 'ai';

const STEPS = [
  { label: '내용 수정' },
  { label: '정답 확인' },
  { label: '저장' },
  { label: '배포' },
];

/* 미리 준비한 AI 제안 (시연용) */
const AI_SUGGESTIONS: { q: RegExp; reply: string; proposal?: { before: string; after: string } }[] = [
  {
    q: /목표|goal/i,
    reply: '학습목표를 "~할 수 있다."로 끝나게 다듬으면 어떨까요?',
    proposal: {
      before: '현재 학습목표',
      after: 'AND·OR 연산을 활용해 조건을 분석하고, 다양한 상황에 적용할 수 있다.',
    },
  },
  {
    q: /힌트|hint/i,
    reply: '힌트가 답을 너무 직접적으로 알려주지 않도록 바꿔 드릴게요.',
    proposal: {
      before: '각 조건이 참인지 거짓인지 먼저 써 보세요.',
      after: '조건 하나씩 나눠서 각각 참/거짓을 먼저 정해 보세요.',
    },
  },
  {
    q: /문항|문구|prompt/i,
    reply: '문항을 더 명확하게 바꿔 드릴게요.',
    proposal: {
      before: '다음 중 올바른 것을 고르세요.',
      after: '다음 중 AND 연산의 결과가 참(True)인 것을 고르세요.',
    },
  },
  {
    q: /짧게|간단|요약/i,
    reply: '활동지 전체를 짧게 요약할 수는 없어요. 특정 문항이나 학습목표를 지정해 주시면 수정할 수 있어요.',
    proposal: undefined,
  },
];

const AI_SUGGESTIONS_CHIPS = [
  '학습목표 다듬어 줘',
  '1번 문항 힌트 수정',
  '3번 문항 문구 명확하게',
];

function resolveAI(q: string) {
  const match = AI_SUGGESTIONS.find(s => s.q.test(q));
  return match ?? { reply: '더 쉬운 예시를 추가하거나 문항 표현을 다듬을 수 있어요. 어떤 부분을 바꾸고 싶으신가요?', proposal: undefined };
}

/* ── 메인 컴포넌트 ── */
interface Props {
  sheet: Worksheet;
  units: CurriculumUnit[];
}

export default function EditClient({ sheet, units }: Props) {
  const [step, setStep]               = useState<Step>(1);
  const [goal, setGoal]               = useState(sheet.goal);
  const [activeTab, setActiveTab]     = useState<EditTab>('edit');
  const [selectedTarget, setSelected] = useState<string>('whole');
  const [aiQuery, setAiQuery]         = useState('');
  const [aiChat, setAiChat]           = useState<{ role: 'me' | 'ai'; text: string; proposal?: { before: string; after: string } }[]>([]);
  const [aiLoading, setAiLoading]     = useState(false);
  const [shareMode, setShareMode]     = useState<'none' | 'national'>('none');
  const [blockEdits, setBlockEdits]   = useState<Record<string, { prompt?: string; hint?: string; hidden?: boolean }>>({});
  const [answerEdits, setAnswerEdits] = useState<Record<string, { confirmed: boolean; value: string }>>({});

  const allBlocks: Block[] = sheet.sections.flatMap(sec => sec.blocks);
  const editableBlocks = allBlocks.filter(b => b.method !== 'note');
  const selectedBlock = selectedTarget === 'whole' ? null : allBlocks.find(b => b.id === selectedTarget);

  function handleAI(q?: string) {
    const query = (q ?? aiQuery).trim();
    if (!query) return;
    setAiChat(prev => [...prev, { role: 'me', text: query }]);
    setAiQuery('');
    setAiLoading(true);
    setTimeout(() => {
      const { reply, proposal } = resolveAI(query);
      setAiChat(prev => [...prev, { role: 'ai', text: reply, proposal }]);
      setAiLoading(false);
    }, 700);
  }

  /* 정답 확인 필요 블록들 */
  const gradableBlocks = allBlocks.filter(b =>
    !['note', 'story'].includes(b.method) &&
    !('graded' in b && (b as any).graded === false)
  );
  const changedBlocks = gradableBlocks.filter(b => !!blockEdits[b.id]?.prompt);
  const allConfirmed = changedBlocks.every(b => answerEdits[b.id]?.confirmed);

  /* ─ 단계 1: 내용 수정 ─ */
  const step1 = (
    <div className="ed">
      {/* 왼쪽: 미리보기 */}
      <div className="paper" style={{ minHeight: 400 }}>
        <WorksheetViewer sheet={sheet} showAnswers={false} units={units} />
      </div>

      {/* 오른쪽: 편집 패널 */}
      <div className="epanel">
        {/* 대상 칩 */}
        <div className="ep-target">
          <span>편집 대상</span>
          <button
            onClick={() => setSelected('whole')}
            className={`tchip${selectedTarget === 'whole' ? '' : ''}`}
            style={{
              background: selectedTarget === 'whole' ? 'var(--ink)' : undefined,
              color: selectedTarget === 'whole' ? '#fff' : undefined,
            }}
          >
            활동지 전체
          </button>
          {editableBlocks.map((b, i) => (
            <button
              key={b.id}
              className="tchip"
              onClick={() => setSelected(b.id)}
              style={{
                background: selectedTarget === b.id ? 'var(--ink)' : undefined,
                color: selectedTarget === b.id ? '#fff' : undefined,
              }}
            >
              {i + 1}번
            </button>
          ))}
        </div>

        {/* 탭 */}
        <div className="ep-tabs">
          {(['edit', 'ai'] as EditTab[]).map(tab => (
            <button
              key={tab}
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'edit' ? '편집' : 'AI로 고치기'}
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        <div className="ep-body">
          {activeTab === 'edit' && (
            <div>
              {selectedTarget === 'whole' ? (
                <>
                  <div className="efield">
                    <label htmlFor="goal-input">학습목표</label>
                    <textarea
                      id="goal-input"
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      rows={3}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                      &apos;~할 수 있다.&apos;로 끝나게 써 주세요.
                    </p>
                  </div>
                  <div style={{ padding: '12px 14px', background: 'var(--canvas)', borderRadius: 12, fontSize: 13, color: 'var(--ink-3)' }}>
                    개별 문항을 선택해 문구와 내용을 바꿀 수 있어요.
                    활동 방법·유형은 바꿀 수 없어요.
                  </div>
                  <div className="efield" style={{ marginTop: 14 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
                      마지막 &apos;한 줄 정리&apos; 포함
                    </label>
                  </div>
                </>
              ) : selectedBlock ? (
                <>
                  <div className="efield">
                    <label>문항 지시문</label>
                    <textarea
                      value={blockEdits[selectedBlock.id]?.prompt ?? selectedBlock.prompt}
                      onChange={e => setBlockEdits(p => ({ ...p, [selectedBlock.id]: { ...p[selectedBlock.id], prompt: e.target.value } }))}
                      rows={4}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                      활동 방법·유형은 바꿀 수 없어요.
                    </p>
                  </div>
                  {selectedBlock.hint !== undefined && (
                    <div className="efield">
                      <label>힌트</label>
                      <textarea
                        value={blockEdits[selectedBlock.id]?.hint ?? (selectedBlock.hint || '')}
                        onChange={e => setBlockEdits(p => ({ ...p, [selectedBlock.id]: { ...p[selectedBlock.id], hint: e.target.value } }))}
                        rows={2}
                        placeholder="비우면 힌트가 보이지 않아요."
                      />
                    </div>
                  )}
                  <div className="efield">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!!blockEdits[selectedBlock.id]?.hidden}
                        onChange={e => setBlockEdits(p => ({ ...p, [selectedBlock.id]: { ...p[selectedBlock.id], hidden: e.target.checked } }))}
                        style={{ width: 16, height: 16 }}
                      />
                      이 문항 숨기기
                    </label>
                    <p style={{ margin: '4px 0 0 24px', fontSize: 12, color: 'var(--ink-3)' }}>
                      숨기면 번호가 다시 매겨져요.
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              {/* 추천 질문 칩 */}
              <div className="qsug">
                {AI_SUGGESTIONS_CHIPS.map(c => (
                  <button
                    key={c}
                    className="btn sm ghost"
                    style={{ fontSize: 13 }}
                    onClick={() => { setAiQuery(c); handleAI(c); }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* 대화 */}
              <div className="chat" style={{ marginTop: 12 }}>
                {aiChat.map((m, i) => (
                  <div key={i}>
                    <div className={`msg ${m.role}`}>{m.text}</div>
                    {m.role === 'ai' && m.proposal && (
                      <div className="proposal">
                        <div className="diff">
                          <del>{m.proposal.before}</del>
                          {' → '}
                          <ins>{m.proposal.after}</ins>
                        </div>
                        <div className="acts">
                          <button
                            className="btn sm primary"
                            onClick={() => {
                              if (selectedTarget === 'whole') setGoal(m.proposal!.after);
                              setAiChat(prev => prev.filter((_, j) => j !== i));
                            }}
                          >
                            적용
                          </button>
                          <button className="btn sm ghost">취소</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="msg ai" style={{ color: 'var(--ink-3)' }}>AI가 제안을 만들고 있어요…</div>
                )}
              </div>

              {/* 입력창 */}
              <div className="ask2" style={{ marginTop: 14 }}>
                <input
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAI()}
                  placeholder="어떻게 고칠까요?"
                />
                <button
                  className="btn primary"
                  onClick={() => handleAI()}
                  disabled={!aiQuery.trim() || aiLoading}
                >
                  보내기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="ep-foot">
          <Link href={`/worksheets/${sheet.id}`} className="btn ghost" style={{ textDecoration: 'none' }}>
            취소
          </Link>
          <button className="btn primary" onClick={() => setStep(2)}>
            다음: 정답 확인
          </button>
        </div>
      </div>
    </div>
  );

  /* ─ 단계 2: 정답 확인 ─ */
  const step2 = (
    <div className="sv">
      {/* 왼쪽: 변경된 문항들 */}
      <div>
        {/* 안내 배너 */}
        <div style={{
          background: '#fffbe8', border: '1.5px dashed #e5c84a', borderRadius: 14,
          padding: '14px 18px', marginBottom: 18,
          fontSize: 14, color: '#7a5900',
        }}>
          내 사본에서 고치는 중 · 원본 &apos;{sheet.title}&apos;은 그대로 남아요.
        </div>

        {changedBlocks.length === 0 ? (
          <div style={{ padding: '28px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
            수정한 문항이 없어요. 원본 정답이 그대로 사용돼요.
          </div>
        ) : (
          <div className="diffs">
            {changedBlocks.map((b, i) => {
              const rec = answerEdits[b.id];
              return (
                <div key={b.id} className={`dcard${rec?.confirmed ? '' : ' need'}`}>
                  <h3>
                    {i + 1}번 문항
                    {!rec?.confirmed && (
                      <span className="warn-badge" style={{
                        display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 9px',
                        borderRadius: 7, background: '#fff4e6', color: '#b35a00',
                        fontSize: 12.5, fontWeight: 800,
                      }}>
                        정답 확인 필요
                      </span>
                    )}
                    {rec?.confirmed && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 9px',
                        borderRadius: 7, background: '#ebfbee', color: '#2b8a3e',
                        fontSize: 12.5, fontWeight: 800,
                      }}>
                        확인됨
                      </span>
                    )}
                  </h3>
                  <div className="dcmp">
                    <div>
                      <small>원본 문항</small>
                      {b.prompt}
                    </div>
                    <div className="mine">
                      <small>수정된 문항</small>
                      {blockEdits[b.id]?.prompt}
                    </div>
                  </div>
                  <div className="confirm-row">
                    <div className="price">
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>새 정답</label>
                      <input
                        value={rec?.value ?? ''}
                        onChange={e => setAnswerEdits(p => ({ ...p, [b.id]: { confirmed: false, value: e.target.value } }))}
                        placeholder="정답을 직접 입력하세요"
                        disabled={rec?.confirmed}
                      />
                    </div>
                    {!rec?.confirmed ? (
                      <button
                        className="btn primary"
                        onClick={() => setAnswerEdits(p => ({ ...p, [b.id]: { ...p[b.id], confirmed: true } }))}
                        disabled={!rec?.value?.trim()}
                      >
                        확인
                      </button>
                    ) : (
                      <button
                        className="btn ghost"
                        onClick={() => setAnswerEdits(p => ({ ...p, [b.id]: { ...p[b.id], confirmed: false } }))}
                      >
                        수정
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button className="btn ghost" onClick={() => setStep(1)}>내용 수정</button>
          <button
            className="btn primary"
            onClick={() => setStep(3)}
            disabled={changedBlocks.length > 0 && !allConfirmed}
          >
            다음: 저장
          </button>
        </div>
      </div>

      {/* 오른쪽: 저장 카드 */}
      <div className="savecard">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          <div style={{ aspectRatio: '2/1', borderRadius: 0 }}>
            <TypeCover type={sheet.type as TypeKey} block={false} />
          </div>
          <div style={{ padding: '16px 18px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800 }}>{sheet.title} <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>(내 사본)</span></p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)' }}>
              수정 문항 {changedBlocks.length}개 · 숨긴 문항 {Object.values(blockEdits).filter(e => e.hidden).length}개
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─ 단계 3: 저장 ─ */
  const step3 = (
    <div style={{ maxWidth: 680 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '24px 28px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>내 자료에 저장할까요?</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-3)' }}>
          {sheet.title} (내 사본) · 수정 문항 {changedBlocks.length}개
        </p>

        {/* 공유 선택 */}
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: 'var(--ink-2)' }}>공유</p>
        <div className="share-opt">
          {(['none', 'national'] as const).map(m => (
            <button
              key={m}
              className="ocard"
              aria-pressed={shareMode === m}
              onClick={() => setShareMode(m)}
            >
              <b>{m === 'none' ? '공유 안 함' : '전국 공유'}</b>
              <small>{m === 'none' ? '나만 볼 수 있어요.' : '전국 정보 선생님의 홈에 보여요.'}</small>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button className="btn ghost" onClick={() => setStep(2)}>정답 확인</button>
          <button
            className="btn primary"
            onClick={() => {
              addMySheet({
                id: `edit-${sheet.id}-${Date.now()}`,
                worksheetId: sheet.id,
                title: `${sheet.title} (내 사본)`,
                type: sheet.type,
                unit: sheet.unit,
                source: 'edit',
                savedAt: new Date().toISOString().slice(0, 10),
                shared: shareMode === 'national',
              });
              setStep(4);
            }}
          >
            내 자료에 저장
          </button>
        </div>
      </div>
    </div>
  );

  /* ─ 단계 4: 저장 완료 → 배포로 ─ */
  const step4 = (
    <div style={{ maxWidth: 680 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ebfbee', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M5 12l4 4L19 8" stroke="#2b8a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>내 자료에 저장했어요</h2>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-3)' }}>{sheet.title} (내 사본)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <Link href="/my-sheets" className="btn ghost" style={{ textDecoration: 'none' }}>
            내 자료에서 보기
          </Link>
          <Link href={`/worksheets/${sheet.id}/deploy`} className="btn primary" style={{ textDecoration: 'none' }}>
            배포하기
          </Link>
        </div>
      </div>
    </div>
  );

  const isStep1FullHeight = step === 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: isStep1FullHeight ? 'hidden' : 'auto' }}>
      {/* 상단 바 */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '14px 28px', background: 'var(--surface)', flexShrink: 0 }}>
        <nav className="crumb" aria-label="breadcrumb" style={{ marginBottom: 12 }}>
          <Link href={`/worksheets/${sheet.id}`}>{sheet.title}</Link>
          <span aria-hidden="true">›</span>
          <span>고쳐서 배포</span>
        </nav>
        <Stepper steps={STEPS} current={step} onStepClick={n => setStep(n as Step)} />
      </div>

      {/* 본문 */}
      {isStep1FullHeight ? (
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 28px 28px' }}>
          {step1}
        </div>
      ) : (
        <div style={{ padding: '24px 28px 48px' }}>
          {step === 2 && step2}
          {step === 3 && step3}
          {step === 4 && step4}
        </div>
      )}
    </div>
  );
}
