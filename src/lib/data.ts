import { readFileSync } from 'fs';
import path from 'path';
import type { Worksheet, WorksheetSummary, Curriculum } from '@/types/worksheet';

const DATA_DIR = path.join(process.cwd(), 'data');

export function getCurriculum(): Curriculum {
  return JSON.parse(readFileSync(path.join(DATA_DIR, 'curriculum.json'), 'utf8'));
}

export function getAllWorksheets(): WorksheetSummary[] {
  const sheets: Worksheet[] = JSON.parse(
    readFileSync(path.join(DATA_DIR, 'worksheets.json'), 'utf8')
  );
  return sheets.map(({ id, unit, title, type, minutes, goal, keywords, situations }) => ({
    id, unit, title, type, minutes, goal, keywords, situations,
  }));
}

export function getWorksheet(id: string): Worksheet | null {
  try {
    const sheets = JSON.parse(
      readFileSync(path.join(DATA_DIR, 'worksheets.json'), 'utf8')
    ) as Worksheet[];
    return sheets.find(s => s.id === id) ?? null;
  } catch {
    return null;
  }
}

export function getUnitLabel(code: string, curriculum: Curriculum): string {
  const unit = curriculum.units.find(u => u.code === code);
  return unit ? `${code} ${unit.title}` : code;
}
