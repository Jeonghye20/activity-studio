import type { Sheet } from './types';

const KEY = 'activity_studio_created_sheets';

function loadAll(): Sheet[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAll(sheets: Sheet[]) {
  localStorage.setItem(KEY, JSON.stringify(sheets));
}

export function loadCreatedSheet(id: string): Sheet | null {
  return loadAll().find(s => s.id === id) ?? null;
}

export function saveCreatedSheet(sheet: Sheet) {
  const all = loadAll().filter(s => s.id !== sheet.id);
  saveAll([sheet, ...all]);
}

export function deleteCreatedSheet(id: string) {
  saveAll(loadAll().filter(s => s.id !== id));
}
