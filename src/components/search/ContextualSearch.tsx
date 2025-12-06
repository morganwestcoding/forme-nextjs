// components/search/ContextualSearch.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";

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
  listing: "Businesses",
  post: "Posts",
  shop: "Shops",
  product: "Products",
  employee: "Professionals",
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

export interface ContextualSearchProps {
  placeholder?: string;
  className?: string;
  /** Filter results to specific types */
  filterTypes?: ItemType[];
  /** For profile/listing pages - filter to specific entity */
  entityId?: string;
  entityType?: "user" | "listing";
  /** Action buttons to render on the right side */
  actionButtons?: React.ReactNode;
  /** Callback when search query changes (for local filtering) */
  onSearchChange?: (query: string) => void;
  /** Whether to also do local filtering alongside API search */
  enableLocalFilter?: boolean;
}

const ContextualSearch: React.FC<ContextualSearchProps> = ({
  placeholder = "Looking for something?",
  className,
  filterTypes,
  entityId,
  entityType,
  actionButtons,
  onSearchChange,
  enableLocalFilter = false,
}) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
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

  // Notify parent of search changes for local filtering
  useEffect(() => {
    if (enableLocalFilter && onSearchChange) {
      onSearchChange(q);
    }
  }, [q, enableLocalFilter, onSearchChange]);

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
        let url = `/api/search?q=${encodeURIComponent(debouncedQ)}`;

        // Add entity filters if provided
        if (entityId && entityType) {
          url += `&entityId=${entityId}&entityType=${entityType}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (!ignore) {
          let items: ResultItem[] = data.results || [];

          // Client-side type filtering
          if (filterTypes && filterTypes.length > 0) {
            items = items.filter((item) => filterTypes.includes(item.type));
          }

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
  }, [debouncedQ, filterTypes, entityId, entityType]);

  // Update dropdown position when open or on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current || !open) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
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
      if (!containerRef.current || !listRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target) && !listRef.current.contains(target)) {
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

  // Keep active item in view
  useEffect(() => {
    if (!listRef.current || activeIdx < 0) return;
    const dropdown = listRef.current;
    const node = dropdown.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (!node) return;

    const dropdownRect = dropdown.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    if (nodeRect.top < dropdownRect.top) {
      dropdown.scrollTop -= dropdownRect.top - nodeRect.top;
    } else if (nodeRect.bottom > dropdownRect.bottom) {
      dropdown.scrollTop += nodeRect.bottom - dropdownRect.bottom;
    }
  }, [activeIdx]);

  return (
    <div className={`relative w-full ${className || ""}`} ref={containerRef}>
      <div
        className="border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden"
        style={{
          background: isDarkMode
            ? 'linear-gradient(to right, rgb(38 38 38) 0%, rgb(35 35 35) 100%)'
            : 'linear-gradient(to right, rgb(245 245 245) 0%, rgb(241 241 241) 100%)'
        }}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="flex-1 text-[13px] sm:text-[14px] bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 font-normal pl-2 sm:pl-3"
          />

          {actionButtons && (
            <>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600" />
              {actionButtons}
            </>
          )}
        </div>
      </div>

      {/* Dropdown - Portaled to body (only show when there's content to display) */}
      {open && dropdownPosition && typeof window !== "undefined" && (loading || results.length > 0 || debouncedQ.length >= 2) &&
        createPortal(
          <div
            ref={listRef}
            className="fixed z-[9999] max-h-80 overflow-auto rounded-2xl bg-white/95 backdrop-blur-xl border border-neutral-200 shadow-xl shadow-neutral-900/5 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {/* Loading */}
            {loading && (
              <div className="px-4 py-6 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-[bounce_1s_ease-in-out_infinite]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-[bounce_1s_ease-in-out_0.15s_infinite]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-[bounce_1s_ease-in-out_0.3s_infinite]" />
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading && debouncedQ.length >= 2 && flatItems.length === 0 && (
              <div className="px-4 py-6 text-sm text-neutral-400 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
                No results for &ldquo;{debouncedQ}&rdquo;
              </div>
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
                        <div className="px-4 pt-3 pb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                            {typeLabel[typeKey as ItemType]}
                          </span>
                        </div>
                        <ul>
                          {section.map((item) => {
                            const idx = flatItems.findIndex(
                              (x) => x.id === item.id && x.type === item.type
                            );
                            const active = idx === activeIdx;
                            return (
                              <li
                                key={`${item.type}-${item.id}`}
                                data-idx={idx}
                                className={`mx-2 px-3 py-2.5 cursor-pointer flex items-center gap-3 rounded-xl transition-all duration-150 ${
                                  active
                                    ? "bg-neutral-100"
                                    : "hover:bg-neutral-50"
                                }`}
                                onMouseEnter={() => setActiveIdx(idx)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onSelect(item);
                                }}
                              >
                                {/* Thumbnail */}
                                <div className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-all duration-150 ${
                                  active ? "ring-2 ring-neutral-300" : "bg-neutral-100"
                                }`}>
                                  {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center text-[10px] font-medium text-neutral-400 uppercase">
                                      {typeKey.slice(0, 2)}
                                    </div>
                                  )}
                                </div>
                                {/* Text */}
                                <div className="min-w-0 flex-1">
                                  <div className={`text-sm font-medium truncate transition-colors duration-150 ${
                                    active ? "text-neutral-900" : "text-neutral-700"
                                  }`}>
                                    {item.title}
                                  </div>
                                  {!!item.subtitle && (
                                    <div className="text-xs text-neutral-400 truncate">
                                      {item.subtitle}
                                    </div>
                                  )}
                                </div>
                                {/* Type badge */}
                                <div className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-lg transition-all duration-150 ${
                                  active ? "text-neutral-600 bg-neutral-200" : "text-neutral-400 bg-neutral-100"
                                }`}>
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

export default ContextualSearch;
