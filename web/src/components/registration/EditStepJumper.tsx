'use client';

interface EditStepJumperProps {
  steps: { label: string; value: number }[];
  currentValue: number;
  onJump: (value: number) => void;
}

// A minimal, editorial step jumper shown on edit flows — lets users hop to
// any section directly instead of clicking Next through the whole sequence.
// Styled to match the stone/serif aesthetic used on ListingHead/ProfileHead.
export default function EditStepJumper({ steps, currentValue, onJump }: EditStepJumperProps) {
  return (
    <div className="fixed top-6 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-5xl mx-auto px-6 h-10 flex items-center overflow-x-auto pointer-events-auto">
        <div className="flex items-center justify-center gap-6 min-w-max mx-auto w-fit">
          {steps.map((s, i) => {
            const isActive = s.value === currentValue;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onJump(s.value)}
                className="group flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <span
                  className={`text-xs tabular-nums tracking-wider ${
                    isActive ? 'text-stone-900 dark:text-stone-100' : 'text-stone-300 group-hover:text-stone-500  dark:text-stone-500'
                  }`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`text-xs tracking-tight transition-colors ${
                    isActive
                      ? 'text-stone-900 dark:text-stone-100 font-semibold'
                      : 'text-stone-400  group-hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 font-medium'
                  }`}
                >
                  {s.label}
                </span>
                {isActive && (
                  <span className="ml-1 h-[2px] w-4 bg-stone-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
