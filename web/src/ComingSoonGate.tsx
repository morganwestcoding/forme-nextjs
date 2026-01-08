'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Lock, Mail, ArrowRight, Check, Zap, AlertCircle, Calendar, Users, ShoppingBag, BarChart3 } from 'lucide-react';

// Routes that bypass the coming soon gate
const BYPASS_ROUTES = ['/register', '/reset-password'];

export default function ComingSoonGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'waitlist' | 'demo'>('waitlist');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoName, setDemoName] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Minimum loading time to show one full animation cycle
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const auth = localStorage.getItem('forme_early_access');
        const authTimestamp = localStorage.getItem('forme_early_access_timestamp');

        if (auth === 'true' && authTimestamp) {
          const timestamp = parseInt(authTimestamp);
          const now = Date.now();
          const oneWeek = 7 * 24 * 60 * 60 * 1000;

          if (now - timestamp < oneWeek) {
            await minLoadTime;
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('forme_early_access');
            localStorage.removeItem('forme_early_access_timestamp');
            await minLoadTime;
            setIsAuthenticated(false);
          }
        } else {
          await minLoadTime;
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        await minLoadTime;
        setIsAuthenticated(false);
      } finally {
        // Start fade out animation
        setIsFadingOut(true);
        // Wait for fade out to complete before hiding loader
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/waitlist');
        if (response.ok) {
          const data = await response.json();
          setWaitlistCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
      }
    };

    fetchWaitlistCount();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailLoading(true);
    setEmailError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: 'coming_soon'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSubmitted(true);
        setEmail('');
        setWaitlistCount(prev => (prev || 0) + 1);

        setTimeout(() => {
          setEmailSubmitted(false);
        }, 3000);
      } else {
        if (response.status === 409) {
          setEmailError('Email already registered');
        } else {
          setEmailError(data.error || 'Failed to join waitlist');
        }
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setEmailError('Network error. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDemoSubmit = async () => {
    if (!demoName.trim()) {
      setDemoError('Name is required');
      return;
    }

    if (!demoEmail.trim()) {
      setDemoError('Email is required');
      return;
    }

    if (!validateEmail(demoEmail)) {
      setDemoError('Please enter a valid email address');
      return;
    }

    setDemoLoading(true);
    setDemoError('');

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: demoName.trim(),
          email: demoEmail.trim().toLowerCase(),
          source: 'coming_soon'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDemoSubmitted(true);
        setDemoName('');
        setDemoEmail('');

        setTimeout(() => {
          setDemoSubmitted(false);
        }, 3000);
      } else {
        if (response.status === 409) {
          setDemoError('Demo request already submitted');
        } else {
          setDemoError(data.error || 'Failed to submit demo request');
        }
      }
    } catch (error) {
      console.error('Error submitting demo request:', error);
      setDemoError('Network error. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (password.toLowerCase() === 'sushi') {
      try {
        localStorage.setItem('forme_early_access', 'true');
        localStorage.setItem('forme_early_access_timestamp', Date.now().toString());
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error storing authentication:', error);
        alert('Authentication failed. Please try again.');
      }
    } else {
      alert('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  // Bypass gate for specific routes - check first before any loading state
  const shouldBypass = BYPASS_ROUTES.some(route => pathname?.startsWith(route));
  if (shouldBypass) {
    return <>{children}</>;
  }

  if (isLoading || isAuthenticated === null) {
    return (
      <>
        <style jsx global>{`
          html, body {
            background-color: #09090B !important;
            overscroll-behavior: none !important;
            overflow: hidden !important;
          }

          @keyframes logoReveal {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(10px);
              filter: blur(10px);
            }
            100% {
              opacity: 0.9;
              transform: scale(1) translateY(0);
              filter: blur(0);
            }
          }

          @keyframes dotsContainer {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes dotPulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }

          @keyframes fadeOut {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(1.02);
            }
          }

          .loader-logo {
            animation: logoReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .loader-dots-container {
            animation: dotsContainer 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards;
            opacity: 0;
          }

          .loader-dot {
            width: 10px;
            height: 10px;
            margin: 0 5px;
            border-radius: 50%;
            animation: dotPulse 1.4s ease-in-out infinite;
          }

          .loader-fade-out {
            animation: fadeOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}</style>
        <div className={`min-h-screen bg-[#09090B] flex items-center justify-center ${isFadingOut ? 'loader-fade-out' : ''}`}>
          <div className="text-center">
            <img
              src="/logos/logo-white.svg"
              alt="ForMe Logo"
              className="loader-logo h-12 w-auto mx-auto mb-10"
              style={{ opacity: 0 }}
            />
            <div className="loader-dots-container flex justify-center items-center">
              <span className="loader-dot" style={{ backgroundColor: '#60A5FA', animationDelay: '0s' }} />
              <span className="loader-dot" style={{ backgroundColor: '#7AB8FB', animationDelay: '0.1s' }} />
              <span className="loader-dot" style={{ backgroundColor: '#93CAFC', animationDelay: '0.2s' }} />
              <span className="loader-dot" style={{ backgroundColor: '#ADDBFD', animationDelay: '0.3s' }} />
              <span className="loader-dot" style={{ backgroundColor: '#C7ECFE', animationDelay: '0.4s' }} />
              <span className="loader-dot" style={{ backgroundColor: '#E0F4FF', animationDelay: '0.5s' }} />
              <span className="loader-dot" style={{ backgroundColor: '#FFFFFF', animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <style jsx global>{`
        html, body {
          background-color: #09090B;
          overscroll-behavior: none;
        }
      `}</style>

      <div className="min-h-screen bg-[#09090B] text-white">
        {/* Refined background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-neutral-800/20 via-transparent to-transparent blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="px-6 py-6 flex items-center justify-between max-w-5xl mx-auto">
            <img
              src="/logos/logo-white.svg"
              alt="ForMe"
              className="h-7 w-auto"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-neutral-500 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-700"
            >
              <Lock className="w-3 h-3" />
              Early Access
            </button>
          </nav>

          {/* Hero Section */}
          <div className="px-6 pt-28 pb-20 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 mb-10 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] text-neutral-300 uppercase tracking-wider font-medium">Launching Early 2026</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-medium tracking-tight leading-[1.1] mb-6">
              <span className="text-white">Stop juggling apps.</span>
              <br />
              <span className="text-neutral-500 whitespace-nowrap">Run your business from one place.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-neutral-400 max-w-xl mb-12 leading-relaxed">
              Scheduling, payments, storefront, team management, and marketing — unified in a single platform built for professionals.
            </p>

            {/* Email signup */}
            <div className="max-w-md">
              {activeTab === 'waitlist' ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && !emailLoading && handleEmailSubmit()}
                      placeholder="you@company.com"
                      disabled={emailLoading || emailSubmitted}
                      className={`flex-1 bg-transparent border rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors disabled:opacity-50 ${
                        emailError
                          ? 'border-red-500/50 focus:border-red-500/70'
                          : 'border-neutral-800 focus:border-neutral-600 hover:border-neutral-700'
                      }`}
                    />
                    <button
                      onClick={handleEmailSubmit}
                      disabled={emailLoading || emailSubmitted}
                      className="bg-white text-black font-medium px-5 py-3 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] text-sm"
                    >
                      {emailLoading ? (
                        <div className="w-4 h-4 border border-neutral-400 border-t-neutral-700 rounded-full animate-spin" />
                      ) : emailSubmitted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <>
                          Join waitlist
                        </>
                      )}
                    </button>
                  </div>

                  {emailError && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {emailError}
                    </p>
                  )}

                  {emailSubmitted && (
                    <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                      <Check className="w-3 h-3" />
                      You&apos;re on the list.
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    {waitlistCount !== null && waitlistCount > 0 && (
                      <span>{waitlistCount.toLocaleString()} on the waitlist</span>
                    )}
                    <span className="text-neutral-700">·</span>
                    <button
                      onClick={() => setActiveTab('demo')}
                      className="hover:text-neutral-300 transition-colors"
                    >
                      Request a demo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={demoName}
                    onChange={(e) => {
                      setDemoName(e.target.value);
                      if (demoError) setDemoError('');
                    }}
                    placeholder="Your name"
                    disabled={demoLoading || demoSubmitted}
                    className={`w-full bg-transparent border rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors disabled:opacity-50 ${
                      demoError
                        ? 'border-red-500/50 focus:border-red-500/70'
                        : 'border-neutral-800 focus:border-neutral-600 hover:border-neutral-700'
                    }`}
                  />
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => {
                        setDemoEmail(e.target.value);
                        if (demoError) setDemoError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && !demoLoading && handleDemoSubmit()}
                      placeholder="Work email"
                      disabled={demoLoading || demoSubmitted}
                      className={`flex-1 bg-transparent border rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors disabled:opacity-50 ${
                        demoError
                          ? 'border-red-500/50 focus:border-red-500/70'
                          : 'border-neutral-800 focus:border-neutral-600 hover:border-neutral-700'
                      }`}
                    />
                    <button
                      onClick={handleDemoSubmit}
                      disabled={demoLoading || demoSubmitted}
                      className="bg-white text-black font-medium px-5 py-3 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] text-sm"
                    >
                      {demoLoading ? (
                        <div className="w-4 h-4 border border-neutral-400 border-t-neutral-700 rounded-full animate-spin" />
                      ) : demoSubmitted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <>Request</>
                      )}
                    </button>
                  </div>

                  {demoError && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {demoError}
                    </p>
                  )}

                  {demoSubmitted && (
                    <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                      <Check className="w-3 h-3" />
                      We&apos;ll be in touch.
                    </p>
                  )}

                  <button
                    onClick={() => setActiveTab('waitlist')}
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    ← Back to waitlist
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="max-w-5xl mx-auto px-6">
            <div className="border-t border-neutral-800/50" />
          </div>

          {/* Features Grid */}
          <div className="px-6 py-24 max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { icon: Calendar, label: 'Scheduling', desc: 'Smart booking that syncs across your entire operation' },
                { icon: ShoppingBag, label: 'Storefront', desc: 'Sell products and services with built-in checkout' },
                { icon: Users, label: 'Team', desc: 'Manage staff, permissions, and collaboration' },
                { icon: BarChart3, label: 'Analytics', desc: 'Insights that help you make better decisions' },
              ].map((feature, i) => (
                <div key={i} className="group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 group-hover:border-neutral-700 group-hover:from-neutral-700/80 transition-all duration-300">
                    <feature.icon className="w-[18px] h-[18px] text-neutral-300" />
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1.5">{feature.label}</h3>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="max-w-5xl mx-auto px-6">
            <div className="border-t border-neutral-800/50" />
          </div>

          {/* Value Props */}
          <div className="px-6 py-24 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-16">
              {[
                {
                  num: '01',
                  title: 'One platform, zero chaos',
                  desc: 'Replace the patchwork of apps you\'re duct-taping together. Everything works in harmony.'
                },
                {
                  num: '02',
                  title: 'Built for how you work',
                  desc: 'Whether you\'re solo or scaling a team, ForMe adapts to your workflow — not the other way around.'
                },
                {
                  num: '03',
                  title: 'Launch in minutes',
                  desc: 'No learning curve, no complex setup. Import your data and start running your business immediately.'
                }
              ].map((prop, i) => (
                <div key={i} className="relative">
                  <span className="text-[10px] text-neutral-700 font-mono tracking-wider">{prop.num}</span>
                  <h3 className="text-[15px] font-medium text-white mt-3 mb-2">{prop.title}</h3>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">{prop.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Early Access Modal */}
          {showPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={() => setShowPassword(false)}
              />
              <div className="relative bg-[#09090B] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-sm font-medium text-white mb-1">Early Access</h3>
                <p className="text-xs text-neutral-500 mb-5">Enter your access code to preview ForMe.</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    placeholder="Access code"
                    className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:bg-neutral-900 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={handlePasswordSubmit}
                    className="bg-white text-black font-medium px-4 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="px-6 py-10 border-t border-neutral-900/50">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <p className="text-[11px] text-neutral-600">&copy; 2025 ForMe. All rights reserved.</p>
              <img
                src="/logos/logo-white.svg"
                alt="ForMe"
                className="h-4 w-auto opacity-15"
              />
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
