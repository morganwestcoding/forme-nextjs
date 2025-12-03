'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Search } from 'lucide-react';
import useCreatePostModal from '@/app/hooks/useCreatePostModal';
import useFilterModal from '@/app/hooks/useFilterModal';

interface AIHeroInputProps {
  onSearch?: (query: string) => void;
  onAIChat?: (message: string) => void;
  categoryNav?: React.ReactNode;
}

const AIHeroInput: React.FC<AIHeroInputProps> = ({
  onSearch,
  onAIChat
}) => {
  const router = useRouter();
  const createPostModal = useCreatePostModal();
  const filterModal = useFilterModal();

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'search' | 'ai'>('search');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut (/)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (mode === 'search') {
      onSearch?.(input);
      router.push(`/?q=${encodeURIComponent(input)}`);
    } else {
      onAIChat?.(input);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        {/* Main Input Container */}
        <div
          className={`
            relative overflow-hidden rounded-2xl
            bg-white backdrop-blur-xl
            border transition-all duration-300
            ${isFocused
              ? 'border-neutral-300 shadow-[0_4px_20px_rgb(0,0,0,0.06)]'
              : 'border-neutral-200/80 shadow-[0_1px_3px_rgb(0,0,0,0.03)]'
            }
          `}
        >
          {/* Mode Indicator Gradient */}
          <div
            className={`
              absolute top-0 left-0 right-0 h-[1.5px] transition-all duration-500
              ${mode === 'ai'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400'
                : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400'
              }
            `}
            style={{
              opacity: isFocused ? 1 : 0
            }}
          />

          {/* Top Half - Search Input */}
          <div className="flex items-center gap-2 px-4 py-3">
            {/* Filter Button */}
            <button
              type="button"
              onClick={filterModal.onOpen}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-all duration-200"
              title="Filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
                <path d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 16.002L9.00868 15.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 18.002L15.0087 17.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="#F5F5F5"/>
              </svg>
            </button>

            {/* Create Button */}
            <button
              type="button"
              onClick={createPostModal.onOpen}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-all duration-200"
              title="Create"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
                <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-neutral-200" />

            {/* Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setMode(mode === 'search' ? 'ai' : 'search')}
              className={`
                flex-shrink-0 p-2 rounded-lg
                transition-all duration-200
                ${mode === 'ai'
                  ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }
              `}
              title={mode === 'search' ? 'Switch to AI Chat' : 'Switch to Search'}
            >
              {mode === 'search' ? (
                <Search className="w-[22px] h-[22px]" strokeWidth={2} />
              ) : (
                <Sparkles className="w-[22px] h-[22px]" strokeWidth={2} />
              )}
            </button>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'search'
                  ? 'Search posts, listings, shops, products...'
                  : 'Ask me anything about your feed...'
              }
              className="
                flex-1 text-[15px] bg-transparent border-none outline-none
                text-neutral-900 placeholder-neutral-400
                font-normal px-2
              "
            />

            {/* Shortcut Hint */}
            {!input && !isFocused && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <kbd className="px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-500">
                  /
                </kbd>
              </div>
            )}

            {/* Submit Button - Always Visible */}
            <button
              type="submit"
              className={`
                flex-shrink-0 p-2 rounded-lg
                transition-all duration-200
                ${mode === 'ai'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                }
                text-white shadow-sm
                hover:shadow-md hover:scale-105
                active:scale-95
              `}
            >
              <Send className="w-[22px] h-[22px]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!input && isFocused && (
          <div className="mt-3 px-2">
            <div className="flex flex-wrap gap-2">
              {mode === 'search' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setInput('popular listings near me')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                  >
                    Popular nearby
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('featured shops')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                  >
                    Featured shops
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('trending posts')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                  >
                    Trending posts
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setInput('What are the top-rated services in my area?')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                  >
                    Top-rated services
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('Show me trending topics')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                  >
                    Trending topics
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('Recommend something unique')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                  >
                    Surprise me
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AIHeroInput;
