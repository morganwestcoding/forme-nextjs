'use client';

import { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Check, Zap, ChevronDown, AlertCircle } from 'lucide-react';

function ExpandableSection({ title, children, defaultOpen = false }: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-white">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ComingSoonGate({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waitlistCount, setWaitlistCount] = useState(15000); // Default fallback

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const auth = localStorage.getItem('forme_early_access');
        const authTimestamp = localStorage.getItem('forme_early_access_timestamp');
        
        if (auth === 'true' && authTimestamp) {
          const timestamp = parseInt(authTimestamp);
          const now = Date.now();
          const oneWeek = 7 * 24 * 60 * 60 * 1000;
          
          if (now - timestamp < oneWeek) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('forme_early_access');
            localStorage.removeItem('forme_early_access_timestamp');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch waitlist count
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/waitlist');
        if (response.ok) {
          const data = await response.json();
          setWaitlistCount(data.count || 15000);
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
        // Update waitlist count
        setWaitlistCount(prev => prev + 1);
        
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

  // Show loading state while checking authentication
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <img 
            src="/logos/logo-white.png" 
            alt="ForMe Logo" 
            className="h-10 w-auto mx-auto mb-4"
          />
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise show coming soon page
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Orbiting Cubes Background */}
      <div className="absolute inset-0">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div 
            key={i}
            className={`cube-orbit cube-orbit-${i}`}
          >
            <div className="cube-container-orbit">
              <div className="cube-face front"></div>
              <div className="cube-face back"></div>
              <div className="cube-face right"></div>
              <div className="cube-face left"></div>
              <div className="cube-face top"></div>
              <div className="cube-face bottom"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Shimmer Sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        
        {/* Logo */}
        <div className="mb-11">
          <img 
            src="/logos/logo-white.png" 
            alt="ForMe Logo" 
            className="h-10 w-auto"
          />
        </div>

        {/* Main Content */}
        <div className="max-w-2xl w-full space-y-4">
          
          {/* Expandable About Section */}
          <ExpandableSection 
            title="About"
            defaultOpen={true}
          >
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
             The complete business ecosystem. Built for the future.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Whether you're a solo entrepreneur or growing a team, ForMe gives you everything you need to run your business your way.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
            From client booking and payment processing to storefront creation, team coordination, and community building every tool is unified in one intelligent, all-in-one platform.
            </p>
          </ExpandableSection>

          {/* Expandable Features Section */}
          <ExpandableSection title="Features">
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Team Management', desc: 'Orchestrate operations' },
                { name: 'Scheduling', desc: 'Coordinate everything' },
                { name: 'Payments', desc: 'Process transactions' },
                { name: 'Ecommerce', desc: 'Build your store' },
                { name: 'Advertising', desc: 'Grow your reach' },
                { name: 'Social', desc: 'Connect & engage' }
              ].map((feature, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                  <p className="text-sm font-medium text-white">{feature.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </ExpandableSection>

          {/* Expandable Details Section */}
          <ExpandableSection title="What Makes Us Different">
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-medium mb-1">Command Your Operations</p>
                <p>Orchestrate your team, schedules, and payments in perfect harmony.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Amplify Your Reach</p>
                <p>Transform browsers into buyers with integrated ecommerce and campaigns.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Build Your Community</p>
                <p>Connect authentically and cultivate followers who become advocates.</p>
              </div>
            </div>
          </ExpandableSection>

          {/* Email Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-3">Join the waitlist</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !emailLoading && handleEmailSubmit()}
                  placeholder="your@email.com"
                  disabled={emailLoading || emailSubmitted}
                  className={`w-full bg-white/5 border rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all disabled:opacity-50 ${
                    emailError 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-white/10 focus:border-blue-500'
                  }`}
                />
              </div>
              <button
                onClick={handleEmailSubmit}
                disabled={emailLoading || emailSubmitted}
                className="bg-white text-black font-medium px-4 py-2.5 rounded-lg hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 flex items-center"
              >
                {emailLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                ) : emailSubmitted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Error message */}
            {emailError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </div>
            )}
            
            {/* Success message */}
            {emailSubmitted && (
              <p className="text-xs text-green-400 mt-2">
                ✓ Successfully joined the waitlist!
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              {waitlistCount.toLocaleString()}+ already waiting
            </p>
          </div>

          {/* Password Section */}
          <div>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2 group"
            >
              <Lock className="w-3 h-3" />
              Early access
            </button>

            {showPassword && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                        placeholder="Access code"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handlePasswordSubmit}
                      className="bg-white/10 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-white/20 border border-white/10 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-xs text-gray-600">
            © 2025 ForMe • Coming Soon
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0;
            transform: scale(0);
          }
          50% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .sparkle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #60A5FA;
          border-radius: 50%;
          box-shadow: 0 0 10px #60A5FA, 0 0 20px #60A5FA;
          animation: twinkle linear infinite;
          pointer-events: none;
        }
        
        @keyframes orbit {
          100% {
            transform: translate3d(0, 0, 1px) rotate(360deg);
          }
        }
        
        .cube-orbit {
          position: absolute;
          width: 80px;
          height: 80px;
          backface-visibility: hidden;
          animation: orbit linear infinite;
          opacity: 0.4;
        }
        
        .cube-container-orbit {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate-cube-orbit 10s linear infinite;
        }
        
        @keyframes rotate-cube-orbit {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        
        .cube-face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid #60A5FA;
          background: rgba(96, 165, 250, 0.05);
          border-radius: 8px;
        }
        
        .front { transform: rotateY(0deg) translateZ(40px); }
        .back { transform: rotateY(180deg) translateZ(40px); }
        .right { transform: rotateY(90deg) translateZ(40px); }
        .left { transform: rotateY(-90deg) translateZ(40px); }
        .top { transform: rotateX(90deg) translateZ(40px); }
        .bottom { transform: rotateX(-90deg) translateZ(40px); }
        
        .cube-orbit-1 {
          top: 15%;
          left: 20%;
          animation-duration: 45s;
          animation-delay: -5s;
          transform-origin: 20vw 10vh;
        }
        
        .cube-orbit-2 {
          top: 70%;
          left: 15%;
          animation-duration: 38s;
          animation-delay: -15s;
          transform-origin: -15vw 5vh;
        }
        
        .cube-orbit-3 {
          top: 25%;
          left: 80%;
          animation-duration: 52s;
          animation-delay: -25s;
          transform-origin: -25vw -10vh;
        }
        
        .cube-orbit-4 {
          top: 60%;
          left: 70%;
          animation-duration: 35s;
          animation-delay: -8s;
          transform-origin: 10vw -15vh;
        }
        
        .cube-orbit-5 {
          top: 40%;
          left: 10%;
          animation-duration: 48s;
          animation-delay: -30s;
          transform-origin: 18vw 8vh;
        }
        
        .cube-orbit-6 {
          top: 80%;
          left: 85%;
          animation-duration: 42s;
          animation-delay: -18s;
          transform-origin: -20vw 12vh;
        }
        
        .cube-orbit-7 {
          top: 10%;
          left: 50%;
          animation-duration: 55s;
          animation-delay: -35s;
          transform-origin: 8vw -18vh;
        }
        
        .cube-orbit-8 {
          top: 50%;
          left: 45%;
          animation-duration: 40s;
          animation-delay: -12s;
          transform-origin: -12vw 6vh;
        }
      `}</style>
    </div>
  );
}