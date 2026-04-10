"use client";
import { useEffect, useState } from "react";

export interface Academy {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  logoUrl: string | null;
  website: string | null;
  courses: string[];
  duration: string | null;
  priceLabel: string | null;
  rating: number | null;
}

// Single source of truth for fetching the partner-academy list.
// Used by the licensing "Need Training" tab and the student registration step.
export function useAcademies() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/academies");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Academy[] = await res.json();
        if (!cancelled) setAcademies(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load academies");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { academies, isLoading, error };
}
