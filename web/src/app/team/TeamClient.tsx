'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeUser } from '@/app/types';
import { Calendar03Icon, AnalyticsUpIcon, Clock01Icon, Location01Icon } from 'hugeicons-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';

interface TeamClientProps {
  currentUser: SafeUser;
}

type TeamTab = 'overview' | 'schedule' | 'chair' | 'earnings' | 'payroll';

// Mock team members
const TEAM = [
  { id: '1', name: 'Marcus Johnson', role: 'Lead Barber', image: '/assets/people/barber.png', status: 'active' as const, earnings: 4250, hours: 38, rating: 4.9 },
  { id: '2', name: 'Priya Mehta', role: 'Esthetician', image: '/assets/people/skincare.png', status: 'active' as const, earnings: 3800, hours: 35, rating: 5.0 },
  { id: '3', name: 'Luna Kim', role: 'Lash Tech', image: '/assets/people/lashes.png', status: 'away' as const, earnings: 2900, hours: 28, rating: 4.8 },
  { id: '4', name: 'Sofia Rodriguez', role: 'Nail Artist', image: '/assets/people/nails.png', status: 'active' as const, earnings: 3100, hours: 32, rating: 4.7 },
];

// Mock schedule data
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCHEDULE: Record<string, Record<string, string>> = {
  '1': { Mon: '9-5', Tue: '9-5', Wed: '9-5', Thu: '10-7', Fri: '9-5', Sat: '10-4', Sun: 'Off' },
  '2': { Mon: '10-6', Tue: '10-6', Wed: 'Off', Thu: '10-6', Fri: '10-6', Sat: '9-3', Sun: 'Off' },
  '3': { Mon: 'Off', Tue: '11-7', Wed: '11-7', Thu: '11-7', Fri: '11-7', Sat: '10-5', Sun: 'Off' },
  '4': { Mon: '9-5', Tue: '9-5', Wed: '9-5', Thu: 'Off', Fri: '9-5', Sat: '9-4', Sun: 'Off' },
};

// Mock chair/lease data
const CHAIR_LEASES = [
  { id: '1', member: 'Marcus Johnson', type: 'Weekly Flat Rate', amount: 350, status: 'current', dueDate: 'Every Monday', booth: 'Chair 1' },
  { id: '2', member: 'Priya Mehta', type: 'Commission Split', amount: 30, status: 'current', dueDate: 'Bi-weekly', booth: 'Suite A' },
  { id: '3', member: 'Luna Kim', type: 'Daily Rate', amount: 75, status: 'current', dueDate: 'Per shift', booth: 'Chair 3' },
  { id: '4', member: 'Sofia Rodriguez', type: 'Monthly Lease', amount: 1200, status: 'current', dueDate: '1st of month', booth: 'Station 2' },
];

// Mock earnings data
const MONTHLY_EARNINGS = [
  { month: 'Oct', revenue: 12400, expenses: 3200 },
  { month: 'Nov', revenue: 14800, expenses: 3500 },
  { month: 'Dec', revenue: 18200, expenses: 4100 },
  { month: 'Jan', revenue: 13600, expenses: 3300 },
  { month: 'Feb', revenue: 15900, expenses: 3600 },
  { month: 'Mar', revenue: 16500, expenses: 3800 },
];

// Mock payroll
const PAYROLL_HISTORY = [
  { id: '1', period: 'Mar 1 - Mar 15', total: 6840, status: 'paid', date: 'Mar 16, 2026' },
  { id: '2', period: 'Feb 15 - Feb 28', total: 7120, status: 'paid', date: 'Mar 1, 2026' },
  { id: '3', period: 'Feb 1 - Feb 14', total: 6550, status: 'paid', date: 'Feb 15, 2026' },
  { id: '4', period: 'Jan 15 - Jan 31', total: 6980, status: 'paid', date: 'Feb 1, 2026' },
];

const TeamClient: React.FC<TeamClientProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<TeamTab>('overview');

  const tabs: { key: TeamTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'chair', label: 'Chair & Leasing' },
    { key: 'earnings', label: 'Earnings' },
    { key: 'payroll', label: 'Payroll' },
  ];

  const totalRevenue = MONTHLY_EARNINGS.reduce((sum, m) => sum + m.revenue, 0);
  const totalTeamEarnings = TEAM.reduce((sum, m) => sum + m.earnings, 0);
  const maxEarning = Math.max(...MONTHLY_EARNINGS.map(m => m.revenue));

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Teammate Central" />

      <div className="mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Teammate Central</h1>
          <p className="text-[14px] text-stone-400 mt-1">{TEAM.length} team members</p>
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

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Team Members', value: TEAM.length },
                { label: 'Active Now', value: TEAM.filter(m => m.status === 'active').length },
                { label: 'This Month', value: `$${totalTeamEarnings.toLocaleString()}` },
                { label: 'Avg Rating', value: (TEAM.reduce((s, m) => s + m.rating, 0) / TEAM.length).toFixed(1) },
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

            {/* Team list */}
            <div>
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">Team</h2>
              <div className="space-y-3">
                {TEAM.map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200/60 bg-white hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Image src={member.image} alt={member.name} width={44} height={44} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-stone-900">{member.name}</p>
                      <p className="text-[12px] text-stone-400">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-[14px] font-bold text-stone-900 tabular-nums">${member.earnings.toLocaleString()}</p>
                        <p className="text-[11px] text-stone-400">this month</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${member.status === 'active' ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== SCHEDULE ===== */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight">Weekly Schedule</h2>
              <button className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-all" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                Edit Schedule
              </button>
            </div>

            <div className="rounded-2xl border border-stone-200/60 overflow-hidden bg-white">
              {/* Header row */}
              <div className="grid grid-cols-8 border-b border-stone-100">
                <div className="p-4 text-[12px] text-stone-400">Team</div>
                {DAYS.map(day => (
                  <div key={day} className="p-4 text-[12px] text-stone-400 text-center">{day}</div>
                ))}
              </div>

              {/* Member rows */}
              {TEAM.map((member) => (
                <div key={member.id} className="grid grid-cols-8 border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                  <div className="p-4 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                      <Image src={member.image} alt="" width={28} height={28} className="object-cover w-full h-full" />
                    </div>
                    <span className="text-[13px] font-medium text-stone-700 truncate">{member.name.split(' ')[0]}</span>
                  </div>
                  {DAYS.map(day => {
                    const shift = SCHEDULE[member.id]?.[day] || 'Off';
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
              ))}
            </div>

            {/* Vacation requests */}
            <div>
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-4">Time Off Requests</h2>
              <div className="space-y-3">
                {[
                  { name: 'Luna Kim', dates: 'Mar 24 - Mar 28', reason: 'Vacation', status: 'pending' },
                  { name: 'Marcus Johnson', dates: 'Apr 5 - Apr 6', reason: 'Personal', status: 'approved' },
                ].map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/60 bg-white">
                    <div>
                      <p className="text-[14px] font-medium text-stone-900">{req.name}</p>
                      <p className="text-[12px] text-stone-400">{req.dates} · {req.reason}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${
                      req.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {req.status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== CHAIR & LEASING ===== */}
        {activeTab === 'chair' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight">Chair & Booth Leasing</h2>
              <button className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-all" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                Add Lease
              </button>
            </div>

            {/* Lease type cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Weekly Flat', desc: 'Fixed weekly rate', Icon: Calendar03Icon },
                { label: 'Commission', desc: 'Revenue split %', Icon: AnalyticsUpIcon },
                { label: 'Daily Rate', desc: 'Per-shift charge', Icon: Clock01Icon },
                { label: 'Monthly', desc: 'Long-term lease', Icon: Location01Icon },
              ].map((type, i) => (
                <div key={i} className="rounded-2xl border border-stone-200/60 p-5 bg-white hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <type.Icon className="w-[22px] h-[22px] text-stone-500" strokeWidth={1.5} />
                  <p className="text-[14px] font-semibold text-stone-900 mt-3">{type.label}</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">{type.desc}</p>
                </div>
              ))}
            </div>

            {/* Active leases */}
            <div>
              <h3 className="text-[15px] font-semibold text-stone-900 mb-3">Active Agreements</h3>
              <div className="space-y-3">
                {CHAIR_LEASES.map((lease, idx) => (
                  <div
                    key={lease.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/60 bg-white hover:border-stone-300 transition-all"
                    style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-stone-900">{lease.member}</p>
                        <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{lease.booth}</span>
                      </div>
                      <p className="text-[12px] text-stone-400 mt-0.5">{lease.type} · Due {lease.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[16px] font-bold text-stone-900 tabular-nums">
                        ${lease.amount}{lease.type === 'Commission Split' ? '%' : ''}
                      </p>
                      <p className="text-[11px] text-emerald-500 font-medium">Active</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== EARNINGS ===== */}
        {activeTab === 'earnings' && (
          <div className="space-y-8">
            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Revenue (6mo)', value: `$${totalRevenue.toLocaleString()}` },
                { label: 'This Month', value: `$${MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1].revenue.toLocaleString()}` },
                { label: 'Avg Monthly', value: `$${Math.round(totalRevenue / MONTHLY_EARNINGS.length).toLocaleString()}` },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-stone-200/60 p-5 bg-white hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                  <p className="text-[12px] text-stone-400">{stat.label}</p>
                  <p className="text-[24px] font-bold text-stone-900 tabular-nums mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="rounded-2xl border border-stone-200/60 p-6 bg-white">
              <h3 className="text-[15px] font-semibold text-stone-900 mb-6">Monthly Revenue</h3>
              <div className="flex items-end gap-3 h-[200px]">
                {MONTHLY_EARNINGS.map((month, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-medium text-stone-500 tabular-nums">${(month.revenue / 1000).toFixed(1)}k</span>
                    <div
                      className="w-full rounded-t-lg bg-stone-900 transition-all duration-500 hover:bg-stone-700"
                      style={{ height: `${(month.revenue / maxEarning) * 160}px` }}
                    />
                    <span className="text-[11px] text-stone-400">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-member breakdown */}
            <div>
              <h3 className="text-[15px] font-semibold text-stone-900 mb-4">Team Breakdown</h3>
              <div className="space-y-3">
                {TEAM.sort((a, b) => b.earnings - a.earnings).map((member, idx) => {
                  const pct = Math.round((member.earnings / totalTeamEarnings) * 100);
                  return (
                    <div key={member.id} className="p-4 rounded-2xl border border-stone-200/60 bg-white" style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image src={member.image} alt="" width={32} height={32} className="object-cover w-full h-full" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-stone-900">{member.name}</p>
                            <p className="text-[11px] text-stone-400">{member.hours}h this month</p>
                          </div>
                        </div>
                        <p className="text-[15px] font-bold text-stone-900 tabular-nums">${member.earnings.toLocaleString()}</p>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-900 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== PAYROLL ===== */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight">Payroll</h2>
              <button className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-all" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                Run Payroll
              </button>
            </div>

            {/* Next payroll */}
            <div className="rounded-2xl border border-stone-200/60 p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-stone-400">Next Payroll</p>
                  <p className="text-[24px] font-bold text-stone-900 tabular-nums mt-1">$7,240</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">Mar 16 - Mar 31 · {TEAM.length} members</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-600">Processing</span>
                  <p className="text-[12px] text-stone-400">Due Apr 1</p>
                </div>
              </div>

              {/* Per-member split */}
              <div className="mt-5 pt-5 border-t border-stone-100 space-y-3">
                {TEAM.map((member) => {
                  const pay = Math.round(member.earnings * 0.85);
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden">
                          <Image src={member.image} alt="" width={28} height={28} className="object-cover w-full h-full" />
                        </div>
                        <span className="text-[13px] text-stone-700">{member.name}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-stone-900 tabular-nums">${pay.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History */}
            <div>
              <h3 className="text-[15px] font-semibold text-stone-900 mb-4">History</h3>
              <div className="space-y-3">
                {PAYROLL_HISTORY.map((payroll, idx) => (
                  <div
                    key={payroll.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/60 bg-white hover:border-stone-300 transition-all"
                    style={{ opacity: 0, animation: 'fadeInUp 520ms ease-out both', animationDelay: `${60 + idx * 40}ms` }}
                  >
                    <div>
                      <p className="text-[14px] font-medium text-stone-900">{payroll.period}</p>
                      <p className="text-[12px] text-stone-400">Paid {payroll.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[15px] font-bold text-stone-900 tabular-nums">${payroll.total.toLocaleString()}</p>
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default TeamClient;
