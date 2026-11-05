'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TypeThumbnail from '@/components/TypeThumbnail';
import {
  DEMO_CURRENT_ACTIVITY,
  DEMO_TODO,
  DEMO_ALL_DONE,
  TYPE_COLORS,
  TYPE_LIGHT_COLORS,
  TYPE_LABELS,
  initDemoViewedFeedbacks,
  getStudentActivities,
  type WorksheetType,
  type StudentActivity,
  type TodoItem,
} from '@/lib/studentDemoData';

const PURPLE = '#6741d9';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function TypeChip({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? '#5d6880';
  const label = (TYPE_LABELS as Record<string, string>)[type] ?? type;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#5d6880' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: StudentActivity['status'] }) {
  if (status === 'feedback') {
    return (
      <span className="new-badge" style={{ fontSize: 10.5, padding: '1px 6px' }}>피드백 도착</span>
    );
  }
  if (status === 'resubmit') {
    return (
      <span style={{
        height: 20, padding: '0 6px', borderRadius: 5,
        background: '#f3f0ff', color: PURPLE,
        fontSize: 10.5, fontWeight: 850,
        display: 'inline-flex', alignItems: 'center',
      }}>다시 풀기 요청</span>
    );
  }
  return null;
}

function IconCheck() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#f3f0ff" />
      <polyline points="12 20 18 26 29 14" stroke={PURPLE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function sortDone(items: StudentActivity[], order: 'recent' | 'old' | 'feedback'): StudentActivity[] {
  const copy = [...items];
  if (order === 'recent') {
    return copy.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
  if (order === 'old') {
    return copy.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }
  const p: Record<StudentActivity['status'], number> = { feedback: 0, resubmit: 1, done: 2 };
  return copy.sort((a, b) => p[a.status] - p[b.status]);
}

export default function ActivitiesClient({ code }: { code: string }) {
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'info'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | WorksheetType>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'old' | 'feedback'>('recent');
  const [todoItems, setTodoItems] = useState<TodoItem[]>(DEMO_TODO);
  const [doneItems, setDoneItems] = useState<StudentActivity[]>(DEMO_ALL_DONE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initDemoViewedFeedbacks(code);
    const { doneItems, todoItems } = getStudentActivities(code);
    setDoneItems(doneItems);
    setTodoItems(todoItems);
    setMounted(true);
  }, [code]);

  if (!mounted) return null;

  const todoCurrentItem = todoItems.find(
    t => t.kind === 'current' && (typeFilter === 'all' || t.type === typeFilter)
  );
  const todoGridItems = todoItems.filter(
    t => t.kind !== 'current' && (typeFilter === 'all' || t.type === typeFilter)
  );
  const sortedDone = sortDone(
    doneItems.filter(d => typeFilter === 'all' || d.type === typeFilter),
    sortOrder
  );

  const todoCount = todoItems.length;
  const doneCount = doneItems.length;
  const isAllDone = todoCount === 0;

  return (
    <div className="p-main">
      {/* 제목 줄 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            내 활동
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)' }}>
            해야 할 활동을 풀고, 끝낸 활동의 결과를 볼 수 있어요.
          </p>
        </div>
        {/* 과목 탭 */}
        <div style={{ display: 'flex', border: '1.5px solid #e3e7ef', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
          {(['all', 'info'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              style={{
                height: 36, padding: '0 16px',
                background: subjectFilter === s ? '#131c33' : '#fff',
                color: subjectFilter === s ? '#fff' : '#5d6880',
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, letterSpacing: '-.01em',
              }}
            >
              {s === 'all' ? '전체' : '정보'}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 카드 */}
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, overflow: 'hidden' }}>
        {/* 탭 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '0 24px', borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ display: 'flex' }}>
            {(['todo', 'done'] as const).map(tab => {
              const isActive = activeTab === tab;
              const count = tab === 'todo' ? todoCount : doneCount;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    height: 60, padding: '0 24px 0 0', background: 'none', border: 'none',
                    borderBottom: `3px solid ${isActive ? PURPLE : 'transparent'}`,
                    cursor: 'pointer', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em',
                    color: isActive ? PURPLE : '#9ca3af',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    transition: 'color .15s, border-color .15s',
                  }}
                >
                  {tab === 'todo' ? '해야 할 활동' : '끝낸 활동'}
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: isActive ? PURPLE : '#e5e7eb',
                    color: isActive ? '#fff' : '#9ca3af',
                    fontSize: 12, fontWeight: 850,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .15s',
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 필터 */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 14 }}>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'all' | WorksheetType)}
              style={{
                height: 36, padding: '0 8px 0 12px',
                border: '1.5px solid #e3e7ef', borderRadius: 8,
                fontSize: 13, fontWeight: 600, color: 'var(--ink)',
                background: '#fff', cursor: 'pointer',
              }}
            >
              <option value="all">유형 전체</option>
              <option value="concept">개념 확인</option>
              <option value="escape">탈출 게임</option>
              <option value="mystery">추리 게임</option>
              <option value="practice">실습 기록</option>
              <option value="analysis">자료 분석</option>
              <option value="discussion">토론·의견</option>
            </select>
            {activeTab === 'done' && (
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'recent' | 'old' | 'feedback')}
                style={{
                  height: 36, padding: '0 8px 0 12px',
                  border: '1.5px solid #e3e7ef', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, color: 'var(--ink)',
                  background: '#fff', cursor: 'pointer',
                }}
              >
                <option value="recent">최근 순</option>
                <option value="old">오래된 순</option>
                <option value="feedback">피드백 온 것 먼저</option>
              </select>
            )}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'todo' ? (
            /* ---- 해야 할 활동 탭 ---- */
            isAllDone ? (
              <div style={{ padding: '56px 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <IconCheck />
                </div>
                <div style={{ fontSize: 20, fontWeight: 850, color: 'var(--ink)', marginBottom: 10 }}>다 했어요!</div>
                <button
                  onClick={() => setActiveTab('done')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: PURPLE }}
                >
                  끝낸 활동 보기 →
                </button>
              </div>
            ) : (
              <div>
                {/* 지금 수업 카드 */}
                {todoCurrentItem && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      border: `2px solid ${PURPLE}`, borderRadius: 16,
                      overflow: 'hidden', background: '#fff',
                      display: 'flex', alignItems: 'stretch',
                    }}>
                      {/* 썸네일 */}
                      <div style={{ width: 220, flexShrink: 0 }}>
                        <TypeThumbnail type={todoCurrentItem.type} height={148} />
                      </div>

                      {/* 콘텐츠 */}
                      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#5d6880' }}>지금 수업</span>
                            </span>
                            <TypeChip type={todoCurrentItem.type} />
                            <span style={{ fontSize: 12, color: '#9aa4bf' }}>{DEMO_CURRENT_ACTIVITY.meta}</span>
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em', lineHeight: 1.3 }}>
                            {todoCurrentItem.title}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#9aa4bf', marginBottom: 5 }}>
                            {DEMO_CURRENT_ACTIVITY.totalQuestions}문항 중 0문항 풀었어요
                          </div>
                          <div style={{ height: 6, background: '#e3e7ef', borderRadius: 3 }}>
                            <div style={{ width: '0%', height: '100%', background: PURPLE, borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>

                      {/* 버튼 */}
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0 }}>
                        <Link
                          href={`/s/${code}/activity`}
                          style={{
                            height: 48, padding: '0 20px',
                            background: PURPLE, color: '#fff',
                            borderRadius: 12, textDecoration: 'none',
                            fontSize: 15, fontWeight: 800, letterSpacing: '-.01em',
                            display: 'inline-flex', alignItems: 'center',
                          }}
                        >
                          이어서 풀기 →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3열 그리드 — 다시 풀기 + 아직 안 한 활동 */}
                {todoGridItems.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {todoGridItems.map(item => (
                      <div key={item.worksheetId} className="ws-card2" style={{ cursor: 'default' }}>
                        <TypeThumbnail type={item.type} height={80} />
                        <div style={{ padding: '12px 16px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: item.kind === 'resubmit' ? PURPLE : '#9ca3af',
                              }} />
                              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)' }}>
                                {item.kind === 'resubmit' ? '다시 풀기' : '아직 안 한 활동'}
                              </span>
                            </span>
                            {item.kind === 'resubmit' && (
                              <span style={{ fontSize: 11.5, color: '#9ca3af' }}>선생님이 요청했어요</span>
                            )}
                          </div>
                          <TypeChip type={item.type} />
                          <p style={{ margin: '5px 0 3px', fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em', lineHeight: 1.35 }}>
                            {item.title}
                          </p>
                          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9aa4bf' }}>
                            {item.kind === 'resubmit'
                              ? `고칠 문항 ${item.resubmitQuestionCount}개 · ${item.deadline}`
                              : `${item.teacher} · ${item.deadline}`}
                          </p>
                          <Link
                            href={`/s/${code}/activity`}
                            style={{
                              display: 'inline-flex', alignItems: 'center',
                              height: 36, padding: '0 14px', borderRadius: 9,
                              background: item.kind === 'resubmit' ? PURPLE : 'transparent',
                              color: item.kind === 'resubmit' ? '#fff' : PURPLE,
                              border: item.kind === 'resubmit' ? 'none' : `1.5px solid ${PURPLE}`,
                              textDecoration: 'none', fontSize: 13, fontWeight: 700,
                            }}
                          >
                            {item.kind === 'resubmit' ? '다시 풀기' : '시작하기'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 필터로 그리드 아이템이 없어졌을 때 */}
                {todoGridItems.length === 0 && typeFilter !== 'all' && todoCurrentItem && (
                  <div style={{ padding: '20px 0 4px', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
                    해당 유형의 해야 할 활동이 없어요.
                  </div>
                )}
              </div>
            )
          ) : (
            /* ---- 끝낸 활동 탭 ---- */
            <div>
              {/* 열 헤더 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 88px 110px 100px',
                gap: 12, padding: '0 0 10px',
                borderBottom: '2px solid #eef0f5', marginBottom: 4,
              }}>
                <div />
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>활동</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>제출한 날</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>결과</div>
                <div />
              </div>

              {sortedDone.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  해당하는 활동이 없어요.
                </div>
              ) : (
                sortedDone.map((item, idx) => (
                  <div
                    key={item.worksheetId}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '56px 1fr 88px 110px 100px',
                      gap: 12, padding: '14px 0', alignItems: 'center',
                      borderBottom: idx < sortedDone.length - 1 ? '1px solid #eef0f5' : 'none',
                    }}
                  >
                    {/* 썸네일 */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                      background: TYPE_LIGHT_COLORS[item.type] ?? '#f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: TYPE_COLORS[item.type] ?? '#5d6880' }} />
                    </div>

                    {/* 활동 */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
                        <TypeChip type={item.type} />
                        <StatusBadge status={item.status} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em', lineHeight: 1.3 }}>
                        {item.title}
                      </div>
                    </div>

                    {/* 날짜 */}
                    <div style={{ fontSize: 13, color: '#5d6880' }}>{formatDate(item.submittedAt)}</div>

                    {/* 결과 */}
                    <div style={{ fontSize: 13, color: '#5d6880' }}>{item.resultText}</div>

                    {/* 버튼 */}
                    <div>
                      <Link
                        href={`/s/${code}/result?id=${item.worksheetId}`}
                        style={{
                          height: 36, padding: '0 12px', borderRadius: 9,
                          background: item.status === 'feedback' ? PURPLE : 'transparent',
                          color: item.status === 'feedback' ? '#fff' : PURPLE,
                          border: item.status === 'feedback' ? 'none' : `1.5px solid ${PURPLE}`,
                          textDecoration: 'none', fontSize: 13, fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
                        }}
                      >
                        결과 보기
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
