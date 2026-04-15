"use client";
import { useAcademies } from "@/app/hooks/useAcademies";

interface AcademySelectProps {
  value: string;
  onChange: (academyId: string) => void;
}

// Compact academy picker. Used by the student registration step
// (the licensing "Need Training" tab keeps its richer card layout
// but pulls from the same useAcademies hook).
const AcademySelect = ({ value, onChange }: AcademySelectProps) => {
  const { academies, isLoading, error } = useAcademies();

  if (isLoading) {
    return (
      <div className="text-[13px] text-stone-400 py-4">Loading academies…</div>
    );
  }

  if (error) {
    return (
      <div className="text-[13px] text-red-500 py-4">
        Could not load academies. {error}
      </div>
    );
  }

  if (academies.length === 0) {
    return (
      <div className="text-[13px] text-stone-400 py-4">
        No partner academies available yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {academies.map((academy) => {
        const isSelected = value === academy.id;
        return (
          <button
            key={academy.id}
            type="button"
            onClick={() => onChange(academy.id)}
            className={`
              text-left rounded-xl border p-4 transition-all duration-200
              ${isSelected
                ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
              }
            `}
          >
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {academy.name}
            </p>
            {academy.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                {academy.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AcademySelect;
