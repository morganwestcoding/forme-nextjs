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
    <div className="sticky top-1 z-40 bg-white/70 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-5xl mx-auto px-6 py-3 overflow-x-auto">
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
                  className={`text-[11px] tabular-nums tracking-wider ${
                    isActive ? 'text-stone-900' : 'text-stone-300 group-hover:text-stone-500'
                  }`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`text-[12px] tracking-tight transition-colors ${
                    isActive
                      ? 'text-stone-900 font-semibold'
                      : 'text-stone-400 group-hover:text-stone-700 font-medium'
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
