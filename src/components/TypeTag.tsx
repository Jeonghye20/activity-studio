/** TypeTag — 유형 이름표 (색 + 이름) */

import { TYPES, mix, typeInkColor, type TypeKey } from '@/lib/types';

interface Props {
  type: TypeKey;
  className?: string;
}

export default function TypeTag({ type, className }: Props) {
  const T = TYPES[type];
  const bg  = mix(T.c, 0.88);
  const ink = typeInkColor(type);

  return (
    <span
      className={`type-tag${className ? ` ${className}` : ''}`}
      style={{ background: bg, color: ink }}
    >
      <i aria-hidden="true" />
      {T.name}
    </span>
  );
}
