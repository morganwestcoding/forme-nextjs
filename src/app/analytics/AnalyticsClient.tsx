'use client';
import React, { useState } from 'react';
import { SafeUser } from '@/app/types';
import { AnalyticsData } from '@/app/actions/getAnalyticsData';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, FileText, Eye, Heart, MessageCircle, Star } from 'lucide-react';

interface AnalyticsClientProps {
  currentUser: SafeUser;
  analyticsData: AnalyticsData;
}

const AnalyticsClient: React.FC<AnalyticsClientProps> = ({
  currentUser,
  analyticsData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'revenue' | 'engagement'>('overview');
  
  const { overview, recentActivity, monthlyData, topServices, listings } = analyticsData;

  // Calculate growth percentages (simplified)
  const currentMonthData = monthlyData[monthlyData.length - 1];
  const previousMonthData = monthlyData[monthlyData.length - 2];
  
  const reservationGrowth = previousMonthData 
    ? ((currentMonthData.reservations - previousMonthData.reservations) / Math.max(previousMonthData.reservations, 1)) * 100
    : 0;
    
  const revenueGrowth = previousMonthData 
    ? ((currentMonthData.revenue - previousMonthData.revenue) / Math.max(previousMonthData.revenue, 1)) * 100
    : 0;

  const StatCard = ({ title, value, growth }: {
    title: string;
    value: string | number;
    growth?: number;
  }) => (
    <div className="group bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:bg-gray-50 hover:shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {growth >= 0 ? <TrendingUp size={13} strokeWidth={2.5} /> : <TrendingDown size={13} strokeWidth={2.5} />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-4xl font-semibold tracking-tight text-gray-900 group-hover:text-black transition-colors">{value}</div>
    </div>
  );

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
    <div className="min-h-screen bg-white">
      {/* Clean, Spacious Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          {/* Top Bar */}
          <div className="flex items-center justify-between pt-12 pb-8">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Analytics</h1>
              <p className="text-base text-gray-500 mt-2">Welcome back, {currentUser.name}</p>
            </div>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Minimal Tab Navigation */}
          <div className="flex items-center gap-10">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'listings', label: 'Listings' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'engagement', label: 'Engagement' },
            ].map(({ key, label }) => {
              const isSelected = activeTab === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`
                    pb-4 text-[15px] font-semibold tracking-tight
                    border-b-[3px] transition-all duration-300 ease-out
                    ${isSelected
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
                    }
                  `}
                  type="button"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-12">

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
                growth={reservationGrowth}
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(overview.totalRevenue)}
                growth={revenueGrowth}
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
              <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:shadow-sm transition-shadow duration-300">
                <h3 className="text-sm font-semibold mb-8 tracking-tight uppercase text-gray-500">Revenue & Reservations</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #f3f4f6',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reservations"
                      stroke="#000000"
                      strokeWidth={2}
                      dot={false}
                      name="Reservations"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      dot={false}
                      name="Revenue ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Services */}
              <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:shadow-sm transition-shadow duration-300">
                <h3 className="text-sm font-semibold mb-8 tracking-tight uppercase text-gray-500">Top Services</h3>
                <div className="space-y-3">
                  {topServices.slice(0, 5).map((service) => (
                    <div key={service.serviceName} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.serviceName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{service.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{service.bookings}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(service.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Reservations */}
              <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:shadow-sm transition-shadow duration-300">
                <h3 className="text-sm font-semibold mb-8 tracking-tight uppercase text-gray-500">Recent Reservations</h3>
                <div className="space-y-1">
                  {recentActivity.reservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{reservation.serviceName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {reservation.user.name} • {formatDate(reservation.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(reservation.totalPrice)}</p>
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
              <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:shadow-sm transition-shadow duration-300">
                <h3 className="text-sm font-semibold mb-8 tracking-tight uppercase text-gray-500">Recent Posts</h3>
                <div className="space-y-1">
                  {recentActivity.posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="py-3 border-b border-gray-100 last:border-0">
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
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
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100/50 overflow-hidden hover:shadow-sm transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 tracking-tight">Listing</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 tracking-tight">Category</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 tracking-tight">Reservations</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 tracking-tight">Revenue</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 tracking-tight">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-100 last:border-0 hover:bg-white/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-medium text-sm text-gray-900">{listing.title}</div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-medium text-gray-600">
                          {listing.category}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-gray-900">{listing.reservations}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(listing.revenue)}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-gray-500">{formatDate(listing.createdAt)}</div>
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
            <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:shadow-sm transition-shadow duration-300">
              <h3 className="text-sm font-semibold mb-8 tracking-tight uppercase text-gray-500">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f3f4f6',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#000000"
                    fill="#000000"
                    fillOpacity={0.08}
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Service */}
            <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:shadow-sm transition-shadow duration-300">
              <h3 className="text-sm font-semibold mb-8 tracking-tight uppercase text-gray-500">Revenue by Service</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="serviceName" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f3f4f6',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#000000" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="space-y-12">
            {/* Engagement Stats */}
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

            {/* Posts Chart */}
            <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50 hover:shadow-sm transition-shadow duration-300">
              <h3 className="text-sm font-semibold mb-8 tracking-tight uppercase text-gray-500">Monthly Posts</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f3f4f6',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Bar dataKey="posts" fill="#000000" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsClient;