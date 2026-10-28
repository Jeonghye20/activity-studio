/**
 * StatusPill — 상태 색 + 아이콘 + 글자
 *
 * 상태 색은 단독으로 쓰지 않고 반드시 이 컴포넌트를 통해 글자와 함께 표시한다.
 */

interface Props {
  /** done=제출완료, work=풀이중, help=도움필요, off=미접속, fb=피드백, re=재제출 */
  status: 'done' | 'work' | 'help' | 'off' | 'fb' | 're';
  className?: string;
}

const LABELS: Record<Props['status'], string> = {
  done: '제출 완료',
  work: '풀이 중',
  help: '도움 필요',
  off:  '미접속',
  fb:   '피드백 전송',
  re:   '재제출 중',
};

const ICONS: Record<Props['status'], string> = {
  done: '✓',
  work: '✎',
  help: '!',
  off:  '–',
  fb:   '↑',
  re:   '↺',
};

export default function StatusPill({ status, className }: Props) {
  return (
    <span
      className={`status-pill ${status}${className ? ` ${className}` : ''}`}
      aria-label={LABELS[status]}
    >
      <span aria-hidden="true">{ICONS[status]}</span>
      {LABELS[status]}
    </span>
  );
}
