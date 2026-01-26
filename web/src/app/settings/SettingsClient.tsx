"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PaintBrush01Icon,
  Moon02Icon,
  Sun03Icon,
  CreditCardIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Settings02Icon,
  AlertCircleIcon,
} from "hugeicons-react";
import { SafeUser } from "@/app/types";
import { useTheme, DEFAULT_ACCENT_COLOR } from "@/app/context/ThemeContext";
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

  const handleBackToProfile = () => {
    if (currentUser?.id) {
      router.push(`/profile/${currentUser.id}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Clean Header */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 md:px-24 pt-12 pb-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base mt-3 max-w-2xl mx-auto">
              Customize your app experience and manage your account
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-24 py-12">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <PaintBrush01Icon size={20} className="text-gray-600 dark:text-gray-300" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Appearance
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                Customize how the app looks and feels
              </p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between py-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {pendingDarkMode ? (
                <Moon02Icon size={18} className="text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
              ) : (
                <Sun03Icon size={18} className="text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPendingDarkMode(!pendingDarkMode)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                ${pendingDarkMode ? 'bg-[var(--accent-color)]' : 'bg-gray-300 dark:bg-gray-600'}
              `}
              style={{ backgroundColor: pendingDarkMode ? pendingColor : undefined }}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
                  ${pendingDarkMode ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Accent Color */}
          <div className="py-5">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Accent Color
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Choose your preferred accent color for buttons, badges, and highlights
            </p>

            {/* Preset Colors */}
            <div className="flex flex-wrap gap-3 mb-4">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`
                    w-10 h-10 rounded-xl transition-all duration-200
                    ${pendingColor === color
                      ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110'
                      : 'hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Custom:
              </label>
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden"
                  style={{ backgroundColor: customColor }}
                />
              </div>
              <input
                type="text"
                value={customColor.toUpperCase()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setCustomColor(value);
                    if (value.length === 7) {
                      setPendingColor(value);
                    }
                  }
                }}
                className="w-24 px-3 py-2 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="#60A5FA"
              />
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-lg transition-all duration-200"
                  style={{
                    backgroundColor: pendingColor,
                    boxShadow: `0 4px 14px ${pendingColor}40`
                  }}
                >
                  Primary Button
                </button>
                <span
                  className="px-2 py-1 text-xs font-medium text-white rounded-full"
                  style={{ backgroundColor: pendingColor }}
                >
                  Badge
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: pendingColor }}
                >
                  Selected Text
                </span>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </div>

        {/* Payments Section - Only for employees */}
        {isEmployee && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <CreditCardIcon size={20} className="text-gray-600 dark:text-gray-300" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                  Payments
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  Set up your account to receive payments for services
                </p>
              </div>
            </div>

            {connectLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ) : !connectStatus?.hasAccount ? (
              // Not set up yet
              <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex-shrink-0">
                    <CreditCardIcon size={24} className="text-blue-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      Set Up Payments
                    </h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                      Connect your bank account to receive payments for your services. ForMe takes a 10% platform fee on each transaction.
                    </p>
                    <button
                      onClick={handleOnboard}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Loading...' : 'Get Started'}
                      <ArrowRight01Icon size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ) : !connectStatus.onboardingComplete || !connectStatus.chargesEnabled ? (
              // Onboarding incomplete
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
                    <AlertCircleIcon size={24} className="text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      Complete Payment Setup
                    </h3>
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      Your payment account needs additional information before you can receive payments.
                    </p>
                    <button
                      onClick={handleOnboard}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Loading...' : 'Continue Setup'}
                      <ArrowRight01Icon size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Fully set up
              <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/40 flex-shrink-0">
                    <CheckmarkCircle02Icon size={24} className="text-green-600 dark:text-green-400" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      Payments Active
                    </h3>
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      You&apos;ll receive payments automatically when customers complete bookings. View your earnings and manage payouts in your dashboard.
                    </p>
                    <button
                      onClick={handleOpenDashboard}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Loading...' : 'View Dashboard'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBackToProfile}
            className="flex-1 py-3 px-6 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-[13px] tracking-tight text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
          >
            Back to Profile
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex-1 py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold text-[13px] tracking-tight hover:bg-black dark:hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {hasUnsavedChanges ? (
              <>
                Save Changes
                <ArrowRight01Icon size={14} strokeWidth={2.5} />
              </>
            ) : (
              'No Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsClient;
