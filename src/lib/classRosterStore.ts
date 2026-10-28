// 학급 관리 저장·읽기 함수 모음.
// localStorage만 사용. 나중에 서버 API로 교체할 때 이 파일만 수정하면 됨.
// 모든 함수는 클라이언트에서만 호출할 것 (useEffect, 이벤트 핸들러).

import type { ClassRoom, AttendanceRecord } from '@/types/classRoster';
import { getDemoClasses, getDemoAttendance } from './classRosterDummy';

const KEY_CLASSES    = 'classRoster.classes';
const KEY_ATTENDANCE = 'classRoster.attendance';
const KEY_LAST_CLASS = 'classRoster.lastClassId';

// ─── Classes ────────────────────────────────────────────

export function loadClasses(): ClassRoom[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_CLASSES);
    return raw ? (JSON.parse(raw) as ClassRoom[]) : [];
  } catch {
    return [];
  }
}

export function saveClasses(classes: ClassRoom[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_CLASSES, JSON.stringify(classes));
}

// ─── Attendance ──────────────────────────────────────────

export function loadAttendance(): AttendanceRecord {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY_ATTENDANCE);
    return raw ? (JSON.parse(raw) as AttendanceRecord) : {};
  } catch {
    return {};
  }
}

export function saveAttendance(att: AttendanceRecord): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(att));
}

// ─── 특정 날짜 출결 토글 ─────────────────────────────────

export function toggleAbsent(
  classId: string,
  studentId: string,
  date: string, // YYYY-MM-DD
): void {
  const att = loadAttendance();
  if (!att[classId]) att[classId] = {};
  if (!att[classId][date]) att[classId][date] = {};

  if (att[classId][date][studentId] === 'absent') {
    delete att[classId][date][studentId];
    if (Object.keys(att[classId][date]).length === 0) delete att[classId][date];
    if (Object.keys(att[classId]).length === 0) delete att[classId];
  } else {
    att[classId][date][studentId] = 'absent';
  }
  saveAttendance(att);
}

export function isAbsent(
  att: AttendanceRecord,
  classId: string,
  studentId: string,
  date: string,
): boolean {
  return att[classId]?.[date]?.[studentId] === 'absent';
}

export function getAbsentStudentIds(
  att: AttendanceRecord,
  classId: string,
  date: string,
): string[] {
  return Object.keys(att[classId]?.[date] ?? {});
}

// ─── 초기화 / 리셋 ───────────────────────────────────────

// 첫 방문 시 데모 데이터 주입
export function initIfEmpty(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(KEY_CLASSES)) {
    saveClasses(getDemoClasses());
    saveAttendance(getDemoAttendance());
  }
}

// '처음 상태로 보기' — classRoster.* 전부 삭제 후 데모 데이터 재주입
export function resetToDemo(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter(k => k.startsWith('classRoster.'))
    .forEach(k => localStorage.removeItem(k));
  saveClasses(getDemoClasses());
  saveAttendance(getDemoAttendance());
}

// ─── 반 CRUD ─────────────────────────────────────────────

export function addClass(newClass: ClassRoom): void {
  const classes = loadClasses();
  saveClasses([...classes, newClass]);
}

export function updateClass(updated: ClassRoom): void {
  const classes = loadClasses();
  saveClasses(classes.map(c => c.id === updated.id ? updated : c));
}

export function deleteClass(classId: string): void {
  saveClasses(loadClasses().filter(c => c.id !== classId));
}

// ─── 학생 CRUD ───────────────────────────────────────────

export function addStudent(
  classId: string,
  student: import('@/types/classRoster').Student,
): void {
  const classes = loadClasses();
  saveClasses(classes.map(c =>
    c.id === classId ? { ...c, students: [...c.students, student] } : c,
  ));
}

export function updateStudent(
  classId: string,
  updated: import('@/types/classRoster').Student,
): void {
  const classes = loadClasses();
  saveClasses(classes.map(c =>
    c.id === classId
      ? { ...c, students: c.students.map(s => s.id === updated.id ? updated : s) }
      : c,
  ));
}

export function removeStudent(classId: string, studentId: string): void {
  const classes = loadClasses();
  saveClasses(classes.map(c =>
    c.id === classId
      ? { ...c, students: c.students.filter(s => s.id !== studentId) }
      : c,
  ));
}

export function moveStudent(
  fromClassId: string,
  toClassId: string,
  studentId: string,
): void {
  const classes = loadClasses();
  const fromClass = classes.find(c => c.id === fromClassId);
  const student = fromClass?.students.find(s => s.id === studentId);
  if (!student) return;

  const toClass = classes.find(c => c.id === toClassId);
  const maxNo = toClass ? Math.max(0, ...toClass.students.map(s => s.no)) : 0;
  const movedStudent = { ...student, no: maxNo + 1 };

  saveClasses(classes.map(c => {
    if (c.id === fromClassId) return { ...c, students: c.students.filter(s => s.id !== studentId) };
    if (c.id === toClassId)   return { ...c, students: [...c.students, movedStudent] };
    return c;
  }));
}

// ─── 마지막 선택 반 ──────────────────────────────────────

export function loadLastClassId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY_LAST_CLASS);
}

export function saveLastClassId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_LAST_CLASS, id);
}

// ─── ID 생성 ─────────────────────────────────────────────

export function newClassId(): string {
  return `cls_${Date.now()}`;
}

export function newStudentId(classId: string): string {
  return `${classId}_s${Date.now()}`;
}
