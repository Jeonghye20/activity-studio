'use client';

import { useState, useEffect, useRef } from 'react';
import type { ClassRoom, AttendanceRecord, AchievementStatus } from '@/types/classRoster';
import {
  initIfEmpty, loadClasses, loadAttendance,
  addClass, resetToDemo,
  getAbsentStudentIds,
  loadLastClassId, saveLastClassId,
  addStudent, newStudentId,
} from '@/lib/classRosterStore';
import { DEMO_CLASS_IDS } from '@/lib/classRosterDummy';
import ClassCard from './ClassCard';
import CreateClassModal from './CreateClassModal';
import SummaryBand from './SummaryBand';
import StudentCardGrid from './StudentCardGrid';
import StudentList from './StudentList';
import PasteModal from './PasteModal';

function getInitialClassId(classes: ClassRoom[]): string | null {
  const lastId = loadLastClassId();
  if (lastId && classes.find(c => c.id === lastId)) return lastId;
  const demo3 = classes.find(c => c.id === DEMO_CLASS_IDS.c3);
  if (demo3) return demo3.id;
  return classes.find(c => c.students.length > 0)?.id ?? classes[0]?.id ?? null;
}

export default function ClassRosterPage() {
  const [classes, setClasses]       = useState<ClassRoom[]>([]);
  const [att, setAtt]               = useState<AttendanceRecord>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]           = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    initIfEmpty();
    const cls = loadClasses();
    const attendance = loadAttendance();
    setClasses(cls);
    setAtt(attendance);
    setSelectedId(getInitialClassId(cls));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function refreshAtt() {
    setAtt(loadAttendance());
  }

  function refreshClasses() {
    const cls = loadClasses();
    setClasses(cls);
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    saveLastClassId(id);
  }

  function handleReset() {
    resetToDemo();
    const cls = loadClasses();
    setClasses(cls);
    setAtt(loadAttendance());
    setSelectedId(getInitialClassId(cls));
  }

  function handleCreateClass(newRoom: ClassRoom) {
    addClass(newRoom);
    const cls = loadClasses();
    setClasses(cls);
    handleSelect(newRoom.id);
    setShowCreate(false);
    setToast(`${newRoom.name}을 만들었어요. 이제 명단을 넣어 주세요`);
  }

  const selectedClass = classes.find(c => c.id === selectedId) ?? null;

  return (
    <div className="p-main">
      {/* ── 처음 상태로 보기 ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={handleReset} className="link-btn" style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          처음 상태로 보기
        </button>
      </div>

      {/* ── 헤더 ── */}
      <h1 style={{ margin: '0 0 20px', fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
        학급 관리
      </h1>

      {/* ── 반 카드 줄 ── */}
      <ClassCardStrip
        classes={classes}
        att={att}
        todayStr={today}
        selectedId={selectedId}
        onSelect={handleSelect}
        onCreateClick={() => setShowCreate(true)}
      />

      {/* ── 선택된 반 내용 ── */}
      {selectedClass && (
        <div style={{ marginTop: 28 }}>
          {selectedClass.students.length === 0 ? (
            <EmptyClassState
              name={selectedClass.name}
              classId={selectedClass.id}
              onStudentChange={refreshClasses}
              onToast={msg => setToast(msg)}
            />
          ) : (
            <ClassDetail
              room={selectedClass}
              classes={classes}
              att={att}
              todayStr={today}
              onAttChange={refreshAtt}
              onStudentChange={refreshClasses}
              onToast={msg => setToast(msg)}
            />
          )}
        </div>
      )}

      {/* ── 반 만들기 모달 ── */}
      {showCreate && (
        <CreateClassModal
          existingClasses={classes}
          nextWallIndex={classes.length % 6}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateClass}
        />
      )}

      {/* ── 토스트 ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: '#fff',
          padding: '12px 22px', borderRadius: 'var(--r-md)',
          fontSize: 14, fontWeight: 600, zIndex: 9999,
          whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── 반 카드 스트립 ────────────────────────────────────────
function ClassCardStrip({
  classes, att, todayStr, selectedId, onSelect, onCreateClick,
}: {
  classes: ClassRoom[];
  att: AttendanceRecord;
  todayStr: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  function checkFade() {
    const el = scrollRef.current;
    if (!el) return;
    setShowFade(el.scrollWidth > el.clientWidth + 2);
  }

  useEffect(() => {
    checkFade();
    window.addEventListener('resize', checkFade);
    return () => window.removeEventListener('resize', checkFade);
  }, [classes]);

  const CARD_H = 108 + 40 + 3 + 2;

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          if (!el) return;
          setShowFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
        }}
        style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          paddingBottom: 4, scrollbarWidth: 'thin',
          scrollbarColor: 'var(--line) transparent',
        }}
      >
        {classes.map(room => {
          const absentIds = getAbsentStudentIds(att, room.id, todayStr);
          return (
            <ClassCard
              key={room.id}
              room={room}
              absentCount={absentIds.length}
              isSelected={room.id === selectedId}
              onClick={() => onSelect(room.id)}
            />
          );
        })}

        <button
          onClick={onCreateClick}
          style={{
            width: 184, height: CARD_H, flexShrink: 0,
            border: '2px dashed var(--line)', borderRadius: 0,
            background: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, color: 'var(--mute)',
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1, fontWeight: 300 }}>+</span>
          <span style={{ fontSize: 13 }}>반 만들기</span>
        </button>
      </div>

      {showFade && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 4,
          width: 64, pointerEvents: 'none',
          background: 'linear-gradient(to right, transparent, var(--canvas))',
        }} />
      )}
    </div>
  );
}

// ── 명단 없음 상태 ────────────────────────────────────────
function EmptyClassState({
  name, classId, onStudentChange, onToast,
}: {
  name: string;
  classId: string;
  onStudentChange: () => void;
  onToast: (m: string) => void;
}) {
  const [pasteOpen, setPasteOpen] = useState(false);
  return (
    <div style={{
      padding: '52px 24px', textAlign: 'center',
      border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
    }}>
      <p style={{ margin: '0 0 20px', fontSize: 15, color: 'var(--mute)' }}>
        {name} 명단이 비어 있어요
      </p>
      <button
        onClick={() => setPasteOpen(true)}
        style={{
          height: 40, padding: '0 20px', borderRadius: 'var(--r-sm)',
          border: '1px solid var(--side)', background: 'var(--side)',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        명단 붙여 넣기
      </button>
      {pasteOpen && (
        <PasteModal
          classId={classId}
          existingStudents={[]}
          onClose={() => setPasteOpen(false)}
          onImported={count => {
            onStudentChange();
            setPasteOpen(false);
            onToast(`${count}명을 추가했어요`);
          }}
        />
      )}
    </div>
  );
}

// ── 반 상세 ───────────────────────────────────────────────
function ClassDetail({
  room, classes, att, todayStr, onAttChange, onStudentChange, onToast,
}: {
  room: ClassRoom;
  classes: ClassRoom[];
  att: AttendanceRecord;
  todayStr: string;
  onAttChange: () => void;
  onStudentChange: () => void;
  onToast: (m: string) => void;
}) {
  const [viewDate, setViewDate]   = useState(todayStr);
  const [filterStatus, setFilter] = useState<AchievementStatus | null>(null);
  const [viewMode, setViewMode]   = useState<'card' | 'list'>('card');
  const [sortBy, setSortBy]       = useState<'no' | 'name'>('no');
  const [search, setSearch]       = useState('');
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [pasteOpen, setPasteOpen]   = useState(false);

  useEffect(() => {
    setViewDate(todayStr);
    setFilter(null);
    setAddRowOpen(false);
    setPasteOpen(false);
  }, [room.id, todayStr]);

  const otherClasses = classes.filter(c => c.id !== room.id && c.students.length > 0);
  const nextNo = room.students.length > 0
    ? Math.max(...room.students.map(s => s.no)) + 1
    : 1;

  return (
    <div>
      {/* ── 도구 줄 ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="이름 또는 번호"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            height: 38, padding: '0 12px', borderRadius: 'var(--r-sm)',
            border: '1px solid var(--line)', fontSize: 13.5,
            width: 160, background: '#fff', outline: 'none',
          }}
        />

        <ToggleGroup
          options={[{ value: 'card', label: '카드형' }, { value: 'list', label: '목록형' }]}
          value={viewMode}
          onChange={v => setViewMode(v as 'card' | 'list')}
          height={38}
          fontSize={13.5}
        />

        <ToggleGroup
          options={[{ value: 'no', label: '번호순' }, { value: 'name', label: '이름순' }]}
          value={sortBy}
          onChange={v => setSortBy(v as 'no' | 'name')}
          height={38}
          fontSize={13.5}
        />

        <div style={{ flex: 1 }} />

        <button
          onClick={() => { setPasteOpen(true); setAddRowOpen(false); }}
          style={{
            height: 38, padding: '0 14px', borderRadius: 'var(--r-sm)',
            border: '1px solid var(--line)', background: '#fff',
            fontSize: 13.5, color: 'var(--ink-3)', cursor: 'pointer',
          }}
        >
          붙여 넣기로 추가
        </button>
        <button
          onClick={() => { setAddRowOpen(v => !v); setPasteOpen(false); if (viewMode === 'card') setViewMode('list'); }}
          style={{
            height: 38, padding: '0 14px', borderRadius: 'var(--r-sm)',
            border: 'none',
            background: 'var(--side)',
            color: '#fff',
            fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          }}
        >
          + 학생 추가
        </button>
      </div>

      {/* ── 카드형 학생 추가 행 (카드형일 때 addRowOpen) ── */}
      {addRowOpen && viewMode === 'card' && (
        <AddStudentPanel
          classId={room.id}
          nextNo={nextNo}
          onAdded={name => { onStudentChange(); onToast(`${name} 학생을 추가했어요`); setAddRowOpen(false); }}
          onClose={() => setAddRowOpen(false)}
        />
      )}

      {/* ── 요약 띠 ── */}
      <SummaryBand
        classId={room.id}
        students={room.students}
        att={att}
        selectedDate={viewDate}
        todayStr={todayStr}
        onDateChange={setViewDate}
        filterStatus={filterStatus}
        onFilterChange={setFilter}
      />

      {/* ── 카드형 / 목록형 ── */}
      {viewMode === 'card' ? (
        <StudentCardGrid
          classId={room.id}
          students={room.students}
          att={att}
          selectedDate={viewDate}
          filterStatus={filterStatus}
          sortBy={sortBy}
          searchQuery={search}
          onAttChange={onAttChange}
          onFilterClear={() => setFilter(null)}
        />
      ) : (
        <StudentList
          classId={room.id}
          students={room.students}
          otherClasses={otherClasses}
          att={att}
          selectedDate={viewDate}
          filterStatus={filterStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={search}
          onAttChange={onAttChange}
          onFilterClear={() => setFilter(null)}
          addRowOpen={addRowOpen}
          onAddRowClose={() => setAddRowOpen(false)}
          onStudentChange={onStudentChange}
          onToast={onToast}
        />
      )}

      {/* ── 붙여 넣기 모달 ── */}
      {pasteOpen && (
        <PasteModal
          classId={room.id}
          existingStudents={room.students}
          onClose={() => setPasteOpen(false)}
          onImported={count => {
            onStudentChange();
            setPasteOpen(false);
            onToast(`${count}명을 추가했어요`);
          }}
        />
      )}
    </div>
  );
}

// ── 카드형용 학생 추가 패널 ───────────────────────────────
function AddStudentPanel({
  classId, nextNo, onAdded, onClose,
}: {
  classId: string;
  nextNo: number;
  onAdded: (name: string) => void;
  onClose: () => void;
}) {
  const [no, setNo]     = useState(nextNo);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addStudent(classId, { id: newStudentId(classId), no, name: trimmed });
    onAdded(trimmed);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      padding: '12px 16px', marginBottom: 16,
      background: '#f0f6ff', borderRadius: 'var(--r-sm)',
      border: '1px solid var(--concept)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>번호</span>
      <input
        type="number"
        value={no}
        onChange={e => setNo(Math.max(1, parseInt(e.target.value) || 1))}
        style={{
          width: 64, height: 36, textAlign: 'right', fontSize: 13,
          border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '0 8px', outline: 'none',
        }}
      />
      <span style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>이름</span>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="학생 이름"
        onKeyDown={e => {
          if (e.key === 'Enter') handleAdd();
          if (e.key === 'Escape') onClose();
        }}
        style={{
          flex: 1, minWidth: 140, height: 36, fontSize: 14,
          border: '1px solid var(--concept)', borderRadius: 'var(--r-sm)', padding: '0 10px', outline: 'none',
        }}
      />
      <button
        onClick={handleAdd}
        style={{
          height: 36, padding: '0 16px', borderRadius: 'var(--r-sm)',
          border: 'none', background: 'var(--side)', color: '#fff',
          fontSize: 13.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
        }}
      >추가</button>
      <button
        onClick={onClose}
        style={{
          height: 36, padding: '0 14px', borderRadius: 'var(--r-sm)',
          border: '1px solid var(--line)', background: '#fff',
          fontSize: 13.5, cursor: 'pointer', color: 'var(--ink-3)', flexShrink: 0,
        }}
      >취소</button>
    </div>
  );
}

// ── 토글 그룹 ─────────────────────────────────────────────
function ToggleGroup({
  options, value, onChange, height = 38, fontSize = 13.5,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  height?: number;
  fontSize?: number;
}) {
  return (
    <div style={{
      display: 'flex',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-sm)',
      overflow: 'hidden',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            height, padding: '0 12px',
            border: 'none',
            borderRight: opt === options[0] ? '1px solid var(--line)' : 'none',
            background: value === opt.value ? 'var(--side)' : '#fff',
            color: value === opt.value ? '#fff' : 'var(--ink-3)',
            fontSize, fontWeight: value === opt.value ? 700 : 400,
            cursor: 'pointer', transition: 'background 0.1s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
