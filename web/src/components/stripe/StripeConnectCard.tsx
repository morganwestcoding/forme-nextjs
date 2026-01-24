'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface StripeConnectCardProps {
  userId: string;
  isOwner: boolean;
}

type ConnectStatus = {
  hasAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    pending_verification: string[];
  };
};

const StripeConnectCard: React.FC<StripeConnectCardProps> = ({ userId, isOwner }) => {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOwner) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [isOwner]);

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get('/api/stripe-connect/status');
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch Connect status:', error);
    } finally {
      setLoading(false);
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

  if (!isOwner) return null;

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-3 bg-gray-100 rounded w-2/3 mb-4"></div>
        <div className="h-9 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Not set up yet
  if (!status?.hasAccount) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Set Up Payments</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Connect your bank account to receive payments for your services. ForMe takes a 10% platform fee.
            </p>
            <button
              onClick={handleOnboard}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Loading...' : 'Get Started'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding incomplete
  if (!status.onboardingComplete || !status.chargesEnabled) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Complete Payment Setup</h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Your payment account needs additional information before you can receive payments.
            </p>
            <button
              onClick={handleOnboard}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Loading...' : 'Continue Setup'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fully set up
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-green-100 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Payments Active</h3>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            You&apos;ll receive payments automatically when customers complete bookings.
          </p>
          <button
            onClick={handleOpenDashboard}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
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
    </div>
  );
};

export default StripeConnectCard;
