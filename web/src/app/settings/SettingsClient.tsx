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
  Delete02Icon,
  BulbIcon,
} from "hugeicons-react";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import { useTheme } from "@/app/context/ThemeContext";
import Container from "@/components/Container";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Card from "@/components/ui/Card";
import axios from "axios";
import { toast } from "react-hot-toast";

interface SettingsClientProps {
  currentUser: SafeUser;
}

type ConnectStatus = {
  hasAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

const SettingsClient = ({ currentUser }: SettingsClientProps) => {
  const router = useRouter();
  const { isDarkMode, setIsDarkMode, resetTheme } = useTheme();

  const [pendingDarkMode, setPendingDarkMode] = useState(isDarkMode);
  const [showWelcome, setShowWelcome] = useState(!currentUser.hideWelcomeModal);
  const [pendingShowWelcome, setPendingShowWelcome] = useState(!currentUser.hideWelcomeModal);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Client-side fetch employee status
  const [isEmployee, setIsEmployee] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/employee-status')
      .then((r) => r.json())
      .then((data) => {
        setIsEmployee(data.isEmployee || false);
        setSettingsLoading(false);
      })
      .catch(() => {
        setSettingsLoading(false);
      });
  }, []);

  // Stripe Connect state
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(pendingDarkMode !== isDarkMode || pendingShowWelcome !== showWelcome);
  }, [pendingDarkMode, isDarkMode, pendingShowWelcome, showWelcome]);

  // Fetch Stripe Connect status
  useEffect(() => {
    if (settingsLoading) return;
    if (isEmployee) {
      fetchConnectStatus();
    } else {
      setConnectLoading(false);
    }
  }, [isEmployee, settingsLoading]);

  const fetchConnectStatus = async () => {
    try {
      const { data } = await axios.get('/api/stripe-connect/status');
      setConnectStatus(data);
    } catch (error) {
      // silently handled
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

  const handleSave = async () => {
    setIsDarkMode(pendingDarkMode);
    if (pendingShowWelcome !== showWelcome) {
      try {
        await axios.put(`/api/users/${currentUser.id}`, {
          hideWelcomeModal: !pendingShowWelcome,
        });
        setShowWelcome(pendingShowWelcome);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to save welcome preference');
        return;
      }
    }
    toast.success('Settings saved');
  };

  const handleReset = () => {
    resetTheme();
    setPendingDarkMode(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/users/${currentUser.id}`);
      toast.success('Account deleted');
      await signOut({ callbackUrl: '/' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'appearance' | 'payments' | 'legal'>('appearance');

  if (settingsLoading) {
    const SettingRowSkeleton = ({ subtitleWidth }: { subtitleWidth: string }) => (
      <div className="rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-[18px] w-[18px]" rounded="md" />
            <div>
              <Skeleton className="h-4 w-24 mb-1.5" />
              <Skeleton className={`h-3 ${subtitleWidth}`} />
            </div>
          </div>
          <Skeleton rounded="full" className="h-6 w-11" />
        </div>
      </div>
    );

    return (
      <Container>
          <div className="mt-8 pb-16">
          {/* Title */}
          <div className="mb-8">
            <Skeleton className="h-8 w-28 mb-2" />
            <Skeleton className="h-4 w-44" />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-8">
            <Skeleton rounded="full" className="h-8 w-24" />
            <Skeleton rounded="full" className="h-8 w-20" />
          </div>

          {/* Tab content */}
          <div className="min-h-[400px]">
            <div className="space-y-6 max-w-xl">
              <SettingRowSkeleton subtitleWidth="w-52" />
              <SettingRowSkeleton subtitleWidth="w-48" />

              {/* Save button */}
              <Skeleton rounded="xl" className="h-10 w-32" />

              {/* Delete Account row */}
              <div className="rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-[18px] w-[18px]" rounded="md" />
                    <div>
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                  <Skeleton rounded="xl" className="h-9 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const tabs = [
    { key: 'appearance' as const, label: 'Appearance' },
    ...(isEmployee ? [{ key: 'payments' as const, label: 'Payments' }] : []),
    { key: 'legal' as const, label: 'Legal' },
  ];

  return (
    <Container>

      <div className="mt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Settings</h1>
          <p className="text-[14px] text-stone-400 dark:text-stone-500 mt-1">Manage your preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-br from-stone-800 to-black text-white shadow-pill-active dark:from-stone-100 dark:to-white dark:text-stone-900 dark:shadow-pill-active-dark'
                  : 'bg-stone-50  text-stone-500  dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 shadow-inset-outline'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
        {/* ===== APPEARANCE ===== */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-xl">
            {/* Dark Mode */}
            <Card padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pendingDarkMode ? (
                    <Moon02Icon size={18} className="text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                  ) : (
                    <Sun03Icon size={18} className="text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                  )}
                  <div>
                    <h3 className="text-[14px] font-semibold text-stone-900 dark:text-stone-100">Dark Mode</h3>
                    <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">Switch between light and dark themes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDarkMode(!pendingDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${pendingDarkMode ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-200 dark:bg-stone-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full shadow-elevation-1 transition-transform duration-200 ${pendingDarkMode ? 'translate-x-6 bg-white dark:bg-stone-900' : 'translate-x-1 bg-white dark:bg-stone-300'}`} />
                </button>
              </div>
            </Card>

            {/* Welcome Guide */}
            <Card padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BulbIcon size={18} className="text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-[14px] font-semibold text-stone-900 dark:text-stone-100">Welcome Guide</h3>
                    <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">Show the welcome modal on each visit</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingShowWelcome(!pendingShowWelcome)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${pendingShowWelcome ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-200 dark:bg-stone-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full shadow-elevation-1 transition-transform duration-200 ${pendingShowWelcome ? 'translate-x-6 bg-white dark:bg-stone-900' : 'translate-x-1 bg-white dark:bg-stone-300'}`} />
                </button>
              </div>
            </Card>

            {/* Save */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
              </Button>
            </div>

            {/* Delete Account */}
            <Card padding="md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Delete02Icon size={18} className="text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-[14px] font-semibold text-stone-900 dark:text-stone-100">Delete Account</h3>
                    <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">Permanently delete your account and all data</p>
                  </div>
                </div>
                <Button variant="danger-soft" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Account confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-stone-900/60 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 max-w-md w-full shadow-elevation-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-danger-soft flex items-center justify-center">
                  <Delete02Icon className="w-5 h-5 text-danger" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Delete Account?</h3>
              </div>
              <p className="text-[13px] text-stone-500 dark:text-stone-500 mb-2">
                This will permanently delete your account, profile, and all associated data.
              </p>
              <p className="text-[13px] text-stone-500 dark:text-stone-500 mb-6">
                This action cannot be undone. You&apos;ll be signed out immediately.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-[13px] font-medium bg-stone-50 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-200/60 transition-all"
                >
                  Keep Account
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl text-[13px] font-medium bg-danger text-white hover:bg-danger/90 transition-all"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== LEGAL ===== */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <Card padding="md">
              <h3 className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 mb-4">Legal</h3>
              <div className="space-y-3">
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2.5 px-1 border-b border-stone-100 dark:border-stone-800 text-[13px] text-stone-600  hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
                >
                  Terms of Service
                  <ArrowRight01Icon size={14} className="text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                </a>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2.5 px-1 text-[13px] text-stone-600  hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
                >
                  Privacy Policy
                  <ArrowRight01Icon size={14} className="text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                </a>
              </div>
            </Card>
          </div>
        )}

        {/* ===== PAYMENTS ===== */}
        {activeTab === 'payments' && isEmployee && (
          <div className="space-y-6">
            <Card padding="lg">
              {connectLoading ? (
                null
              ) : !connectStatus?.hasAccount ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                    <CreditCardIcon size={18} className="text-stone-500  dark:text-stone-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 mb-1">Set Up Payments</h3>
                    <p className="text-[13px] text-stone-400 dark:text-stone-500 mb-4 leading-relaxed">
                      Connect your bank account to receive payments. ForMe takes a 10% platform fee on each transaction.
                      By connecting, you agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-600 dark:text-stone-300">Terms of Service</a>.
                    </p>
                    <Button
                      onClick={handleOnboard}
                      loading={actionLoading}
                      rightIcon={<ArrowRight01Icon size={14} strokeWidth={2.5} />}
                    >
                      {actionLoading ? 'Loading...' : 'Get Started'}
                    </Button>
                  </div>
                </div>
              ) : !connectStatus.onboardingComplete || !connectStatus.chargesEnabled ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-warning-soft flex items-center justify-center flex-shrink-0">
                    <AlertCircleIcon size={18} className="text-warning" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 mb-1">Complete Payment Setup</h3>
                    <p className="text-[13px] text-stone-400 dark:text-stone-500 mb-4 leading-relaxed">
                      Your payment account needs additional information before you can receive payments.
                    </p>
                    <button
                      onClick={handleOnboard}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-warning text-white text-[13px] font-medium rounded-xl hover:bg-warning transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      {actionLoading ? 'Loading...' : 'Continue Setup'}
                      <ArrowRight01Icon size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-success-soft border border-success-soft/60 dark:bg-success/10 dark:border-success/20 flex items-center justify-center flex-shrink-0">
                    <CheckmarkCircle02Icon size={18} className="text-success dark:text-success/80" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 mb-1">Payments Active</h3>
                    <p className="text-[13px] text-stone-400 dark:text-stone-500 mb-4 leading-relaxed">
                      You&apos;ll receive payments automatically when customers complete bookings.
                    </p>
                    <Button
                      onClick={handleOpenDashboard}
                      loading={actionLoading}
                      variant="secondary"
                    >
                      {actionLoading ? 'Loading...' : 'View Dashboard'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
        </div>
      </div>
    </Container>
  );
};

export default SettingsClient;
