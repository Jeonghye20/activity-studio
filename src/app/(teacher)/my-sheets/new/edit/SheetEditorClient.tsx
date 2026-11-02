'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Stepper from '@/components/Stepper';
import type {
  Block, BlockType, Sheet,
  ChoiceBlock as ChoiceT, MultiBlock as MultiT, OxBlock as OxT,
} from './types';
import { createEmptySheet, createEmptyBlock, AI_FILL_CONCEPT, AI_FILL_FREE_6 } from './demoData';
import { loadCreatedSheet, saveCreatedSheet } from './createdSheetsStore';
import MaterialCard from './MaterialCard';
import AddBlockPanel from './AddBlockPanel';
import SaveStep from './SaveStep';
import DeployStep from './DeployStep';
import BlockWrapper, { DASHED, DASHED_FOCUS, autoResize } from './blocks/BlockWrapper';
import ChoiceBlockC from './blocks/ChoiceBlock';
import MultiBlockC from './blocks/MultiBlock';
import PictureBlockC from './blocks/PictureBlock';
import LineBlockC from './blocks/LineBlock';
import OrderBlockC from './blocks/OrderBlock';
import OxBlockC from './blocks/OxBlock';
import ShortBlockC from './blocks/ShortBlock';
import BlankBlockC from './blocks/BlankBlock';
import SortBlockC from './blocks/SortBlock';
import WriteBlockC from './blocks/WriteBlock';
import DataBlockC from './blocks/DataBlock';
import LockBlockC from './blocks/LockBlock';
import OpinionBlockC from './blocks/OpinionBlock';

type EditorStep = 1 | 2 | 3;

const STEPPER_STEPS = [
  { label: '유형 고르기' },
  { label: '만들기' },
  { label: '저장' },
  { label: '배포' },
];

/* ─ 재귀적 빈 값 판단 ─ */
function isEffectivelyEmpty(v: unknown): boolean {
  if (v == null || v === '' || v === -1 || v === false) return true;
  if (Array.isArray(v)) return v.length === 0 || v.every(isEffectivelyEmpty);
  if (typeof v === 'object') return Object.values(v as Record<string, unknown>).every(isEffectivelyEmpty);
  return false;
}

/* ─ AI fill (pure) ─ */
function computeAiFill(sheet: Sheet, freeCount?: 5 | 6 | 7): {
  newBlocks: Block[]; newInfo: Sheet['info']; count: number;
} {
  if (sheet.type === 'free') {
    const cnt = freeCount ?? 6;
    let aiBlocks = [...AI_FILL_FREE_6.blocks];
    if (cnt === 5) aiBlocks = aiBlocks.filter(b => b.type !== 'line');
    else if (cnt === 7) {
      const sortIdx = aiBlocks.findIndex(b => b.type === 'data');
      aiBlocks.splice(sortIdx, 0, createEmptyBlock('sort'));
    }
    const newBlocks: Block[] = aiBlocks.map((ab, i) => {
      const ex = sheet.blocks[i];
      return (!ex || !ex.q) ? ab : ex;
    });
    const aiInfo = AI_FILL_FREE_6.info;
    return {
      newBlocks,
      newInfo: {
        unit: sheet.info.unit || aiInfo.unit,
        title: sheet.info.title || aiInfo.title,
        goal: sheet.info.goal || aiInfo.goal,
        img: sheet.info.img || aiInfo.img,
      },
      count: newBlocks.filter(b => b.aiMade).length,
    };
  }

  const aiBlocks = AI_FILL_CONCEPT.blocks;
  let filled = 0;
  const newBlocks: Block[] = sheet.blocks.map((b, i) => {
    const ai = aiBlocks[i];
    if (!ai) return b;
    const merged = { ...b } as Record<string, unknown>;
    for (const [k, v] of Object.entries(ai as Record<string, unknown>)) {
      if (k === 'id' || k === 'type') continue;
      const cur = merged[k];
      const empty = isEffectivelyEmpty(cur);
      const nonTrivial = !isEffectivelyEmpty(v);
      if (empty && nonTrivial) {
        merged[k] = v;
        if (!['hintOn', 'aiAnswered', 'aiChecked', 'aiFields', 'aiMade'].includes(k)) filled++;
      }
    }
    return merged as unknown as Block;
  });
  const aiInfo = AI_FILL_CONCEPT.info;
  return {
    newBlocks,
    newInfo: {
      unit: sheet.info.unit || aiInfo.unit,
      title: sheet.info.title || aiInfo.title,
      goal: sheet.info.goal || aiInfo.goal,
      img: sheet.info.img || aiInfo.img,
    },
    count: filled,
  };
}

export default function SheetEditorClient() {
  const params = useSearchParams();
  const typeParam = (params.get('type') ?? 'concept') as 'concept' | 'free';
  const idParam = params.get('id');
  const stepParam = params.get('step');
  const viewParam = params.get('view');

  const [sheet, setSheet] = useState<Sheet>(() => {
    if (idParam) {
      const loaded = loadCreatedSheet(idParam);
      if (loaded) return loaded;
    }
    return createEmptySheet(typeParam);
  });

  const [editorStep, setEditorStep] = useState<EditorStep>(stepParam === 'deploy' ? 3 : 1);
  const [studentView, setStudentView] = useState(viewParam === 'student');
  const [showErrors, setShowErrors] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);
  const [aiFilledCount, setAiFilledCount] = useState(0);

  const [toast, setToast] = useState<{
    block: Block; idx: number; timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => saveCreatedSheet(sheet), 600);
    return () => clearTimeout(t);
  }, [sheet]);

  /* ─ info / blocks ─ */
  function updateInfo(u: Partial<Sheet['info']>) {
    setSheet(s => ({ ...s, info: { ...s.info, ...u } }));
  }

  function updateBlock(id: string, updates: Partial<Block>) {
    setSheet(s => ({
      ...s,
      blocks: s.blocks.map(b => b.id === id ? { ...b, ...updates } as Block : b),
    }));
  }

  function deleteBlock(id: string) {
    const idx = sheet.blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const block = sheet.blocks[idx];
    if (toast) clearTimeout(toast.timer);
    const timer = setTimeout(() => setToast(null), 5000);
    setToast({ block, idx, timer });
    setSheet(s => ({ ...s, blocks: s.blocks.filter(b => b.id !== id) }));
  }

  function undoDelete() {
    if (!toast) return;
    clearTimeout(toast.timer);
    const { block, idx } = toast;
    setSheet(s => { const arr = [...s.blocks]; arr.splice(idx, 0, block); return { ...s, blocks: arr }; });
    setToast(null);
  }

  function moveBlock(id: string, dir: 'up' | 'down') {
    setSheet(s => {
      const arr = [...s.blocks];
      const i = arr.findIndex(b => b.id === id);
      if (i === -1) return s;
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, blocks: arr };
    });
  }

  function addBlock(type: BlockType) {
    setSheet(s => ({ ...s, blocks: [...s.blocks, createEmptyBlock(type)] }));
    setTimeout(() => {
      document.querySelector('[data-add-panel]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  /* ─ AI fill ─ */
  function handleAiFill(freeCount?: 5 | 6 | 7) {
    const { newBlocks, newInfo, count } = computeAiFill(sheet, freeCount);
    setSheet(s => ({ ...s, info: newInfo, blocks: newBlocks }));
    setAiFilledCount(count);
    setAiFilled(true);
  }

  /* ─ 검증 계산 (live) ─ */
  const emptyUnit  = !sheet.info.unit.trim();
  const emptyTitle = !sheet.info.title.trim();
  const emptyGoal  = !sheet.info.goal.trim();
  const emptyBlockIdxs = sheet.blocks.map((b, i) => !b.q.trim() ? i : -1).filter(i => i !== -1);
  const uncheckedAIIdxs = sheet.blocks
    .map((b, i) => (b.aiAnswered && !b.aiChecked && b.type !== 'opinion') ? i : -1)
    .filter(i => i !== -1);

  const emptyCount = (emptyUnit ? 1 : 0) + (emptyTitle ? 1 : 0) + (emptyGoal ? 1 : 0) + emptyBlockIdxs.length;
  const hasErrors = emptyCount > 0 || uncheckedAIIdxs.length > 0;

  function scrollToFirstEmpty() {
    if (emptyUnit)  { document.getElementById('info-unit')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (emptyTitle) { document.getElementById('info-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (emptyGoal)  { document.getElementById('info-goal')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (emptyBlockIdxs.length > 0) {
      document.getElementById(`block-${emptyBlockIdxs[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function scrollToFirstUnchecked() {
    if (uncheckedAIIdxs.length > 0) {
      document.getElementById(`block-${uncheckedAIIdxs[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function goToSave() {
    if (hasErrors) {
      setShowErrors(true);
      setTimeout(scrollToFirstEmpty, 50);
      return;
    }
    setShowErrors(false);
    setEditorStep(2);
  }

  /* ─ block renderer ─ */
  function renderBlockInner(b: Block): React.ReactNode {
    const sv = studentView;
    switch (b.type) {
      case 'choice':  return <ChoiceBlockC  block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'multi':   return <MultiBlockC   block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'picture': return <PictureBlockC block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'line':    return <LineBlockC    block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'order':   return <OrderBlockC   block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'ox':      return <OxBlockC      block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'short':   return <ShortBlockC   block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'blank':   return <BlankBlockC   block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'sort':    return <SortBlockC    block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'write':   return <WriteBlockC   block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'data':    return <DataBlockC    block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'lock':    return <LockBlockC    block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
      case 'opinion': return <OpinionBlockC block={b} onChange={u => updateBlock(b.id, u)} studentView={sv} />;
    }
  }

  const stepperCurrent = editorStep === 1 ? 2 : editorStep === 2 ? 3 : 4;
  const isFree = sheet.type === 'free';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ─ 상단 바 ─ */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '12px 28px', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <nav className="crumb">
            <Link href="/my-sheets">자료실</Link>
            <span aria-hidden="true">›</span>
            <span>활동지 만들기</span>
          </nav>
          <div style={{ flex: 1 }}>
            <Stepper steps={STEPPER_STEPS} current={stepperCurrent} />
          </div>
          {editorStep === 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{ fontSize: 12.5, color: '#a3abbb' }}>● 자동 저장됨</span>
              <div style={{ display: 'flex', border: '1.5px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setStudentView(false)} style={{ height: 34, padding: '0 12px', border: 0, background: !studentView ? '#eef1f6' : '#fff', fontWeight: !studentView ? 800 : 500, fontSize: 13, cursor: 'pointer' }}>편집</button>
                <button onClick={() => setStudentView(true)}  style={{ height: 34, padding: '0 12px', border: 0, borderLeft: '1px solid var(--line)', background: studentView ? '#eef1f6' : '#fff', fontWeight: studentView ? 800 : 500, fontSize: 13, cursor: 'pointer' }}>학생 화면으로 보기</button>
              </div>
              <button className="btn primary" onClick={goToSave}>다음: 저장</button>
            </div>
          )}
        </div>
      </div>

      {/* ─ 본문 ─ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 60px' }}>

        {editorStep === 1 && (
          <div style={{ maxWidth: 920, margin: '0 auto' }}>
            {/* ─ 빨간 알림 바 ─ */}
            {showErrors && hasErrors && (
              <div style={{ padding: '12px 16px', border: '1.5px solid #f03e3e', borderRadius: 12, background: '#fff5f5', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#c92a2a', flex: 1, minWidth: 200 }}>
                  {emptyCount > 0 && `비어 있는 칸 ${emptyCount}개가 있어요`}
                  {emptyCount > 0 && uncheckedAIIdxs.length > 0 && ' · '}
                  {uncheckedAIIdxs.length > 0 && `정답 확인이 필요한 문항: ${uncheckedAIIdxs.map(i => `${i + 1}번`).join(', ')}`}
                </span>
                {emptyCount > 0 && (
                  <button onClick={scrollToFirstEmpty} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1.5px solid #f03e3e', background: '#fff', color: '#c92a2a', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    빈 칸으로 이동
                  </button>
                )}
                {uncheckedAIIdxs.length > 0 && (
                  <button onClick={scrollToFirstUnchecked} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1.5px solid #f03e3e', background: '#fff', color: '#c92a2a', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    확인할 문항으로 이동
                  </button>
                )}
              </div>
            )}

            {/* 자유형 배너 */}
            {isFree && (
              <div style={{ padding: '10px 16px', borderRadius: 10, background: '#fff9db', border: '1px solid #ffe066', marginBottom: 16, fontSize: 13.5 }}>
                <b>자유형 활동지</b>예요. 아래 자료 카드에서 AI로 문항을 한 번에 만들 수 있어요. 또는 '문항 추가'로 직접 만드세요.
              </div>
            )}

            <MaterialCard
              sheetType={sheet.type}
              onFill={handleAiFill}
              loading={false}
              done={aiFilled}
              filledCount={aiFilledCount}
              onReset={() => { setAiFilled(false); setAiFilledCount(0); }}
            />

            <InfoBlock
              info={sheet.info}
              onUpdate={updateInfo}
              sheetType={sheet.type}
              studentView={studentView}
              showErrors={showErrors}
            />

            {sheet.blocks.map((b, i) => (
              <BlockWrapper
                key={b.id}
                blockId={`block-${i}`}
                index={i}
                blockType={b.type}
                q={b.q}
                onQChange={v => updateBlock(b.id, { q: v, aiFields: b.aiFields?.filter(f => f !== 'q') })}
                hint={b.hint}
                hintOn={b.hintOn}
                onHintToggle={() => updateBlock(b.id, { hintOn: !b.hintOn })}
                onHintChange={v => updateBlock(b.id, { hint: v, aiFields: b.aiFields?.filter(f => f !== 'hint') })}
                labelChip={b.aiMade ? 'ai' : null}
                aiAnswered={b.aiAnswered}
                aiChecked={b.aiChecked}
                onAiCheck={() => updateBlock(b.id, { aiChecked: true })}
                onDelete={() => deleteBlock(b.id)}
                onMoveUp={() => moveBlock(b.id, 'up')}
                onMoveDown={() => moveBlock(b.id, 'down')}
                isFirst={i === 0}
                isLast={i === sheet.blocks.length - 1}
                studentView={studentView}
                aiQField={b.aiFields?.includes('q') && !!b.aiMade}
                errorQ={showErrors && !b.q.trim()}
              >
                {renderBlockInner(b)}
              </BlockWrapper>
            ))}

            <div data-add-panel="">
              <AddBlockPanel onAdd={addBlock} />
            </div>
          </div>
        )}

        {editorStep === 2 && (
          <SaveStep sheet={sheet} blockCount={sheet.blocks.length} onBack={() => setEditorStep(1)} onSaved={() => setEditorStep(3)} />
        )}

        {editorStep === 3 && <DeployStep sheet={sheet} />}
      </div>

      {/* ─ 삭제 undo 토스트 ─ */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e2433', color: '#fff', borderRadius: 12, padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'center', fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,.3)', zIndex: 100 }}>
          <span>문항을 삭제했어요.</span>
          <button onClick={undoDelete} style={{ border: 0, background: 'none', color: '#a5b4fc', fontWeight: 800, fontSize: 14, cursor: 'pointer', padding: 0 }}>되돌리기</button>
        </div>
      )}
    </div>
  );
}

/* ─ 기본 정보 블록 ─ */
function InfoBlock({
  info, onUpdate, sheetType, studentView, showErrors,
}: {
  info: Sheet['info'];
  onUpdate: (u: Partial<Sheet['info']>) => void;
  sheetType: 'concept' | 'free';
  studentView: boolean;
  showErrors?: boolean;
}) {
  const [focus, setFocus] = useState('');

  const errUnit  = showErrors && !info.unit.trim();
  const errTitle = showErrors && !info.title.trim();
  const errGoal  = showErrors && !info.goal.trim();
  const anyErr   = errUnit || errTitle || errGoal;

  const typeChip = sheetType === 'free'
    ? { label: '자유형', bg: '#eef1f6', color: '#5d6880' }
    : { label: '개념 확인', bg: '#dbe4ff', color: '#4263eb' };

  const studentRow = (
    <div style={{ borderTop: '1px solid #e3e7ef', marginTop: 14, paddingTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
      {(['학년', '반', '번호', '이름'] as const).map(label => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12.5, color: '#5d6880', fontWeight: 700 }}>{label}</span>
          <div style={{ width: label === '이름' ? 80 : 40, height: 28, border: '1.5px solid #e3e7ef', borderRadius: 6, background: '#f8f9fa' }} />
        </div>
      ))}
    </div>
  );

  if (studentView) {
    return (
      <div style={{ border: '1.5px solid var(--line)', borderRadius: 16, background: 'var(--surface)', padding: '20px', marginBottom: 14 }}>
        <p style={{ margin: '0 0 2px', fontSize: 13, color: '#5d6880' }}>{info.unit || '단원 없음'}</p>
        <p style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>{info.title || '제목 없음'}</p>
        <p style={{ margin: 0, fontSize: 14, color: '#5d6880' }}>🎯 {info.goal || '학습목표 없음'}</p>
        {studentRow}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', border: `1.5px solid ${anyErr ? '#f03e3e' : '#e3e7ef'}`, borderRadius: 16, background: 'var(--surface)', padding: '24px 20px 16px', marginBottom: 14 }}>
      {/* 알약 라벨 */}
      <span style={{
        position: 'absolute', top: -13, left: 20,
        height: 24, padding: '0 12px', borderRadius: 12,
        background: '#172036', color: '#fff',
        fontSize: 12, fontWeight: 800,
        display: 'inline-flex', alignItems: 'center', gap: 4,
        userSelect: 'none',
      }}>🔒 기본 정보 · 삭제 불가</span>

      {/* 2열 레이아웃 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* 왼쪽: 입력 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          {/* 유형 칩 + 단원 */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ flexShrink: 0, height: 28, padding: '0 10px', borderRadius: 14, background: typeChip.bg, color: typeChip.color, fontSize: 12.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              {typeChip.label}
            </span>
            <input
              id="info-unit"
              value={info.unit}
              onChange={e => onUpdate({ unit: e.target.value })}
              onFocus={() => setFocus('unit')} onBlur={() => setFocus('')}
              placeholder="단원명을 기입하세요"
              style={{ ...DASHED, height: 36, fontSize: 13.5, flex: 1,
                background: focus === 'unit' ? '#fff' : '#fbfcfe',
                border: focus === 'unit' ? '1.5px solid #4263eb' : errUnit ? '1.5px solid #f03e3e' : '1.5px dashed #c7cedb',
              }}
            />
          </div>
          {/* 제목 */}
          <input
            id="info-title"
            value={info.title}
            onChange={e => onUpdate({ title: e.target.value })}
            onFocus={() => setFocus('title')} onBlur={() => setFocus('')}
            placeholder="제목을 기입하세요"
            style={{ ...DASHED, height: 50, fontSize: 22, fontWeight: 800,
              background: focus === 'title' ? '#fff' : '#fbfcfe',
              border: focus === 'title' ? '1.5px solid #4263eb' : errTitle ? '1.5px solid #f03e3e' : '1.5px dashed #c7cedb',
            }}
          />
          {/* 학습목표 */}
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 12.5, fontWeight: 800, color: '#5d6880' }}>학습목표</p>
            <textarea
              id="info-goal"
              value={info.goal}
              onChange={e => { onUpdate({ goal: e.target.value }); autoResize(e.target); }}
              onFocus={() => setFocus('goal')} onBlur={() => setFocus('')}
              ref={el => { if (el) autoResize(el); }}
              placeholder="학습목표를 기입하세요 ('~할 수 있다.'로 끝내기)"
              rows={2}
              style={{ ...DASHED, resize: 'none', overflow: 'hidden', minHeight: 44, fontSize: 13.5,
                background: focus === 'goal' ? '#fff' : '#fbfcfe',
                border: focus === 'goal' ? '1.5px solid #4263eb' : errGoal ? '1.5px solid #f03e3e' : '1.5px dashed #c7cedb',
              }}
            />
          </div>
        </div>

        {/* 오른쪽: 이미지 영역 (300px) */}
        <div style={{ width: 300, flexShrink: 0 }}>
          {info.img ? (
            <div style={{ height: '100%', minHeight: 150, borderRadius: 12, background: '#e7eef8', position: 'relative', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              <AiCoverSVG type={sheetType} />
              <span style={{ position: 'absolute', bottom: 8, right: 8, height: 20, padding: '0 7px', borderRadius: 10, background: '#7048e8', color: '#fff', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>AI 그림</span>
            </div>
          ) : (
            <div style={{ height: '100%', minHeight: 150, borderRadius: 12, border: '1.5px dashed #adc4f0', background: '#e7eef8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 14px', cursor: 'pointer', textAlign: 'center' }}>
              <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
                <rect x="4" y="8" width="32" height="24" rx="4" stroke="#4a90d9" strokeWidth="1.8" fill="none" opacity=".6"/>
                <circle cx="14" cy="18" r="3.5" stroke="#4a90d9" strokeWidth="1.6" fill="none" opacity=".5"/>
                <path d="M8 30 l8-8 6 6 5-5 7 7" stroke="#4a90d9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>
                <path d="M20 3 v8" stroke="#4a90d9" strokeWidth="1.8" strokeLinecap="round" opacity=".65"/>
                <path d="M17 8 l3-5 3 5" stroke="#4a90d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".65"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#4a6fa5' }}>이미지를 올리세요</span>
              <span style={{ fontSize: 11.5, color: '#5d7a9a', lineHeight: 1.55 }}>이미지가 없으면 AI가 활동지 내용을 보고 자동으로 만들어 줘요.</span>
            </div>
          )}
        </div>
      </div>

      {studentRow}
    </div>
  );
}

/* ─ AI 대표 썸네일 ─ */
function AiCoverSVG({ type }: { type: 'concept' | 'free' }) {
  if (type === 'free') {
    return (
      <svg viewBox="0 0 200 130" width="180" height="117" style={{ display: 'block' }}>
        <rect x="20" y="20" width="160" height="90" rx="10" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeDasharray="6 4"/>
        <line x1="100" y1="35" x2="100" y2="95" stroke="#adb5bd" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
        <line x1="40" y1="65" x2="160" y2="65" stroke="#adb5bd" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
        <circle cx="100" cy="65" r="6" fill="#e3e7ef"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 130" width="180" height="117" style={{ display: 'block' }}>
      {/* start oval */}
      <rect x="68" y="6" width="64" height="22" rx="11" fill="#dbe4ff" stroke="#4263eb" strokeWidth="1.5"/>
      {/* arrow */}
      <line x1="100" y1="28" x2="100" y2="44" stroke="#adb5bd" strokeWidth="1.5"/>
      <polygon points="97,42 103,42 100,48" fill="#adb5bd"/>
      {/* diamond */}
      <polygon points="100,48 138,70 100,92 62,70" fill="#fff9db" stroke="#f59f00" strokeWidth="1.5"/>
      {/* left */}
      <line x1="62" y1="70" x2="22" y2="70" stroke="#adb5bd" strokeWidth="1.5"/>
      <line x1="22" y1="70" x2="22" y2="88" stroke="#adb5bd" strokeWidth="1.5"/>
      <polygon points="19,86 25,86 22,92" fill="#adb5bd"/>
      <rect x="4" y="92" width="36" height="22" rx="6" fill="#d3f9d8" stroke="#40c057" strokeWidth="1.5"/>
      <line x1="12" y1="100" x2="32" y2="100" stroke="#40c057" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="107" x2="26" y2="107" stroke="#40c057" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
      {/* right */}
      <line x1="138" y1="70" x2="178" y2="70" stroke="#adb5bd" strokeWidth="1.5"/>
      <line x1="178" y1="70" x2="178" y2="88" stroke="#adb5bd" strokeWidth="1.5"/>
      <polygon points="175,86 181,86 178,92" fill="#adb5bd"/>
      <rect x="160" y="92" width="36" height="22" rx="6" fill="#ffe3e3" stroke="#fa5252" strokeWidth="1.5"/>
      <line x1="168" y1="100" x2="188" y2="100" stroke="#fa5252" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="168" y1="107" x2="182" y2="107" stroke="#fa5252" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
    </svg>
  );
}
