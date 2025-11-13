// components/search/GlobalSearch.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type ItemType =
  | "user"
  | "listing"
  | "post"
  | "shop"
  | "product"
  | "employee"
  | "service";

type ResultItem = {
  id: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  image?: string | null;
  href: string;
};

const typeLabel: Record<ItemType, string> = {
  user: "Users",
  listing: "Listings",
  post: "Posts",
  shop: "Shops",
  product: "Products",
  employee: "Employees",
  service: "Services",
};

function groupByType(items: ResultItem[]) {
  return items.reduce<Record<ItemType, ResultItem[]>>(
    (acc, item) => {
      (acc[item.type] ||= []).push(item);
      return acc;
    },
    {
      user: [],
      listing: [],
      post: [],
      shop: [],
      product: [],
      employee: [],
      service: [],
    }
  );
}

// Debounce hook
function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  isHeroMode?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = "Search posts, users, listings, shops, products, employees, services…",
  className,
  isHeroMode = false,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 250);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!debouncedQ || debouncedQ.length < 2) {
        setResults([]);
        setOpen(!!debouncedQ);
        setActiveIdx(-1);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (!ignore) {
          const items: ResultItem[] = data.results || [];
          setResults(items);
          setOpen(true);
          setActiveIdx(items.length ? 0 : -1);
        }
      } catch {
        if (!ignore) {
          setResults([]);
          setOpen(true);
          setActiveIdx(-1);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [debouncedQ]);

  // Update dropdown position when open or on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (!inputRef.current || !open) return;
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap (mt-2)
        left: rect.left,
        width: rect.width,
      });
    };

    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const flatItems = results;
  const grouped = useMemo(() => groupByType(results), [results]);

  const onSelect = (item: ResultItem) => {
    setOpen(false);
    setQ("");
    router.push(item.href);
  };

  // Keyboard nav
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((idx) => Math.min(idx + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && flatItems[activeIdx]) onSelect(flatItems[activeIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  // Keep active item in view - scroll within dropdown only, not the page
  useEffect(() => {
    if (!listRef.current || activeIdx < 0) return;
    const dropdown = listRef.current;
    const node = dropdown.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (!node) return;

    const dropdownRect = dropdown.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    // Check if node is above visible area
    if (nodeRect.top < dropdownRect.top) {
      dropdown.scrollTop -= dropdownRect.top - nodeRect.top;
    }
    // Check if node is below visible area
    else if (nodeRect.bottom > dropdownRect.bottom) {
      dropdown.scrollTop += nodeRect.bottom - dropdownRect.bottom;
    }
  }, [activeIdx]);

  const inputClasses = isHeroMode
    ? "w-full h-12 pl-12 pr-4 text-sm backdrop-blur-md bg-white/10 border border-white/40 rounded-lg outline-none focus:ring-1 focus:ring-white/60 focus:border-white/60 text-white placeholder-white/70"
    : "w-full h-12 pl-12 pr-4 text-sm border border-gray-300 rounded-xl outline-none focus:border-gray-400 hover:text-gray-900 bg-white placeholder-gray-600 text-gray-700 transition-all duration-200 shadow-sm";

  const iconClasses = isHeroMode ? "w-5 h-5 text-white" : "w-5 h-5 text-gray-600/90 group-hover:text-gray-700 transition-colors duration-200";

  return (
    <div className={`relative group ${className || ""}`} ref={containerRef}>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        <Search className={iconClasses} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClasses}
      />

      {/* Dropdown - Portaled to body to escape stacking context */}
      {open && dropdownPosition && typeof window !== "undefined" &&
        createPortal(
          <div
            ref={listRef}
            className="fixed z-[9999] max-h-96 overflow-auto rounded-xl bg-white shadow-lg"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
          {/* Loading */}
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
          )}

          {/* Empty */}
          {!loading && debouncedQ.length >= 2 && flatItems.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No results</div>
          )}

          {/* Results grouped */}
          {!loading && flatItems.length > 0 && (
            <div className="py-2">
              {(Object.keys(grouped) as Array<keyof typeof grouped>).map(
                (typeKey) => {
                  const section = grouped[typeKey] || [];
                  if (!section.length) return null;
                  return (
                    <div key={typeKey}>
                      <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-gray-400">
                        {typeLabel[typeKey as ItemType]}
                      </div>
                      <ul className="mb-1">
                        {section.map((item) => {
                          const idx = flatItems.findIndex(
                            (x) => x.id === item.id && x.type === item.type
                          );
                          const active = idx === activeIdx;
                          return (
                            <li
                              key={`${item.type}-${item.id}`}
                              data-idx={idx}
                              className={`px-3 py-2 cursor-pointer flex items-center gap-3 ${
                                active ? "bg-[#EBF4FE]" : "hover:bg-gray-50"
                              }`}
                              onMouseEnter={() => setActiveIdx(idx)}
                              onClick={() => onSelect(item)}
                            >
                              {/* Thumbnail */}
                              <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0">
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                    {typeKey}
                                  </div>
                                )}
                              </div>
                              {/* Text */}
                              <div className="min-w-0">
                                <div className="text-sm text-gray-900 truncate">
                                  {item.title}
                                </div>
                                {!!item.subtitle && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>
                              <div className="ml-auto text-[10px] uppercase tracking-wide text-gray-400">
                                {typeKey}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                }
              )}
            </div>
          )}
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default GlobalSearch;
