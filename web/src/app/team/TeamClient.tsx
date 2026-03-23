'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { TeamData, TeamMember, TeamBooking } from '@/app/actions/getTeamData';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import toast from 'react-hot-toast';

interface TeamClientProps {
  currentUser: SafeUser;
  teamData: TeamData;
}

type TeamTab = 'overview' | 'schedule' | 'bookings' | 'clients';

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
    denied: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] || 'bg-stone-100 text-stone-500'}`}>
      {status}
    </span>
  );
};

const TeamClient: React.FC<TeamClientProps> = ({ currentUser, teamData }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TeamTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<Record<string, { startTime: string; endTime: string; isOff: boolean }>>({});
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});
  const [loadingClients, setLoadingClients] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);

  const { members, todayBookings, upcomingBookings, stats, listings } = teamData;

  const tabs: { key: TeamTab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'bookings', label: 'Bookings', count: todayBookings.length },
    { key: 'clients', label: 'Clients' },
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
    if (listings.length === 0) return;
    setLoadingClients(true);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/team/clients?listingId=${listings[0].id}${searchParam}`);
      const data = await res.json();
      setClients(data.clients || []);
      setClientsLoaded(true);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  }, [listings, searchQuery]);

  // --- Save client note ---
  const saveClientNote = useCallback(async (clientUserId: string) => {
    if (listings.length === 0) return;
    try {
      await fetch('/api/team/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listings[0].id,
          clientUserId,
          notes: clientNotes[clientUserId] || '',
        }),
      });
      toast.success('Note saved');
    } catch {
      toast.error('Failed to save note');
    }
  }, [listings, clientNotes]);

  // Load clients when tab is switched to clients
  React.useEffect(() => {
    if (activeTab === 'clients' && !clientsLoaded) {
      loadClients();
    }
  }, [activeTab, clientsLoaded, loadClients]);

  const getScheduleDisplay = (member: TeamMember, day: string) => {
    const avail = member.availability.find((a) => a.dayOfWeek === day);
    if (!avail || avail.isOff) return 'Off';
    return `${avail.startTime}-${avail.endTime}`;
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
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleBookingAction(booking.id, 'decline')}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
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
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Teammate Central</h1>
          <p className="text-[14px] text-stone-400 mt-1">
            {stats.totalMembers} team member{stats.totalMembers !== 1 ? 's' : ''}
            {listings.length > 0 && ` · ${listings[0].title}`}
          </p>
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
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleTimeOffAction(req.id, 'denied')}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
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
                            <span className={`text-[12px] px-2.5 py-1 rounded-lg ${
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
                                    className="w-full text-[11px] px-2 py-1 rounded-lg border border-stone-200 bg-white"
                                  />
                                  <input
                                    type="time"
                                    value={scheduleForm[day]?.endTime || '17:00'}
                                    onChange={(e) => setScheduleForm((prev) => ({
                                      ...prev,
                                      [day]: { ...prev[day], endTime: e.target.value },
                                    }))}
                                    className="w-full text-[11px] px-2 py-1 rounded-lg border border-stone-200 bg-white"
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
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTimeOffAction(req.id, 'denied')}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
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
                        className="flex-1 text-[12px] px-3 py-1.5 rounded-lg border border-stone-150 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-300 placeholder:text-stone-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default TeamClient;
