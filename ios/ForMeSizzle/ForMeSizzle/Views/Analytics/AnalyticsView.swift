import SwiftUI
import Charts

struct AnalyticsView: View {
    @StateObject private var viewModel = AnalyticsViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab = 0

    private let tabs = ["Overview", "Listings", "Revenue", "Reviews"]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Analytics")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(ForMe.textPrimary)
                    Text("Hi \(authViewModel.currentUser?.name ?? "there"), here's how things are going")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone400)
                }
                .padding(.horizontal)
                .padding(.top, ForMe.space3)

                // Tabs
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(tabs.enumerated()), id: \.offset) { index, title in
                            Button {
                                withAnimation { selectedTab = index }
                            } label: {
                                Text(title)
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(selectedTab == index ? .white : ForMe.textSecondary)
                                    .padding(.horizontal, ForMe.space4)
                                    .frame(height: 36)
                                    .background(selectedTab == index ? ForMe.stone900 : .clear)
                                    .clipShape(Capsule())
                                    .overlay(
                                        Capsule().stroke(selectedTab == index ? .clear : ForMe.stone200, lineWidth: 1)
                                    )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                }

                // Tab content
                Group {
                    switch selectedTab {
                    case 0: overviewTab
                    case 1: listingsTab
                    case 2: revenueTab
                    case 3: reviewsTab
                    default: EmptyView()
                    }
                }
                .padding(.horizontal)
            }
            .padding(.bottom, 100)
        }
        .background(ForMe.background)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.load()
        }
    }
}

// MARK: - Overview Tab

private extension AnalyticsView {
    var overviewTab: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
            StatCard(label: "Listings", value: "\(viewModel.listingsCount)", trend: nil)
            StatCard(label: "Reservations", value: "\(viewModel.reservationsCount)", trend: "+12%")
            StatCard(label: "Revenue", value: "$\(viewModel.totalRevenue)", trend: "+8%")
            StatCard(label: "Posts", value: "\(viewModel.postsCount)", trend: nil)
            StatCard(label: "Followers", value: "\(viewModel.followersCount)", trend: "+3")
            StatCard(label: "Following", value: "\(viewModel.followingCount)", trend: nil)
        }
    }
}

// MARK: - Listings Tab

private extension AnalyticsView {
    var listingsTab: some View {
        VStack(spacing: 0) {
            // Table header
            HStack {
                Text("Listing")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .textCase(.uppercase)
                Spacer()
                Text("Bookings")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .textCase(.uppercase)
                    .frame(width: 70, alignment: .trailing)
                Text("Revenue")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .textCase(.uppercase)
                    .frame(width: 70, alignment: .trailing)
            }
            .padding(.horizontal, ForMe.space4)
            .padding(.vertical, 12)
            .background(ForMe.stone50)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

            VStack(spacing: 0) {
                ForEach(viewModel.listings) { listing in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(listing.title)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(ForMe.textPrimary)
                            Text(listing.category)
                                .font(.system(size: 11))
                                .foregroundColor(ForMe.stone400)
                        }
                        Spacer()
                        Text("\(Int.random(in: 5...50))")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(width: 70, alignment: .trailing)
                        Text("$\(Int.random(in: 200...3000))")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(width: 70, alignment: .trailing)
                    }
                    .padding(.horizontal, ForMe.space4)
                    .padding(.vertical, 14)

                    if listing.id != viewModel.listings.last?.id {
                        Divider()
                    }
                }
            }
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
            .padding(.top, 8)
        }
    }
}

// MARK: - Revenue Tab

private extension AnalyticsView {
    var revenueTab: some View {
        VStack(alignment: .leading, spacing: ForMe.space4) {
            Text("Monthly Revenue")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            // Chart card
            VStack(spacing: ForMe.space3) {
                Chart(viewModel.revenueData) { item in
                    AreaMark(
                        x: .value("Month", item.month),
                        y: .value("Revenue", item.revenue)
                    )
                    .foregroundStyle(LinearGradient(
                        colors: [ForMe.accent.opacity(0.4), ForMe.accent.opacity(0.05)],
                        startPoint: .top, endPoint: .bottom
                    ))
                    .interpolationMethod(.catmullRom)

                    LineMark(
                        x: .value("Month", item.month),
                        y: .value("Revenue", item.revenue)
                    )
                    .foregroundStyle(ForMe.accent)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                    .interpolationMethod(.catmullRom)
                }
                .frame(height: 220)
                .chartYAxis {
                    AxisMarks(position: .leading) { _ in
                        AxisGridLine().foregroundStyle(ForMe.stone100)
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
                .chartXAxis {
                    AxisMarks { _ in
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
            }
            .padding(ForMe.space4)
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )

            // Summary
            HStack(spacing: 12) {
                StatCard(label: "Total", value: "$\(viewModel.totalRevenue)", trend: "+8%")
                StatCard(label: "This month", value: "$\(viewModel.thisMonthRevenue)", trend: "+12%")
            }
        }
    }
}

// MARK: - Reviews Tab

private extension AnalyticsView {
    var reviewsTab: some View {
        VStack(spacing: ForMe.space4) {
            HStack(spacing: 12) {
                StatCard(label: "Avg Rating", value: String(format: "%.1f", viewModel.avgRating), trend: nil)
                StatCard(label: "Total Reviews", value: "\(viewModel.totalReviews)", trend: nil)
            }

            // Rating distribution
            VStack(alignment: .leading, spacing: 12) {
                Text("Rating Distribution")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)

                ForEach((1...5).reversed(), id: \.self) { stars in
                    HStack(spacing: 12) {
                        HStack(spacing: 3) {
                            Text("\(stars)")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(ForMe.textPrimary)
                                .frame(width: 10)
                            GoldStar(size: 11)
                        }
                        .frame(width: 30, alignment: .leading)

                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Capsule().fill(ForMe.stone100)
                                    .frame(height: 8)
                                Capsule().fill(ForMe.accent)
                                    .frame(width: geo.size.width * CGFloat(viewModel.ratingDistribution[stars] ?? 0) / 100, height: 8)
                            }
                        }
                        .frame(height: 8)

                        Text("\(viewModel.ratingDistribution[stars] ?? 0)%")
                            .font(.system(size: 11))
                            .foregroundColor(ForMe.stone400)
                            .frame(width: 32, alignment: .trailing)
                    }
                }
            }
            .padding(ForMe.space4)
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
        }
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let label: String
    let value: String
    let trend: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(ForMe.stone400)
                .textCase(.uppercase)
                .tracking(0.6)

            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(value)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(ForMe.textPrimary)

                if let trend = trend {
                    Text(trend)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(ForMe.statusConfirmed)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(ForMe.statusConfirmed.opacity(0.1))
                        .clipShape(Capsule())
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }
}

#Preview {
    NavigationStack {
        AnalyticsView()
            .environmentObject(AuthViewModel())
    }
}
