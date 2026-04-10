"use client";
import { useAcademies } from "@/app/hooks/useAcademies";
import { CheckmarkCircle02Icon } from "hugeicons-react";

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
            className={`text-left rounded-2xl border p-4 transition-all ${
              isSelected
                ? "bg-stone-900 border-stone-800 text-white"
                : "bg-white border-stone-200/60 hover:border-stone-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[14px] font-semibold truncate ${
                    isSelected ? "text-white" : "text-stone-900"
                  }`}
                >
                  {academy.name}
                </p>
                {academy.description && (
                  <p
                    className={`text-[12px] mt-0.5 line-clamp-2 ${
                      isSelected ? "text-stone-300" : "text-stone-500"
                    }`}
                  >
                    {academy.description}
                  </p>
                )}
              </div>
              {isSelected && (
                <CheckmarkCircle02Icon
                  size={18}
                  color="#fff"
                  strokeWidth={1.5}
                  className="flex-shrink-0"
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AcademySelect;
