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
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'revenue' | 'engagement' | 'reviews'>('overview');

  const { overview, recentActivity, monthlyData, topServices, listings, reviews } = analyticsData;

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
    <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {growth >= 0 ? <TrendingUp size={13} strokeWidth={2.5} /> : <TrendingDown size={13} strokeWidth={2.5} />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-4xl font-semibold tracking-tight text-gray-900">{value}</div>
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
      {/* Clean Header - matches Market page */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 md:px-24 pt-12 pb-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              Analytics
            </h1>
            <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">
              Welcome back, {currentUser.name}
            </p>
          </div>

          {/* Tab Toggle - matches Market CategoryNav style */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
                  ${activeTab === 'overview'
                    ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                    : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
                  }
                `}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
                  ${activeTab === 'listings'
                    ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                    : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
                  }
                `}
              >
                Listings
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
                  ${activeTab === 'revenue'
                    ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                    : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
                  }
                `}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveTab('engagement')}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
                  ${activeTab === 'engagement'
                    ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                    : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
                  }
                `}
              >
                Engagement
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
                  ${activeTab === 'reviews'
                    ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                    : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
                  }
                `}
              >
                Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-24 py-12">

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
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Revenue & Reservations</h3>
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
                      stroke="#60A5FA"
                      strokeWidth={2}
                      dot={false}
                      name="Reservations"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#c4b5fd"
                      strokeWidth={2}
                      dot={false}
                      name="Revenue ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Services */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Top Services</h3>
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
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Recent Reservations</h3>
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
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Recent Posts</h3>
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
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-300">
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
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
              <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Monthly Revenue</h3>
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
                    stroke="#60A5FA"
                    fill="#60A5FA"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Service */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
              <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Revenue by Service</h3>
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
                  <Bar dataKey="revenue" fill="#60A5FA" radius={[6, 6, 0, 0]} />
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
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
              <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Monthly Posts</h3>
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
                  <Bar dataKey="posts" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Rating Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Average Rating</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-gray-900">
                    {reviews.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xl text-gray-400">/5</span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= Math.round(reviews.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
              </div>
              <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Total Reviews</p>
                <div className="text-4xl font-semibold tracking-tight text-gray-900">
                  {reviews.totalReviews}
                </div>
                <p className="text-sm text-gray-500 mt-3">Reviews received</p>
              </div>
              <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">5-Star Reviews</p>
                <div className="text-4xl font-semibold tracking-tight text-gray-900">
                  {reviews.ratingDistribution.find(r => r.rating === 5)?.count || 0}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  {reviews.totalReviews > 0
                    ? `${Math.round(((reviews.ratingDistribution.find(r => r.rating === 5)?.count || 0) / reviews.totalReviews) * 100)}% of total`
                    : 'No reviews yet'}
                </p>
              </div>
            </div>

            {/* Rating Distribution & Goal Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Rating Distribution */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Rating Distribution</h3>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.ratingDistribution.find(r => r.rating === rating)?.count || 0;
                    const percentage = reviews.totalReviews > 0 ? (count / reviews.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium text-gray-700">{rating}</span>
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#60A5FA] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Goal Calculator */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                <h3 className="text-xs font-semibold mb-8 uppercase tracking-wider text-gray-400">Rating Goal Calculator</h3>

                {reviews.totalReviews === 0 ? (
                  <div className="text-center py-8">
                    <Star size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400 mt-2">Start collecting reviews to see your goal progress</p>
                  </div>
                ) : reviews.averageRating >= 5 ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={32} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xl font-semibold text-gray-900">Perfect 5-Star Rating!</p>
                    <p className="text-sm text-gray-500 mt-2">You've achieved the highest possible rating</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Current Status */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Current Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{reviews.averageRating.toFixed(1)}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= Math.round(reviews.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">from {reviews.totalReviews} reviews</span>
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
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-gray-900">{target.toFixed(1)}</span>
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-sm text-gray-500">rating goal</span>
                              </div>
                              {isAchieved ? (
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Achieved
                                </span>
                              ) : (
                                <span className="text-sm font-medium text-[#60A5FA]">
                                  {needed} more 5-star {needed === 1 ? 'review' : 'reviews'} needed
                                </span>
                              )}
                            </div>
                            {!isAchieved && (
                              <div className="mt-2">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#60A5FA] rounded-full transition-all duration-500"
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
  );
};

export default AnalyticsClient;