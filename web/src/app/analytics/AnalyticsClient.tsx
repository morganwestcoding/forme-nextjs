'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeUser } from '@/app/types';
import { AnalyticsData } from '@/app/actions/getAnalyticsData';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import Skeleton, { PageHeaderSkeleton, ContainerSkeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/app/context/ThemeContext';
import DateRangePicker, { AnalyticsPreset, presetRange, matchingPreset } from './DateRangePicker';

// Shared palette for the charts. `accent` is the primary line/area/bar
// colour; `secondary` is the companion series (reservations+revenue
// overlay, stacked bars, etc.). `grid` / `axis` are the chart chrome.
const CHART_THEME = (isDark: boolean) => ({
  accent: isDark ? '#f5f5f4' : '#1c1917',
  secondary: isDark ? '#a8a29e' : '#78716c',
  grid: isDark ? '#292524' : '#e7e5e4',
  axis: isDark ? '#78716c' : '#9ca3af',
  surface: isDark ? '#1c1917' : '#ffffff',
  text: isDark ? '#f5f5f4' : '#1c1917',
  muted: isDark ? '#a8a29e' : '#78716c',
});
import { AnalyticsUpIcon as TrendingUp, AnalyticsDownIcon as TrendingDown, FavouriteIcon as Heart, MessageMultiple01Icon as MessageCircle, StarIcon as Star } from 'hugeicons-react';

interface AnalyticsClientProps {
  currentUser: SafeUser;
}

// Recharts' default tooltip doesn't honour dark mode and renders series
// values as bare numbers. We want brand chrome (stone borders, subtle
// shadow, rounded-xl) + currency formatting when the series is revenue.
function BrandTooltip({
  active,
  payload,
  label,
  isDarkMode,
  formatCurrency,
}: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-[12px] shadow-md ${
        isDarkMode
          ? 'border-stone-700 bg-stone-900 text-stone-100'
          : 'border-stone-200 bg-white text-stone-900'
      }`}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
        {label}
      </div>
      {payload.map((entry: any) => {
        const isRevenue = /revenue/i.test(entry.name ?? entry.dataKey);
        return (
          <div key={`${entry.name}-${entry.dataKey}`} className="flex items-center gap-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-stone-500 dark:text-stone-400">{entry.name ?? entry.dataKey}</span>
            <span className="ml-auto font-semibold tabular-nums">
              {isRevenue ? formatCurrency(entry.value as number) : entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const AnalyticsClient: React.FC<AnalyticsClientProps> = ({
  currentUser,
}) => {
  type TabType = 'overview' | 'listings' | 'revenue' | 'engagement' | 'reviews';
  const [activeTab, setActiveTab] = useState('overview' as TabType);
  const { isDarkMode } = useTheme();
  const chartTheme = CHART_THEME(isDarkMode);

  // Currently-loaded window. Default matches the iOS ViewModel —
  // Last 1 Year — so both clients land on the same initial chart.
  const initialRange = useMemo(() => presetRange('last1Year'), []);
  const [rangeStart, setRangeStart] = useState<Date>(initialRange.start);
  const [rangeEnd, setRangeEnd] = useState<Date>(initialRange.end);
  const [rangePreset, setRangePreset] = useState<AnalyticsPreset | null>('last1Year');

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = useCallback((start: Date, end: Date) => {
    const toYMD = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setAnalyticsLoading(true);
    fetch(`/api/analytics?start=${toYMD(start)}&end=${toYMD(end)}`)
      .then((r) => r.json())
      .then((data) => {
        setAnalyticsData(data);
        setAnalyticsLoading(false);
      })
      .catch(() => {
        setAnalyticsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchAnalytics(rangeStart, rangeEnd);
  }, [fetchAnalytics, rangeStart, rangeEnd]);

  const handleApplyRange = useCallback((start: Date, end: Date, preset: AnalyticsPreset | null) => {
    setRangeStart(start);
    setRangeEnd(end);
    setRangePreset(preset ?? matchingPreset(start, end));
  }, []);

  // First render = full skeleton. After the first response, re-fetches
  // from a new range show a subtle overlay instead of wiping the page.
  if (!analyticsData) {
    return (
      <ContainerSkeleton>
        <PageHeaderSkeleton />
        <div className="mt-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <div className="flex items-center gap-2 mb-8 overflow-x-hidden pb-1">
            {['w-24', 'w-20', 'w-24', 'w-28', 'w-24'].map((w, i) => (
              <Skeleton key={i} rounded="full" className={`h-9 ${w} shrink-0`} />
            ))}
          </div>
        </div>
        <div className="pb-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 dark:border-stone-800">
                <Skeleton className="h-3 w-28 mb-3" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 dark:border-stone-800">
              <Skeleton className="h-3 w-44 mb-8" />
              <Skeleton rounded="lg" className="h-[300px] w-full" />
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 dark:border-stone-800">
              <Skeleton className="h-3 w-32 mb-8" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                    <div>
                      <Skeleton className="h-4 w-32 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-10 mb-1.5 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 dark:border-stone-800">
              <Skeleton className="h-3 w-48 mb-8" />
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-36 mb-1.5" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-14 mb-1.5 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 dark:border-stone-800">
              <Skeleton className="h-3 w-32 mb-8" />
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                    <Skeleton className="h-3 w-full mb-1.5" />
                    <Skeleton className="h-3 w-3/4 mb-3" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ContainerSkeleton>
    );
  }

  const { overview, recentActivity, monthlyData, topServices, listings, reviews, engagement, period } = analyticsData;

  // Calculate how many 5-star reviews needed to reach a target rating
  const calculateReviewsNeeded = (targetRating: number) => {
    const { totalReviews, averageRating, ratingDistribution } = reviews;
    if (totalReviews === 0) return 0;
    if (averageRating >= targetRating) return 0;

    const currentSum = ratingDistribution.reduce((sum, r) => sum + (r.rating * r.count), 0);
    // Formula: (currentSum + 5*n) / (totalReviews + n) >= targetRating
    // Solving for n: n >= (targetRating * totalReviews - currentSum) / (5 - targetRating)
    const needed = Math.ceil((targetRating * totalReviews - currentSum) / (5 - targetRating));
    return Math.max(0, needed);
  };

  // Growth % compares the last bucket vs the one before it. That's only
  // meaningful at monthly granularity — the same math plotted over daily
  // or weekly buckets would be a day-over-day delta mislabelled as
  // month-over-month. Hide the indicator unless we're on months.
  const showsGrowth = period?.granularity === 'month' && monthlyData.length >= 2;
  const currentBucket = monthlyData[monthlyData.length - 1];
  const previousBucket = monthlyData[monthlyData.length - 2];

  const reservationGrowth = showsGrowth && currentBucket && previousBucket
    ? ((currentBucket.reservations - previousBucket.reservations) / Math.max(previousBucket.reservations, 1)) * 100
    : 0;

  const revenueGrowth = showsGrowth && currentBucket && previousBucket
    ? ((currentBucket.revenue - previousBucket.revenue) / Math.max(previousBucket.revenue, 1)) * 100
    : 0;

  // Pick explicit x-axis tick values so the chart always shows the real
  // first + last buckets (the user's selected endpoints) no matter how
  // long the range is. Recharts auto-ticks otherwise drop the endpoints
  // at narrow widths, which hid the actual selection from the user.
  const axisTicks: string[] = (() => {
    const labels = monthlyData.map((p) => p.month);
    const n = labels.length;
    if (n <= 5) return labels;
    const indices = new Set<number>([0, Math.round(n / 3), Math.round((2 * n) / 3), n - 1]);
    return Array.from(indices).sort((a, b) => a - b).map((i) => labels[i]);
  })();

  // Compact month buckets like "Apr 2026" → "Apr '26" so labels on a
  // year-spanning chart disambiguate across the year boundary without
  // eating more horizontal space. Weekly/daily labels ("Apr 15") are
  // already compact.
  const formatBucketLabel = (raw: string) => {
    if (period?.granularity !== 'month') return raw;
    const [m, y] = raw.split(' ');
    if (!m || !y) return raw;
    return `${m} '${y.slice(2)}`;
  };

  function StatCard({ title, value, growth }: {
    title: string;
    value: string | number;
    growth?: number;
  }) {
    return (
      <div className="group relative rounded-2xl border border-stone-200/60 p-6 transition-all duration-300 bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] text-stone-400 dark:text-stone-500">{title}</p>
          {growth !== undefined && (
            <div className={`flex items-center gap-1 text-[11px] font-medium ${
              growth >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {growth >= 0 ? <TrendingUp size={12} strokeWidth={2} /> : <TrendingDown size={12} strokeWidth={2} />}
              {Math.abs(growth).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">{value}</div>
      </div>
    );
  }

  // Card wrapper used for every chart. Title + optional subtitle
  // (the server's period.label — "10 Feb 2026 – 22 Apr 2026" style), so
  // the user can see exactly which range the chart is plotting without
  // having to glance back at the capsule picker up top.
  function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-[11px] font-medium text-stone-500 dark:text-stone-400 tabular-nums">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    );
  }

  function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Analytics" />
      <div>
        <div className="mt-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Analytics</h1>
            <p className="text-[14px] text-stone-400 dark:text-stone-500 mt-1">Welcome back, {currentUser.name}</p>
          </div>

          {/* Tab bar + range picker. Tabs scroll if they run out of
              horizontal space; the range picker stays pinned to the right
              so it's always reachable. */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1 min-w-0">
              {['overview', 'listings', 'revenue', 'engagement', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gradient-to-br from-stone-800 to-black text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] dark:from-stone-100 dark:to-white dark:text-stone-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.8)]'
                      : 'bg-stone-50  text-stone-500  dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {analyticsLoading && (
                <span className="h-3 w-3 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin dark:border-stone-700 dark:border-t-stone-300" aria-label="Updating" />
              )}
              <DateRangePicker
                start={rangeStart}
                end={rangeEnd}
                preset={rangePreset}
                onApply={handleApplyRange}
              />
            </div>
          </div>
        </div>

        <div className="pb-12">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard
                title="Total Listings"
                value={overview.totalListings}
              />
              <StatCard
                title="Total Reservations"
                value={overview.totalReservations}
                growth={showsGrowth ? reservationGrowth : undefined}
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(overview.totalRevenue)}
                growth={showsGrowth ? revenueGrowth : undefined}
              />
              <StatCard
                title="Total Posts"
                value={overview.totalPosts}
              />
              <StatCard
                title="Followers"
                value={overview.totalFollowers}
              />
              <StatCard
                title="Following"
                value={overview.totalFollowing}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Revenue & Reservations Chart */}
              <ChartCard title="Reservations & Revenue" subtitle={period?.label}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke={chartTheme.axis}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      ticks={axisTicks}
                      tickFormatter={formatBucketLabel}
                      interval={0}
                    />
                    <YAxis stroke={chartTheme.axis} fontSize={11} tickLine={false} axisLine={false} width={40} />
                    <Tooltip content={<BrandTooltip isDarkMode={isDarkMode} formatCurrency={formatCurrency} />} />
                    <Line
                      type="monotone"
                      dataKey="reservations"
                      stroke={chartTheme.accent}
                      strokeWidth={2}
                      dot={monthlyData.length === 1 ? { r: 4, fill: chartTheme.accent } : false}
                      activeDot={{ r: 4 }}
                      name="Reservations"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#c4b5fd"
                      strokeWidth={2}
                      dot={monthlyData.length === 1 ? { r: 4, fill: '#c4b5fd' } : false}
                      activeDot={{ r: 4 }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <ChartLegend
                  items={[
                    { color: chartTheme.accent, label: 'Reservations' },
                    { color: '#c4b5fd', label: 'Revenue' },
                  ]}
                />
              </ChartCard>

              {/* Top Services */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-stone-400 dark:text-stone-500">Top Services</h3>
                <div className="space-y-3">
                  {topServices.slice(0, 5).map((service) => (
                    <div key={service.serviceName} className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{service.serviceName}</p>
                        <p className="text-xs text-stone-500  dark:text-stone-500 mt-0.5">{service.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{service.bookings}</p>
                        <p className="text-xs text-stone-500  dark:text-stone-500 mt-0.5">{formatCurrency(service.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Reservations */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-stone-400 dark:text-stone-500">Recent Reservations</h3>
                <div className="space-y-1">
                  {recentActivity.reservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.id} className="flex items-center gap-4 py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{reservation.serviceName}</p>
                        <p className="text-xs text-stone-500  dark:text-stone-500 mt-0.5">
                          {reservation.user.name} • {formatDate(reservation.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(reservation.totalPrice)}</p>
                        <span className={`text-xs font-medium mt-0.5 inline-block ${
                          reservation.status === 'accepted' ? 'text-green-600' :
                          reservation.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Posts */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-stone-400 dark:text-stone-500">Recent Posts</h3>
                <div className="space-y-1">
                  {recentActivity.posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                      <p className="text-sm text-stone-700 dark:text-stone-200 mb-2 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-stone-500  dark:text-stone-500">
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {post.comments}
                        </span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 overflow-hidden hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <th className="px-8 py-4 text-left text-xs font-semibold text-stone-500  dark:text-stone-500 tracking-tight">Listing</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-stone-500  dark:text-stone-500 tracking-tight">Category</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-stone-500  dark:text-stone-500 tracking-tight">Reservations</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-stone-500  dark:text-stone-500 tracking-tight">Revenue</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-stone-500  dark:text-stone-500 tracking-tight">Followers</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-stone-500  dark:text-stone-500 tracking-tight">Reviews</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-stone-500  dark:text-stone-500 tracking-tight">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-white/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-medium text-sm text-stone-900 dark:text-stone-100">{listing.title}</div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                          {listing.category}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-stone-900 dark:text-stone-100">{listing.reservations}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(listing.revenue)}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-stone-900 dark:text-stone-100">{listing.followers}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          {listing.reviews}
                          {listing.reviews > 0 && (
                            <span className="text-xs text-stone-500 dark:text-stone-500 inline-flex items-center gap-0.5">
                              · {listing.averageRating.toFixed(1)}
                              <Star size={11} className="text-yellow-400 fill-yellow-400" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-stone-500  dark:text-stone-500">{formatDate(listing.createdAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-5">
            {/* Revenue Chart */}
            <ChartCard title="Revenue over time" subtitle={period?.label}>
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={monthlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartTheme.accent} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartTheme.accent} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke={chartTheme.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    ticks={axisTicks}
                    tickFormatter={formatBucketLabel}
                    interval={0}
                  />
                  <YAxis
                    stroke={chartTheme.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
                  />
                  <Tooltip content={<BrandTooltip isDarkMode={isDarkMode} formatCurrency={formatCurrency} />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={chartTheme.accent}
                    fill="url(#analyticsRevenueFill)"
                    strokeWidth={2}
                    dot={monthlyData.length === 1 ? { r: 4, fill: chartTheme.accent } : false}
                    activeDot={{ r: 4 }}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Revenue by Service */}
            <ChartCard title="Revenue by service">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topServices.slice(0, 8)} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis
                    dataKey="serviceName"
                    stroke={chartTheme.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 10)}…` : v)}
                  />
                  <YAxis
                    stroke={chartTheme.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
                  />
                  <Tooltip content={<BrandTooltip isDarkMode={isDarkMode} formatCurrency={formatCurrency} />} />
                  <Bar dataKey="revenue" fill={chartTheme.accent} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="space-y-12">
            {/* Engagement Stats — first row: account-level reach */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard
                title="Total Posts"
                value={overview.totalPosts}
              />
              <StatCard
                title="Followers"
                value={overview.totalFollowers}
              />
              <StatCard
                title="Following"
                value={overview.totalFollowing}
              />
            </div>

            {/* Second row: post-level engagement totals (views, likes,
                comments) plus the cumulative follower count across the
                user's listings — the actual engagement each listing/post
                has earned. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Post Views"
                value={engagement.totalPostViews.toLocaleString()}
              />
              <StatCard
                title="Post Likes"
                value={engagement.totalPostLikes.toLocaleString()}
              />
              <StatCard
                title="Post Comments"
                value={engagement.totalPostComments.toLocaleString()}
              />
              <StatCard
                title="Listing Followers"
                value={engagement.totalListingFollowers.toLocaleString()}
              />
            </div>

            {/* Posts Chart */}
            <ChartCard title="Posts over time" subtitle={period?.label}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke={chartTheme.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    ticks={axisTicks}
                    tickFormatter={formatBucketLabel}
                    interval={0}
                  />
                  <YAxis stroke={chartTheme.axis} fontSize={11} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<BrandTooltip isDarkMode={isDarkMode} formatCurrency={formatCurrency} />} />
                  <Bar dataKey="posts" fill={chartTheme.accent} radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Rating Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white dark:bg-stone-900 border-stone-200  hover:border-stone-300 dark:border-stone-700 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">Average Rating</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                    {reviews.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xl text-stone-400 dark:text-stone-500">/5</span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= Math.round(reviews.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-stone-200'}
                    />
                  ))}
                </div>
              </div>
              <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white dark:bg-stone-900 border-stone-200  hover:border-stone-300 dark:border-stone-700 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">Total Reviews</p>
                <div className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  {reviews.totalReviews}
                </div>
                <p className="text-sm text-stone-500  dark:text-stone-500 mt-3">Reviews received</p>
              </div>
              <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white dark:bg-stone-900 border-stone-200  hover:border-stone-300 dark:border-stone-700 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">5-Star Reviews</p>
                <div className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  {reviews.ratingDistribution.find(r => r.rating === 5)?.count || 0}
                </div>
                <p className="text-sm text-stone-500  dark:text-stone-500 mt-3">
                  {reviews.totalReviews > 0
                    ? `${Math.round(((reviews.ratingDistribution.find(r => r.rating === 5)?.count || 0) / reviews.totalReviews) * 100)}% of total`
                    : 'No reviews yet'}
                </p>
              </div>
            </div>

            {/* Rating Distribution & Goal Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Rating Distribution */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-stone-400 dark:text-stone-500">Rating Distribution</h3>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.ratingDistribution.find(r => r.rating === rating)?.count || 0;
                    const percentage = reviews.totalReviews > 0 ? (count / reviews.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{rating}</span>
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="flex-1 h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-900 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-stone-500  dark:text-stone-500 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Goal Calculator */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/60 hover:border-stone-300 dark:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-stone-400 dark:text-stone-500">Rating Goal Calculator</h3>

                {reviews.totalReviews === 0 ? (
                  <div className="text-center py-8">
                    <Star size={48} className="text-stone-200 mx-auto mb-4" />
                    <p className="text-stone-500  dark:text-stone-500">No reviews yet</p>
                    <p className="text-sm text-stone-400 dark:text-stone-500 mt-2">Start collecting reviews to see your goal progress</p>
                  </div>
                ) : reviews.averageRating >= 5 ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={32} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xl font-semibold text-stone-900 dark:text-stone-100">Perfect 5-Star Rating!</p>
                    <p className="text-sm text-stone-500  dark:text-stone-500 mt-2">You&apos;ve achieved the highest possible rating</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Current Status */}
                    <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl">
                      <p className="text-sm text-stone-600 dark:text-stone-300 mb-1">Current Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">{reviews.averageRating.toFixed(1)}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= Math.round(reviews.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-stone-200'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-stone-500  dark:text-stone-500">from {reviews.totalReviews} reviews</span>
                      </div>
                    </div>

                    {/* Goal Targets */}
                    <div className="space-y-3">
                      {[4.5, 4.8, 5.0].map((target) => {
                        const needed = calculateReviewsNeeded(target);
                        const isAchieved = reviews.averageRating >= target;
                        return (
                          <div
                            key={target}
                            className={`p-4 rounded-xl border transition-all ${
                              isAchieved
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">{target.toFixed(1)}</span>
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-sm text-stone-500  dark:text-stone-500">rating goal</span>
                              </div>
                              {isAchieved ? (
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Achieved
                                </span>
                              ) : (
                                <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                  {needed} more 5-star {needed === 1 ? 'review' : 'reviews'} needed
                                </span>
                              )}
                            </div>
                            {!isAchieved && (
                              <div className="mt-2">
                                <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-stone-900 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((reviews.averageRating / target) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </Container>
  );
};

export default AnalyticsClient;