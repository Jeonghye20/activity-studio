/**
 * FilterChip — 필터 칩
 *
 * 'pressed' 상태와 클릭 핸들러는 부모가 관리한다.
 * 색 점은 type 색이 있을 때만 표시한다.
 */

'use client';

interface Props {
  label: string;
  pressed?: boolean;
  count?: number;
  dotColor?: string; // 유형 색 점 (없으면 미표시)
  onClick?: () => void;
  className?: string;
}

export default function FilterChip({
  label,
  pressed = false,
  count,
  dotColor,
  onClick,
  className,
}: Props) {
  return (
    <button
      className={`fchip${className ? ` ${className}` : ''}`}
      aria-pressed={pressed}
      onClick={onClick}
      type="button"
    >
      {dotColor && (
        <i
          className="fchip-dot"
          style={{ background: dotColor }}
          aria-hidden="true"
        />
      )}
      {label}
      {count !== undefined && (
        <span className="c" aria-label={`${count}개`}>{count}</span>
      )}
    </button>
  );
}
