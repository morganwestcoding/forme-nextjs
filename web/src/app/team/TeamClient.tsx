'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SafeUser } from '@/app/types';
import { TeamData, TeamMember, TeamBooking } from '@/app/actions/getTeamData';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import toast from 'react-hot-toast';

interface TeamClientProps {
  currentUser: SafeUser;
  teamData: TeamData;
}

type TeamTab = 'overview' | 'schedule' | 'bookings' | 'clients' | 'pay';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600',
    accepted: 'bg-emerald-50 text-emerald-600',
    declined: 'bg-red-50 text-red-600',
    rescheduled: 'bg-blue-50 text-blue-600',
    approved: 'bg-emerald-50 text-emerald-600',
    completed: 'bg-emerald-50 text-emerald-600',
    denied: 'bg-red-50 text-red-600',
    charged: 'bg-stone-100 text-stone-600',
    waived: 'bg-purple-50 text-purple-600',
    processing: 'bg-blue-50 text-blue-600',
  };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] || 'bg-stone-100 text-stone-500'}`}>
      {status}
    </span>
  );
};

const TeamClient: React.FC<TeamClientProps> = ({ currentUser, teamData }) => {
  const router = useRouter();
  const { status } = useSession();

  const [activeTab, setActiveTab] = useState<TeamTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<Record<string, { startTime: string; endTime: string; isOff: boolean }>>({});
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});
  const [loadingClients, setLoadingClients] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);

  // Pay tab state
  const [editingAgreement, setEditingAgreement] = useState<string | null>(null);
  const [agreementForm, setAgreementForm] = useState<{ type: string; splitPercent: number; rentalAmount: number; rentalFrequency: string; autoApprovePayout: boolean }>({ type: 'chair_rental', splitPercent: 70, rentalAmount: 350, rentalFrequency: 'weekly', autoApprovePayout: false });
  const [balances, setBalances] = useState<Record<string, any>>({});
  const [payouts, setPayouts] = useState<Record<string, any[]>>({});
  const [payPeriods, setPayPeriods] = useState<Record<string, any[]>>({});

  const { members: allMembers, todayBookings: allTodayBookings, upcomingBookings: allUpcomingBookings, stats: allStats, listings, ownedListingIds } = teamData;

  // Listing filter — when connected to multiple listings
  const [selectedListingId, setSelectedListingId] = useState<string>(listings[0]?.id || '');

  // Filter everything by selected listing
  const members = allMembers.filter((m) => m.listingId === selectedListingId);
  const todayBookings = allTodayBookings.filter((b) => members.some((m) => m.id === b.employeeId));
  const upcomingBookings = allUpcomingBookings.filter((b) => members.some((m) => m.id === b.employeeId));
  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.isActive).length,
    todayBookingCount: todayBookings.length,
    weekRevenue: allStats.weekRevenue, // TODO: filter by listing when needed
    monthRevenue: members.reduce((sum, m) => sum + m.monthlyRevenue, 0),
    pendingTimeOff: members.flatMap((m) => m.timeOffRequests).filter((t) => t.status === 'pending').length,
  };
  const selectedListing = listings.find((l) => l.id === selectedListingId);
  const isOwnerOfSelected = ownedListingIds.includes(selectedListingId);
  const myEmployee = members.find((m) => m.userId === currentUser.id);

  // Pay request state for employees
  const [payoutAmount, setPayoutAmount] = useState('');
  const [requestingPayout, setRequestingPayout] = useState(false);

  const tabs: { key: TeamTab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'bookings', label: 'Bookings', count: todayBookings.length },
    ...(isOwnerOfSelected ? [{ key: 'clients' as TeamTab, label: 'Clients' }] : []),
    { key: 'pay', label: isOwnerOfSelected ? 'Pay' : 'My Pay' },
  ];

  // --- Schedule editing ---
  const startEditSchedule = (member: TeamMember) => {
    const form: Record<string, { startTime: string; endTime: string; isOff: boolean }> = {};
    for (const day of DAYS) {
      const existing = member.availability.find((a) => a.dayOfWeek === day);
      form[day] = existing
        ? { startTime: existing.startTime, endTime: existing.endTime, isOff: existing.isOff }
        : { startTime: '09:00', endTime: '17:00', isOff: false };
    }
    setScheduleForm(form);
    setEditingSchedule(member.id);
  };

  const saveSchedule = useCallback(async (employeeId: string) => {
    try {
      const schedule = DAYS.map((day) => ({
        dayOfWeek: day,
        ...scheduleForm[day],
      }));

      const res = await fetch('/api/team/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, schedule }),
      });

      if (!res.ok) throw new Error('Failed to save');
      toast.success('Schedule saved');
      setEditingSchedule(null);
      router.refresh();
    } catch {
      toast.error('Failed to save schedule');
    }
  }, [scheduleForm, router]);

  // --- Booking actions ---
  const handleBookingAction = useCallback(async (reservationId: string, action: string) => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Booking ${action === 'accept' ? 'accepted' : 'declined'}`);
      router.refresh();
    } catch {
      toast.error('Action failed');
    }
  }, [router]);

  // --- Time off actions ---
  const handleTimeOffAction = useCallback(async (requestId: string, status: string) => {
    try {
      const res = await fetch('/api/team/time-off', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Time off ${status}`);
      router.refresh();
    } catch {
      toast.error('Action failed');
    }
  }, [router]);

  // --- Load clients ---
  const loadClients = useCallback(async () => {
    if (!selectedListingId) return;
    setLoadingClients(true);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/team/clients?listingId=${selectedListingId}${searchParam}`);
      const data = await res.json();
      setClients(data.clients || []);
      setClientsLoaded(true);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  }, [selectedListingId, searchQuery]);

  // --- Save client note ---
  const saveClientNote = useCallback(async (clientUserId: string) => {
    if (!selectedListingId) return;
    try {
      await fetch('/api/team/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListingId,
          clientUserId,
          notes: clientNotes[clientUserId] || '',
        }),
      });
      toast.success('Note saved');
    } catch {
      toast.error('Failed to save note');
    }
  }, [selectedListingId, clientNotes]);

  // --- Pay tab handlers ---
  const loadPayData = useCallback(async (employeeId: string) => {
    try {
      const [balRes, payoutRes, periodRes] = await Promise.all([
        fetch(`/api/team/pay/balance?employeeId=${employeeId}`),
        fetch(`/api/team/pay/payout?employeeId=${employeeId}`),
        fetch(`/api/team/pay/periods?employeeId=${employeeId}`),
      ]);
      const [bal, pay, per] = await Promise.all([balRes.json(), payoutRes.json(), periodRes.json()]);
      setBalances((prev) => ({ ...prev, [employeeId]: bal }));
      setPayouts((prev) => ({ ...prev, [employeeId]: pay.payouts || [] }));
      setPayPeriods((prev) => ({ ...prev, [employeeId]: per.periods || [] }));
    } catch {
      toast.error('Failed to load pay data');
    }
  }, []);

  const requestPayout = useCallback(async () => {
    if (!myEmployee || !payoutAmount || Number(payoutAmount) <= 0) return;
    setRequestingPayout(true);
    try {
      const res = await fetch('/api/team/pay/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: myEmployee.id, amount: Number(payoutAmount) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      toast.success('Payout requested');
      setPayoutAmount('');
      loadPayData(myEmployee.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  }, [myEmployee, payoutAmount, loadPayData]);

  const saveAgreement = useCallback(async (employeeId: string) => {
    try {
      const res = await fetch('/api/team/pay/agreement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, ...agreementForm }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Pay agreement saved');
      setEditingAgreement(null);
      router.refresh();
    } catch {
      toast.error('Failed to save agreement');
    }
  }, [agreementForm, router]);

  const handlePayoutAction = useCallback(async (payoutId: string, action: string) => {
    try {
      const res = await fetch('/api/team/pay/payout', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, action }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Payout ${action === 'approve' ? 'approved' : 'denied'}`);
      // Reload pay data for the affected employee
      const payout = payouts[Object.keys(payouts).find((k) => payouts[k].some((p: any) => p.id === payoutId)) || ''];
      if (payout) router.refresh();
    } catch {
      toast.error('Action failed');
    }
  }, [payouts, router]);

  const waivePeriod = useCallback(async (periodId: string, employeeId: string) => {
    try {
      const res = await fetch('/api/team/pay/periods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, action: 'waive' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Fee waived');
      loadPayData(employeeId);
    } catch {
      toast.error('Failed to waive fee');
    }
  }, [loadPayData]);

  const generatePeriod = useCallback(async (employeeId: string) => {
    try {
      const res = await fetch('/api/team/pay/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) { toast.error('Period already exists'); return; }
        throw new Error(data.error);
      }
      toast.success('Fee period created');
      loadPayData(employeeId);
    } catch {
      toast.error('Failed to generate period');
    }
  }, [loadPayData]);

  // Load pay data when tab is switched
  const payDataLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (activeTab === 'pay' && !payDataLoadedRef.current && members.length > 0) {
      payDataLoadedRef.current = true;
      members.forEach((m) => loadPayData(m.id));
    }
    if (activeTab !== 'pay') {
      payDataLoadedRef.current = false;
    }
  }, [activeTab, members, loadPayData]);

  // Load clients when tab is switched to clients
  React.useEffect(() => {
    if (activeTab === 'clients' && !clientsLoaded) {
      loadClients();
    }
  }, [activeTab, clientsLoaded, loadClients]);

  // Guard against sign-out re-render
  if (!currentUser || status === 'unauthenticated') {
    return null;
  }

  const to12h = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'pm' : 'am';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const getScheduleDisplay = (member: TeamMember, day: string) => {
    const avail = member.availability.find((a) => a.dayOfWeek === day);
    if (!avail || avail.isOff) return 'Off';
    return `${to12h(avail.startTime)} - ${to12h(avail.endTime)}`;
  };

  const pendingTimeOffRequests = members.flatMap((m) =>
    m.timeOffRequests
      .filter((t) => t.status === 'pending')
      .map((t) => ({ ...t, employeeName: m.fullName }))
  );

  const BookingCard = ({ booking, showActions }: { booking: TeamBooking; showActions?: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/60 bg-white hover:border-stone-300 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-stone-100">
          {booking.clientImage ? (
            <Image src={booking.clientImage} alt="" width={36} height={36} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[13px] font-medium">
              {booking.clientName?.[0] || '?'}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-stone-900 truncate">{booking.clientName || 'Client'}</p>
          <p className="text-[12px] text-stone-400 truncate">{booking.serviceName} · {booking.time} · {booking.employeeName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] font-bold text-stone-900 tabular-nums">${booking.totalPrice}</span>
        {showActions && booking.status === 'pending' ? (
          <div className="flex gap-1.5 ml-2">
            <button
              onClick={() => handleBookingAction(booking.id, 'accept')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleBookingAction(booking.id, 'decline')}
              className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
            >
              Decline
            </button>
          </div>
        ) : (
          <StatusBadge status={booking.status} />
        )}
      </div>
    </div>
  );

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Teammate Central" />

      <div className="mt-8 pb-16">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Teammate Central</h1>
              <p className="text-[14px] text-stone-400 mt-1">
                {stats.totalMembers} team member{stats.totalMembers !== 1 ? 's' : ''}
                {selectedListing && ` · ${selectedListing.title}`}
              </p>
            </div>
            {listings.length > 1 && (
              <select
                value={selectedListingId}
                onChange={(e) => {
                  setSelectedListingId(e.target.value);
                  setClientsLoaded(false);
                }}
                className="text-[13px] px-4 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-stone-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Team Members', value: stats.totalMembers },
                { label: 'Active Now', value: stats.activeMembers },
                { label: "Today's Bookings", value: stats.todayBookingCount },
                { label: 'This Month', value: `$${stats.monthRevenue.toLocaleString()}` },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-stone-200/60 p-5 bg-white hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                >
                  <p className="text-[12px] text-stone-400">{stat.label}</p>
                  <p className="text-[24px] font-bold text-stone-900 tabular-nums mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Today's bookings preview */}
            {todayBookings.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-stone-900 tracking-tight">Today&apos;s Bookings</h2>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {todayBookings.slice(0, 5).map((booking, idx) => (
                    <div key={booking.id} style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}>
                      <BookingCard booking={booking} showActions />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team list */}
            <div>
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">Team</h2>
              {members.length === 0 ? (
                <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                  <p className="text-stone-400 text-[14px]">No team members yet. Add employees to your listing to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, idx) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200/60 bg-white hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                      style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-stone-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        {(member.user.image || member.user.imageSrc) ? (
                          <Image src={member.user.image || member.user.imageSrc || ''} alt={member.fullName} width={44} height={44} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500 text-[15px] font-semibold">
                            {member.fullName[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-stone-900">{member.fullName}</p>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 capitalize">{member.teamRole}</span>
                        </div>
                        <p className="text-[12px] text-stone-400">{member.jobTitle || 'Team Member'}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-[14px] font-bold text-stone-900 tabular-nums">${member.monthlyRevenue.toLocaleString()}</p>
                          <p className="text-[11px] text-stone-400">this month</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${member.isActive ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending time off */}
            {pendingTimeOffRequests.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">
                  Time Off Requests
                  <span className="ml-2 text-[12px] font-normal text-amber-500">{pendingTimeOffRequests.length} pending</span>
                </h2>
                <div className="space-y-3">
                  {pendingTimeOffRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/60 bg-white">
                      <div>
                        <p className="text-[14px] font-medium text-stone-900">{req.employeeName}</p>
                        <p className="text-[12px] text-stone-400">
                          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                          {req.reason && ` · ${req.reason}`}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleTimeOffAction(req.id, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleTimeOffAction(req.id, 'denied')}
                          className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SCHEDULE ===== */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight">Weekly Schedule</h2>
            </div>

            {members.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                <p className="text-stone-400 text-[14px]">No team members to schedule.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200/60 overflow-hidden bg-white">
                {/* Header row */}
                <div className="grid grid-cols-8 border-b border-stone-100">
                  <div className="p-4 text-[12px] text-stone-400">Team</div>
                  {DAYS.map((day) => (
                    <div key={day} className="p-4 text-[12px] text-stone-400 text-center">{DAY_SHORT[day]}</div>
                  ))}
                </div>

                {/* Member rows */}
                {members.map((member) => (
                  <div key={member.id}>
                    <div className="grid grid-cols-8 border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                      <div className="p-4 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-stone-100">
                          {(member.user.image || member.user.imageSrc) ? (
                            <Image src={member.user.image || member.user.imageSrc || ''} alt="" width={28} height={28} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[11px] font-medium">
                              {member.fullName[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-stone-700 truncate block">{member.fullName.split(' ')[0]}</span>
                          <button
                            onClick={() => editingSchedule === member.id ? setEditingSchedule(null) : startEditSchedule(member)}
                            className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
                          >
                            {editingSchedule === member.id ? 'Cancel' : 'Edit'}
                          </button>
                        </div>
                      </div>
                      {DAYS.map((day) => {
                        const shift = getScheduleDisplay(member, day);
                        const isOff = shift === 'Off';
                        return (
                          <div key={day} className="p-4 flex items-center justify-center">
                            <span className={`text-[12px] px-2.5 py-1 rounded-xl ${
                              isOff
                                ? 'text-stone-300 bg-stone-50'
                                : 'text-stone-600 bg-stone-100 font-medium'
                            }`}>
                              {shift}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Edit row */}
                    {editingSchedule === member.id && (
                      <div className="border-b border-stone-100 bg-stone-50/50 p-4">
                        <div className="grid grid-cols-7 gap-3 mb-4">
                          {DAYS.map((day) => (
                            <div key={day} className="space-y-2">
                              <p className="text-[11px] font-medium text-stone-500 text-center">{DAY_SHORT[day]}</p>
                              <label className="flex items-center justify-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={scheduleForm[day]?.isOff ?? false}
                                  onChange={(e) => setScheduleForm((prev) => ({
                                    ...prev,
                                    [day]: { ...prev[day], isOff: e.target.checked },
                                  }))}
                                  className="w-3.5 h-3.5 rounded border-stone-300"
                                />
                                <span className="text-[11px] text-stone-400">Off</span>
                              </label>
                              {!scheduleForm[day]?.isOff && (
                                <div className="space-y-1">
                                  <input
                                    type="time"
                                    value={scheduleForm[day]?.startTime || '09:00'}
                                    onChange={(e) => setScheduleForm((prev) => ({
                                      ...prev,
                                      [day]: { ...prev[day], startTime: e.target.value },
                                    }))}
                                    className="w-full text-[11px] px-2 py-1 rounded-xl border border-stone-200 bg-white"
                                  />
                                  <input
                                    type="time"
                                    value={scheduleForm[day]?.endTime || '17:00'}
                                    onChange={(e) => setScheduleForm((prev) => ({
                                      ...prev,
                                      [day]: { ...prev[day], endTime: e.target.value },
                                    }))}
                                    className="w-full text-[11px] px-2 py-1 rounded-xl border border-stone-200 bg-white"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingSchedule(null)}
                            className="px-4 py-2 rounded-xl text-[13px] font-medium text-stone-500 hover:bg-stone-100 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveSchedule(member.id)}
                            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-all"
                            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                          >
                            Save Schedule
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* All time off requests */}
            {members.some((m) => m.timeOffRequests.length > 0) && (
              <div>
                <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">Time Off Requests</h2>
                <div className="space-y-3">
                  {members.flatMap((m) =>
                    m.timeOffRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/60 bg-white">
                        <div>
                          <p className="text-[14px] font-medium text-stone-900">{m.fullName}</p>
                          <p className="text-[12px] text-stone-400">
                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                            {req.reason && ` · ${req.reason}`}
                          </p>
                        </div>
                        {req.status === 'pending' ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleTimeOffAction(req.id, 'approved')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTimeOffAction(req.id, 'denied')}
                              className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                            >
                              Deny
                            </button>
                          </div>
                        ) : (
                          <StatusBadge status={req.status} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== BOOKINGS ===== */}
        {activeTab === 'bookings' && (
          <div className="space-y-8">
            {/* Today */}
            <div>
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">
                Today
                <span className="ml-2 text-[14px] font-normal text-stone-400">{todayBookings.length} booking{todayBookings.length !== 1 ? 's' : ''}</span>
              </h2>
              {todayBookings.length === 0 ? (
                <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                  <p className="text-stone-400 text-[14px]">No bookings today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map((booking, idx) => (
                    <div key={booking.id} style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}>
                      <BookingCard booking={booking} showActions />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div>
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">
                Upcoming
                <span className="ml-2 text-[14px] font-normal text-stone-400">{upcomingBookings.length} booking{upcomingBookings.length !== 1 ? 's' : ''}</span>
              </h2>
              {upcomingBookings.length === 0 ? (
                <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                  <p className="text-stone-400 text-[14px]">No upcoming bookings this week</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking, idx) => {
                    const date = new Date(booking.date);
                    return (
                      <div key={booking.id} style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/60 bg-white hover:border-stone-300 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-center shrink-0 w-12">
                              <p className="text-[11px] text-stone-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                              <p className="text-[18px] font-bold text-stone-900 tabular-nums">{date.getDate()}</p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-stone-900 truncate">{booking.clientName || 'Client'}</p>
                              <p className="text-[12px] text-stone-400 truncate">{booking.serviceName} · {booking.time} · {booking.employeeName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[13px] font-bold text-stone-900 tabular-nums">${booking.totalPrice}</span>
                            <StatusBadge status={booking.status} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== CLIENTS ===== */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight shrink-0">Clients</h2>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadClients()}
                className="flex-1 max-w-xs text-[13px] px-4 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            {loadingClients ? (
              <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                <p className="text-stone-400 text-[14px]">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                <p className="text-stone-400 text-[14px]">
                  {clientsLoaded ? 'No clients found' : 'Loading...'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client: any, idx: number) => (
                  <div
                    key={client.userId}
                    className="rounded-2xl border border-stone-200/60 bg-white hover:border-stone-300 transition-all overflow-hidden"
                    style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-100">
                          {client.image ? (
                            <Image src={client.image} alt="" width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[14px] font-medium">
                              {client.name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-stone-900 truncate">{client.name || 'Unknown'}</p>
                          <p className="text-[12px] text-stone-400 truncate">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right shrink-0">
                        <div>
                          <p className="text-[14px] font-bold text-stone-900 tabular-nums">{client.visitCount}</p>
                          <p className="text-[11px] text-stone-400">visits</p>
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-stone-900 tabular-nums">${client.totalSpent.toLocaleString()}</p>
                          <p className="text-[11px] text-stone-400">spent</p>
                        </div>
                        <div>
                          <p className="text-[12px] text-stone-500">{new Date(client.lastVisit).toLocaleDateString()}</p>
                          <p className="text-[11px] text-stone-400">last visit</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent bookings */}
                    {client.recentBookings?.length > 0 && (
                      <div className="px-4 pb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {client.recentBookings.slice(0, 3).map((b: any) => (
                            <span key={b.id} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-50 text-stone-500">
                              {b.serviceName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="px-4 pb-4 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add a note about this client..."
                        value={clientNotes[client.userId] ?? client.notes ?? ''}
                        onChange={(e) => setClientNotes((prev) => ({ ...prev, [client.userId]: e.target.value }))}
                        onBlur={() => saveClientNote(client.userId)}
                        className="flex-1 text-[12px] px-3 py-1.5 rounded-xl border border-stone-150 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-300 placeholder:text-stone-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== PAY ===== */}
        {activeTab === 'pay' && !isOwnerOfSelected && myEmployee && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-stone-900 tracking-tight">My Pay</h2>

            {/* Balance card */}
            {balances[myEmployee.id] ? (
              <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {[
                    { label: 'Total Revenue', value: `$${balances[myEmployee.id].totalRevenue?.toLocaleString() || '0'}` },
                    { label: 'My Earnings', value: `$${balances[myEmployee.id].grossEarnings?.toLocaleString() || '0'}` },
                    { label: 'Fees Deducted', value: `$${balances[myEmployee.id].totalRentalFees?.toLocaleString() || '0'}` },
                    { label: 'Available Balance', value: `$${balances[myEmployee.id].availableBalance?.toLocaleString() || '0'}`, highlight: balances[myEmployee.id].availableBalance < 0 },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[11px] text-stone-400">{stat.label}</p>
                      <p className={`text-[22px] font-bold tabular-nums mt-1 ${stat.highlight ? 'text-red-500' : 'text-stone-900'}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Agreement info */}
                <div className="border-t border-stone-100 pt-4 mb-4">
                  <p className="text-[12px] text-stone-400">
                    {myEmployee.payAgreement
                      ? myEmployee.payAgreement.type === 'commission'
                        ? `You keep ${myEmployee.payAgreement.splitPercent}% of each booking`
                        : `Chair rental: $${myEmployee.payAgreement.rentalAmount} ${myEmployee.payAgreement.rentalFrequency}`
                      : 'No pay agreement set up — talk to your manager'}
                  </p>
                </div>

                {/* Payout request */}
                {balances[myEmployee.id].availableBalance > 0 && (
                  <div className="border-t border-stone-100 pt-4">
                    <h4 className="text-[13px] font-semibold text-stone-900 mb-3">Request Payout</h4>
                    <div className="flex gap-3 items-end">
                      <div>
                        <label className="text-[11px] text-stone-400 block mb-1">Amount ($)</label>
                        <input
                          type="number"
                          min={1}
                          max={balances[myEmployee.id].availableBalance}
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder={`Up to $${balances[myEmployee.id].availableBalance.toFixed(2)}`}
                          className="w-48 text-[13px] px-3 py-2 rounded-xl border border-stone-200 bg-white"
                        />
                      </div>
                      <button
                        onClick={requestPayout}
                        disabled={requestingPayout || !payoutAmount || Number(payoutAmount) <= 0}
                        className="px-5 py-2 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-all disabled:opacity-50"
                      >
                        {requestingPayout ? 'Requesting...' : 'Request Payout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                <p className="text-stone-400 text-[14px]">Loading pay data...</p>
              </div>
            )}

            {/* Fee periods */}
            {(payPeriods[myEmployee.id] || []).length > 0 && (
              <div className="rounded-2xl border border-stone-200/60 bg-white p-5">
                <h4 className="text-[13px] font-semibold text-stone-900 mb-3">Fee History</h4>
                <div className="space-y-2">
                  {(payPeriods[myEmployee.id] || []).map((period: any) => (
                    <div key={period.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-[12px] text-stone-700">
                          {new Date(period.periodStart).toLocaleDateString()} - {new Date(period.periodEnd).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-stone-400">${period.feeAmount}</p>
                      </div>
                      <StatusBadge status={period.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payout history */}
            {(payouts[myEmployee.id] || []).length > 0 && (
              <div className="rounded-2xl border border-stone-200/60 bg-white p-5">
                <h4 className="text-[13px] font-semibold text-stone-900 mb-3">Payout History</h4>
                <div className="space-y-2">
                  {(payouts[myEmployee.id] || []).map((payout: any) => (
                    <div key={payout.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-[13px] font-medium text-stone-900 tabular-nums">${payout.amount.toFixed(2)}</p>
                        <p className="text-[11px] text-stone-400">{new Date(payout.requestedAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={payout.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PAY (Owner View) ===== */}
        {activeTab === 'pay' && isOwnerOfSelected && (
          <div className="space-y-8">
            {members.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/60 p-8 bg-white text-center">
                <p className="text-stone-400 text-[14px]">No team members to manage pay for.</p>
              </div>
            ) : (
              members.map((member, idx) => {
                const bal = balances[member.id];
                const memberPayouts = payouts[member.id] || [];
                const memberPeriods = payPeriods[member.id] || [];
                const isEditing = editingAgreement === member.id;

                return (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-stone-200/60 bg-white overflow-hidden"
                    style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}
                  >
                    {/* Member header */}
                    <div className="flex items-center justify-between p-5 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100">
                          {(member.user.image || member.user.imageSrc) ? (
                            <Image src={member.user.image || member.user.imageSrc || ''} alt="" width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-500 text-[14px] font-semibold">{member.fullName[0]}</div>
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-stone-900">{member.fullName}</p>
                          <p className="text-[12px] text-stone-400">
                            {member.payAgreement
                              ? member.payAgreement.type === 'commission'
                                ? `${member.payAgreement.splitPercent}% commission`
                                : `$${member.payAgreement.rentalAmount}/${member.payAgreement.rentalFrequency} chair rental`
                              : 'No pay agreement'}
                            {member.stripeConnectSetup ? '' : ' · Payment account not set up'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isEditing) {
                            setEditingAgreement(null);
                          } else {
                            setAgreementForm(member.payAgreement ? {
                              type: member.payAgreement.type,
                              splitPercent: member.payAgreement.splitPercent || 70,
                              rentalAmount: member.payAgreement.rentalAmount || 350,
                              rentalFrequency: member.payAgreement.rentalFrequency || 'weekly',
                              autoApprovePayout: member.payAgreement.autoApprovePayout,
                            } : { type: 'chair_rental', splitPercent: 70, rentalAmount: 350, rentalFrequency: 'weekly', autoApprovePayout: false });
                            setEditingAgreement(member.id);
                          }
                        }}
                        className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-stone-50"
                      >
                        {isEditing ? 'Cancel' : member.payAgreement ? 'Edit Agreement' : 'Set Up Pay'}
                      </button>
                    </div>

                    {/* Agreement editor */}
                    {isEditing && (
                      <div className="p-5 border-b border-stone-100 bg-stone-50/50 space-y-4">
                        <div className="flex gap-3">
                          {['chair_rental', 'commission'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setAgreementForm((prev) => ({ ...prev, type }))}
                              className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                                agreementForm.type === type ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-500'
                              }`}
                            >
                              {type === 'chair_rental' ? 'Chair Rental' : 'Commission Split'}
                            </button>
                          ))}
                        </div>

                        {agreementForm.type === 'chair_rental' ? (
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">Rental Amount ($)</label>
                              <input
                                type="number"
                                value={agreementForm.rentalAmount}
                                onChange={(e) => setAgreementForm((prev) => ({ ...prev, rentalAmount: Number(e.target.value) }))}
                                className="w-32 text-[13px] px-3 py-2 rounded-xl border border-stone-200 bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">Frequency</label>
                              <select
                                value={agreementForm.rentalFrequency}
                                onChange={(e) => setAgreementForm((prev) => ({ ...prev, rentalFrequency: e.target.value }))}
                                className="text-[13px] px-3 py-2 rounded-xl border border-stone-200 bg-white"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-[11px] text-stone-400 block mb-1">Employee keeps (%)</label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={agreementForm.splitPercent}
                              onChange={(e) => setAgreementForm((prev) => ({ ...prev, splitPercent: Number(e.target.value) }))}
                              className="w-32 text-[13px] px-3 py-2 rounded-xl border border-stone-200 bg-white"
                            />
                            <p className="text-[11px] text-stone-400 mt-1">Business keeps {100 - agreementForm.splitPercent}%</p>
                          </div>
                        )}

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreementForm.autoApprovePayout}
                            onChange={(e) => setAgreementForm((prev) => ({ ...prev, autoApprovePayout: e.target.checked }))}
                            className="w-4 h-4 rounded border-stone-300"
                          />
                          <span className="text-[13px] text-stone-600">Auto-approve payout requests</span>
                        </label>

                        <button
                          onClick={() => saveAgreement(member.id)}
                          className="px-5 py-2 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-all"
                        >
                          Save Agreement
                        </button>
                      </div>
                    )}

                    {/* Balance summary */}
                    {bal && (
                      <div className="p-5 border-b border-stone-100">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Total Revenue', value: `$${bal.totalRevenue?.toLocaleString() || '0'}` },
                            { label: 'Earnings', value: `$${bal.grossEarnings?.toLocaleString() || '0'}` },
                            { label: 'Fees Charged', value: `$${bal.totalRentalFees?.toLocaleString() || '0'}` },
                            { label: 'Available Balance', value: `$${bal.availableBalance?.toLocaleString() || '0'}`, highlight: bal.availableBalance < 0 },
                          ].map((stat, i) => (
                            <div key={i} className="text-center">
                              <p className="text-[11px] text-stone-400">{stat.label}</p>
                              <p className={`text-[18px] font-bold tabular-nums mt-0.5 ${stat.highlight ? 'text-red-500' : 'text-stone-900'}`}>{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rental fee periods (chair rental only) */}
                    {member.payAgreement?.type === 'chair_rental' && memberPeriods.length > 0 && (
                      <div className="p-5 border-b border-stone-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[13px] font-semibold text-stone-900">Rental Fees</h4>
                          <button
                            onClick={() => generatePeriod(member.id)}
                            className="text-[11px] text-stone-400 hover:text-stone-600 px-2 py-1 rounded-xl hover:bg-stone-50 transition-colors"
                          >
                            + Generate Period
                          </button>
                        </div>
                        <div className="space-y-2">
                          {memberPeriods.slice(0, 5).map((period: any) => (
                            <div key={period.id} className="flex items-center justify-between py-2">
                              <div>
                                <p className="text-[12px] text-stone-700">
                                  {new Date(period.periodStart).toLocaleDateString()} - {new Date(period.periodEnd).toLocaleDateString()}
                                </p>
                                <p className="text-[11px] text-stone-400">${period.feeAmount}</p>
                              </div>
                              {period.status === 'charged' ? (
                                <div className="flex items-center gap-2">
                                  <StatusBadge status="charged" />
                                  <button
                                    onClick={() => waivePeriod(period.id, member.id)}
                                    className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
                                  >
                                    Waive
                                  </button>
                                </div>
                              ) : (
                                <StatusBadge status={period.status} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payout history */}
                    {memberPayouts.length > 0 && (
                      <div className="p-5">
                        <h4 className="text-[13px] font-semibold text-stone-900 mb-3">Payouts</h4>
                        <div className="space-y-2">
                          {memberPayouts.slice(0, 5).map((payout: any) => (
                            <div key={payout.id} className="flex items-center justify-between py-2">
                              <div>
                                <p className="text-[13px] font-medium text-stone-900 tabular-nums">${payout.amount.toFixed(2)}</p>
                                <p className="text-[11px] text-stone-400">{new Date(payout.requestedAt).toLocaleDateString()}</p>
                              </div>
                              {payout.status === 'pending' ? (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handlePayoutAction(payout.id, 'approve')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handlePayoutAction(payout.id, 'deny')}
                                    className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                                  >
                                    Deny
                                  </button>
                                </div>
                              ) : (
                                <StatusBadge status={payout.status} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty state for no pay data */}
                    {!bal && !isEditing && (
                      <div className="p-5 text-center">
                        <p className="text-[12px] text-stone-400">Loading pay data...</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default TeamClient;
