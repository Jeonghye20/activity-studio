import MySheetsClient from './MySheetsClient';
import { getAllWorksheets } from '@/lib/data';

export default function MySheets() {
  const thumbs: Record<string, string> = {};
  for (const w of getAllWorksheets()) {
    const img = w.cardImg ?? w.heroImg;
    if (img) thumbs[w.id] = img;
  }
  return <MySheetsClient thumbs={thumbs} />;
}
