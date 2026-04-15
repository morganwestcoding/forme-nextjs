'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ViewIcon as FiEye, ViewOffIcon as FiEyeOff } from 'hugeicons-react';
import Button from './ui/Button';

const PASSWORD = 'Admin#1';
const ANIM_MS = 200;

let unlockedInMemory = false;
const MESSAGE =
  "Whoa there! This page isn't open to the public yet — but if you're on the team, you're in the right place.";

interface BetaGateProps {
  children: React.ReactNode;
}

const BetaGate = ({ children }: BetaGateProps) => {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUnlocked(unlockedInMemory);
    if (!unlockedInMemory) {
      requestAnimationFrame(() => setShowModal(true));
    }
  }, []);

  useEffect(() => {
    if (unlocked === false) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [unlocked]);

  useEffect(() => {
    if (unlocked === false) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [unlocked]);

  const handleSubmit = useCallback(() => {
    if (password === PASSWORD) {
      unlockedInMemory = true;
      setShowModal(false);
      setTimeout(() => setUnlocked(true), ANIM_MS);
    } else {
      setError('Incorrect password');
    }
  }, [password]);

  const handleBack = useCallback(() => {
    setShowModal(false);
    setTimeout(() => router.back(), ANIM_MS);
  }, [router]);

  useEffect(() => {
    if (unlocked !== false) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlocked, handleBack]);

  if (unlocked === null) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] backdrop-blur-sm bg-stone-900/60 animate-in fade-in duration-200"
    >
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 mx-auto">
          <div
            className={`transform transition-all duration-200 ease-out will-change-transform ${
              showModal
                ? 'translate-y-0 opacity-100 scale-100'
                : 'translate-y-4 opacity-0 scale-[0.98]'
            }`}
          >
            <div className="relative flex flex-col w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/60 dark:border-stone-700/60 rounded-2xl shadow-2xl shadow-stone-900/20 overflow-hidden">
              <div className="flex flex-col">
                <div className="relative px-8 pt-8 pb-6 text-stone-800 dark:text-stone-200 ">
                  <div className="flex flex-col items-center text-center mb-6">
                    <p className="text-base sm:text-lg text-stone-700  dark:text-stone-300 leading-relaxed">
                      {MESSAGE}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="beta-gate-password"
                      className="block text-sm font-medium text-stone-700  dark:text-stone-300 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        id="beta-gate-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmit();
                        }}
                        className="w-full px-4 py-3.5 pr-12 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 px-8 pb-8 pt-2">
                  <div className="flex flex-row items-center gap-3 w-full">
                    <Button
                      id="beta-gate-back"
                      variant="outline"
                      size="lg"
                      fullWidth
                      onClick={handleBack}
                    >
                      Go Back
                    </Button>
                    <Button
                      id="beta-gate-submit"
                      size="lg"
                      fullWidth
                      onClick={handleSubmit}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaGate;
