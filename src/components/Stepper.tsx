/** Stepper — 단계 표시 (고쳐서 배포 등 4단계 흐름에만 사용) */

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  current: number; // 1-based
  onStepClick?: (step: number) => void;
}

export default function Stepper({ steps, current, onStepClick }: Props) {
  return (
    <div className="stepper" role="list" aria-label="진행 단계">
      {steps.map((step, i) => {
        const num      = i + 1;
        const isDone   = num < current;
        const isActive = num === current;
        const cls = `stepper-btn${isActive ? ' active' : isDone ? ' done' : ''}`;

        return (
          <div key={num} style={{ display: 'contents' }} role="listitem">
            {i > 0 && <span className="stepper-sep" aria-hidden="true" />}
            <button
              className={cls}
              disabled={num > current}
              aria-current={isActive ? 'step' : undefined}
              onClick={isDone && onStepClick ? () => onStepClick(num) : undefined}
            >
              <i aria-hidden="true">
                {isDone ? '✓' : num}
              </i>
              {step.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
