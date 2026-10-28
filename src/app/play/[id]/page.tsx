import { notFound } from 'next/navigation';
import { getWorksheet } from '@/lib/data';
import type { Block } from '@/types/worksheet';

interface Props {
  params: Promise<{ id: string }>;
}

export const instant = false;

export default async function PlayPage({ params }: Props) {
  const { id } = await params;
  const sheet = getWorksheet(id);
  if (!sheet) notFound();

  let gameSrc = '';
  for (const sec of sheet.sections) {
    for (const b of sec.blocks as (Block & { kind: string; src?: string })[]) {
      if (b.kind === 'bitvault' && b.src) { gameSrc = b.src; break; }
    }
    if (gameSrc) break;
  }
  if (!gameSrc) notFound();

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
        .play-shell { position: fixed; inset: 0; }
        .play-frame { width: 100%; height: 100%; border: none; display: block; }
        .play-back {
          position: absolute; top: 14px; right: 16px; z-index: 10;
          background: rgba(0,0,0,.45); color: #fff; font-size: 13px; font-weight: 600;
          padding: 7px 16px; border-radius: 8px; text-decoration: none;
          backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.18);
          font-family: inherit;
        }
        .play-back:hover { background: rgba(0,0,0,.65); }
      `}</style>
      <div className="play-shell">
        <a href={`/worksheets/${id}`} className="play-back">← 미리보기로</a>
        <iframe src={gameSrc} className="play-frame" title={sheet.title} />
      </div>
    </>
  );
}
