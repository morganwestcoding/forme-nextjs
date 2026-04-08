"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Moon02Icon,
  Sun03Icon,
  CreditCardIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  AlertCircleIcon,
} from "hugeicons-react";
import { SafeUser } from "@/app/types";
import { useTheme, DEFAULT_ACCENT_COLOR } from "@/app/context/ThemeContext";
import PageHeader from "@/components/PageHeader";
import Container from "@/components/Container";
import axios from "axios";
import { toast } from "react-hot-toast";

interface SettingsClientProps {
  currentUser: SafeUser;
  isEmployee: boolean;
}

const PRESET_COLORS = [
  '#60A5FA', // Blue (default)
  '#34D399', // Green
  '#F472B6', // Pink
  '#FBBF24', // Yellow
  '#A78BFA', // Purple
  '#FB7185', // Red
  '#2DD4BF', // Teal
  '#FB923C', // Orange
];

type ConnectStatus = {
  hasAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

const SettingsClient = ({ currentUser, isEmployee }: SettingsClientProps) => {
  const router = useRouter();
  const { accentColor, isDarkMode, setAccentColor, setIsDarkMode, resetTheme } = useTheme();

  // Theme state
  const [pendingColor, setPendingColor] = useState(accentColor);
  const [pendingDarkMode, setPendingDarkMode] = useState(isDarkMode);
  const [customColor, setCustomColor] = useState(accentColor);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Stripe Connect state
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(pendingColor !== accentColor || pendingDarkMode !== isDarkMode);
  }, [pendingColor, pendingDarkMode, accentColor, isDarkMode]);

  // Fetch Stripe Connect status
  useEffect(() => {
    if (isEmployee) {
      fetchConnectStatus();
    } else {
      setConnectLoading(false);
    }
  }, [isEmployee]);

  const fetchConnectStatus = async () => {
    try {
      const { data } = await axios.get('/api/stripe-connect/status');
      setConnectStatus(data);
    } catch (error) {
      console.error('Failed to fetch Connect status:', error);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleOnboard = async () => {
    setActionLoading(true);
    try {
      const { data } = await axios.post('/api/stripe-connect/onboard');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start onboarding');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setActionLoading(true);
    try {
      const { data } = await axios.post('/api/stripe-connect/dashboard');
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to open dashboard');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = () => {
    setAccentColor(pendingColor);
    setIsDarkMode(pendingDarkMode);
    toast.success('Settings saved');
  };

  const handleReset = () => {
    resetTheme();
    setPendingColor(DEFAULT_ACCENT_COLOR);
    setPendingDarkMode(false);
    setCustomColor(DEFAULT_ACCENT_COLOR);
  };

  const handleColorSelect = (color: string) => {
    setPendingColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setPendingColor(color);
  };

  const [activeTab, setActiveTab] = useState<'appearance' | 'payments' | 'legal'>('appearance');

  const tabs = [
    { key: 'appearance' as const, label: 'Appearance' },
    ...(isEmployee ? [{ key: 'payments' as const, label: 'Payments' }] : []),
    { key: 'legal' as const, label: 'Legal' },
  ];

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Settings" />

      <div className="mt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Settings</h1>
          <p className="text-[14px] text-stone-400 mt-1">Manage your preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
        {/* ===== APPEARANCE ===== */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            {/* Dark Mode */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pendingDarkMode ? (
                    <Moon02Icon size={18} className="text-stone-400" strokeWidth={1.5} />
                  ) : (
                    <Sun03Icon size={18} className="text-stone-400" strokeWidth={1.5} />
                  )}
                  <div>
                    <h3 className="text-[14px] font-semibold text-stone-900">Dark Mode</h3>
                    <p className="text-[12px] text-stone-400 mt-0.5">Switch between light and dark themes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDarkMode(!pendingDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${pendingDarkMode ? '' : 'bg-stone-200'}`}
                  style={{ backgroundColor: pendingDarkMode ? pendingColor : undefined }}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${pendingDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-5">
              <h3 className="text-[14px] font-semibold text-stone-900 mb-0.5">Accent Color</h3>
              <p className="text-[12px] text-stone-400 mb-5">Choose your preferred accent color</p>

              <div className="flex flex-wrap gap-3 mb-5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-9 h-9 rounded-full transition-all duration-200 ${
                      pendingColor === color ? 'ring-2 ring-offset-2 ring-stone-900 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-[12px] text-stone-400">Custom</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-9 h-9 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                  style={{ backgroundColor: customColor }}
                />
                <input
                  type="text"
                  value={customColor.toUpperCase()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      setCustomColor(value);
                      if (value.length === 7) setPendingColor(value);
                    }
                  }}
                  className="w-24 px-3 py-1.5 text-[12px] font-mono bg-stone-50 rounded-xl border border-stone-200 text-stone-900"
                  placeholder="#60A5FA"
                />
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 pt-5 border-t border-stone-100">
                <button
                  type="button"
                  className="px-4 py-2 text-[13px] font-semibold text-white rounded-xl"
                  style={{ backgroundColor: pendingColor, boxShadow: `0 4px 14px ${pendingColor}40` }}
                >
                  Primary Button
                </button>
                <span className="px-2.5 py-1 text-[11px] font-semibold text-white rounded-full" style={{ backgroundColor: pendingColor }}>
                  Badge
                </span>
                <span className="text-[13px] font-semibold" style={{ color: pendingColor }}>
                  Accent Text
                </span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="mt-4 text-[12px] text-stone-400 hover:text-stone-600 transition-colors"
              >
                Reset to defaults
              </button>
            </div>

            {/* Save */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[13px] font-medium hover:bg-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2"
                style={{ boxShadow: hasUnsavedChanges ? '0 2px 8px rgba(0,0,0,0.12)' : undefined }}
              >
                {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ===== LEGAL ===== */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200/60 bg-white p-5">
              <h3 className="text-[14px] font-semibold text-stone-900 mb-4">Legal</h3>
              <div className="space-y-3">
                <a
                  href="/terms"
                  target="_blank"
                  className="flex items-center justify-between py-2.5 px-1 border-b border-stone-100 text-[13px] text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Terms of Service
                  <ArrowRight01Icon size={14} className="text-stone-400" strokeWidth={1.5} />
                </a>
                <a
                  href="/privacy"
                  target="_blank"
                  className="flex items-center justify-between py-2.5 px-1 text-[13px] text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Privacy Policy
                  <ArrowRight01Icon size={14} className="text-stone-400" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ===== PAYMENTS ===== */}
        {activeTab === 'payments' && isEmployee && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
              {connectLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-stone-100 rounded w-1/3"></div>
                  <div className="h-3 bg-stone-100 rounded w-2/3"></div>
                  <div className="h-10 bg-stone-100 rounded w-1/3"></div>
                </div>
              ) : !connectStatus?.hasAccount ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <CreditCardIcon size={18} className="text-stone-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-stone-900 mb-1">Set Up Payments</h3>
                    <p className="text-[13px] text-stone-400 mb-4 leading-relaxed">
                      Connect your bank account to receive payments. ForMe takes a 10% platform fee on each transaction.
                      By connecting, you agree to the{' '}
                      <a href="/terms" target="_blank" className="underline hover:text-stone-600">Terms of Service</a>.
                    </p>
                    <button
                      onClick={handleOnboard}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-[13px] font-medium rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    >
                      {actionLoading ? 'Loading...' : 'Get Started'}
                      <ArrowRight01Icon size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : !connectStatus.onboardingComplete || !connectStatus.chargesEnabled ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <AlertCircleIcon size={18} className="text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-stone-900 mb-1">Complete Payment Setup</h3>
                    <p className="text-[13px] text-stone-400 mb-4 leading-relaxed">
                      Your payment account needs additional information before you can receive payments.
                    </p>
                    <button
                      onClick={handleOnboard}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-[13px] font-medium rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Loading...' : 'Continue Setup'}
                      <ArrowRight01Icon size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckmarkCircle02Icon size={18} className="text-emerald-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-stone-900 mb-1">Payments Active</h3>
                    <p className="text-[13px] text-stone-400 mb-4 leading-relaxed">
                      You&apos;ll receive payments automatically when customers complete bookings.
                    </p>
                    <button
                      onClick={handleOpenDashboard}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 text-stone-700 text-[13px] font-medium rounded-xl hover:bg-stone-200 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Loading...' : 'View Dashboard'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </Container>
  );
};

export default SettingsClient;
