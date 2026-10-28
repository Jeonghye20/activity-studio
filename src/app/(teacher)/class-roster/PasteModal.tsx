'use client';

import { useState, useMemo } from 'react';
import type { Student } from '@/types/classRoster';
import { addStudent, updateStudent, newStudentId } from '@/lib/classRosterStore';

interface ParsedRow {
  no: number;
  name: string;
  existingName: string | null; // 같은 번호가 있을 때 기존 이름
  raw: string;
  valid: boolean;
  duplicate: boolean;
}

function parsePaste(text: string, existing: Student[]): ParsedRow[] {
  const existingByNo = new Map(existing.map(s => [s.no, s]));
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(raw => {
      const trimmed = raw.trim();
      const match = trimmed.match(/^(\d+)[\s\t]+(.+)$/);
      if (!match) return { no: 0, name: '', existingName: null, raw: trimmed, valid: false, duplicate: false };
      const no = parseInt(match[1]);
      const name = match[2].trim();
      if (!name || no < 1) return { no: 0, name: '', existingName: null, raw: trimmed, valid: false, duplicate: false };
      const existingStudent = existingByNo.get(no);
      return {
        no, name, raw: trimmed, valid: true,
        duplicate: !!existingStudent,
        existingName: existingStudent?.name ?? null,
      };
    });
}

interface Props {
  classId: string;
  existingStudents: Student[];
  onClose: () => void;
  onImported: (count: number) => void;
}

export default function PasteModal({ classId, existingStudents, onClose, onImported }: Props) {
  const [text, setText] = useState('');

  const parsed     = useMemo(() => parsePaste(text, existingStudents), [text, existingStudents]);
  const validRows  = parsed.filter(r => r.valid);
  const newRows    = validRows.filter(r => !r.duplicate);
  const updateRows = validRows.filter(r => r.duplicate);
  const invalidCount = parsed.filter(r => !r.valid).length;

  const buttonLabel = (() => {
    if (validRows.length === 0)                           return '추가할 학생이 없어요';
    if (newRows.length > 0 && updateRows.length > 0)     return `${newRows.length}명 추가 · ${updateRows.length}명 이름 바꾸기`;
    if (updateRows.length > 0)                           return `${updateRows.length}명 이름 바꾸기`;
    return `${newRows.length}명 추가`;
  })();

  function handleImport() {
    if (validRows.length === 0) return;
    const existingByNo = new Map(existingStudents.map(s => [s.no, s]));
    newRows.forEach(r => {
      addStudent(classId, { id: newStudentId(classId), no: r.no, name: r.name });
    });
    updateRows.forEach(r => {
      const existing = existingByNo.get(r.no);
      if (existing) updateStudent(classId, { ...existing, name: r.name });
    });
    onImported(validRows.length);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 540, background: '#fff', borderRadius: 'var(--r-lg)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '80vh', overflow: 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="붙여 넣기로 추가"
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>붙여 넣기로 추가</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--mute)', lineHeight: 1, padding: '4px 8px' }}
            aria-label="닫기"
          >×</button>
        </div>

        {/* 안내 */}
        <p style={{ margin: '10px 24px 0', fontSize: 13, color: 'var(--mute)', lineHeight: 1.6 }}>
          엑셀에서 번호·이름 두 열을 선택해 복사한 뒤 아래에 붙여 넣으세요.
        </p>

        {/* 본문 */}
        <div style={{ padding: '12px 24px 0', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 입력 */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"예:\n1\t김철수\n2\t이영희\n3\t박지민"}
            autoFocus
            style={{
              width: '100%', height: 140, padding: '10px 12px',
              border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
              fontSize: 13, fontFamily: 'monospace', resize: 'vertical',
              outline: 'none', boxSizing: 'border-box', lineHeight: 1.7,
            }}
          />

          {/* 미리보기 */}
          {parsed.length > 0 && (
            <div>
              {/* 건너뛰기 안내 */}
              {invalidCount > 0 && (
                <p style={{ margin: '0 0 6px', fontSize: 12.5, color: 'var(--mute)' }}>
                  읽을 수 없는 {invalidCount}줄은 건너뜁니다.
                </p>
              )}
              <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                미리보기 — {newRows.length > 0 ? `${newRows.length}명 추가` : ''}
                {newRows.length > 0 && updateRows.length > 0 ? ' · ' : ''}
                {updateRows.length > 0 ? `${updateRows.length}명 이름 수정` : ''}
              </p>
              <div style={{
                border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
                maxHeight: 220, overflowY: 'auto',
              }}>
                {parsed.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 12px',
                      borderBottom: i < parsed.length - 1 ? '1px solid var(--line)' : 'none',
                      background: row.valid ? '#fff' : 'rgba(224,49,49,0.04)',
                    }}
                  >
                    {row.valid ? (
                      <>
                        <span style={{ width: 28, textAlign: 'right', fontSize: 12.5, color: '#8a94aa', fontWeight: 300, flexShrink: 0 }}>
                          {String(row.no).padStart(2, '0')}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>
                          {row.duplicate
                            ? <>{row.existingName} <span style={{ color: 'var(--mute)', fontWeight: 400 }}>→</span> {row.name}</>
                            : row.name
                          }
                        </span>
                        {row.duplicate && (
                          <span style={{
                            fontSize: 11.5, fontWeight: 600, color: '#e8730c',
                            background: 'rgba(232,115,12,0.1)', padding: '2px 7px', borderRadius: 10,
                            flexShrink: 0,
                          }}>이름을 바꿔요</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--st-help)', flex: 1, fontFamily: 'monospace' }}>
                          × {row.raw}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--st-help)', flexShrink: 0 }}>읽을 수 없어요</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '20px 24px' }}>
          <button
            onClick={onClose}
            style={{
              height: 40, padding: '0 18px', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--line)', background: '#fff',
              fontSize: 14, cursor: 'pointer', color: 'var(--ink)',
            }}
          >취소</button>
          <button
            onClick={handleImport}
            disabled={validRows.length === 0}
            style={{
              height: 40, padding: '0 20px', borderRadius: 'var(--r-sm)',
              border: 'none',
              background: validRows.length > 0 ? 'var(--side)' : 'var(--line)',
              color: validRows.length > 0 ? '#fff' : 'var(--mute)',
              fontSize: 14, fontWeight: 700,
              cursor: validRows.length > 0 ? 'pointer' : 'default',
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
