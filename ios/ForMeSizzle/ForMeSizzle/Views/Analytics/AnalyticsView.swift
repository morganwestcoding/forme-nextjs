import SwiftUI
import Charts

struct AnalyticsView: View {
    @StateObject private var viewModel = AnalyticsViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab: Tab = .overview

    enum Tab: String, CaseIterable, Identifiable {
        case overview, listings, revenue, engagement, reviews
        var id: String { rawValue }
        var title: String { rawValue.prefix(1).uppercased() + rawValue.dropFirst() }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                header
                tabBar

                if viewModel.isLoading && viewModel.data == nil {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.top, 60)
                } else if let data = viewModel.data {
                    Group {
                        switch selectedTab {
                        case .overview:   overviewTab(data)
                        case .listings:   listingsTab(data)
                        case .revenue:    revenueTab(data)
                        case .engagement: engagementTab(data)
                        case .reviews:    reviewsTab(data)
                        }
                    }
                    .padding(.horizontal)
                } else if viewModel.error != nil {
                    emptyState
                        .padding(.horizontal)
                }
            }
            .padding(.bottom, 100)
        }
        .background(ForMe.background)
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await viewModel.load() }
        .task { await viewModel.load() }
    }

    // MARK: - Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Analytics")
                .font(.system(size: 24, weight: .semibold))
                .tracking(-0.5)
                .foregroundColor(ForMe.textPrimary)
            Text("Welcome back, \(authViewModel.currentUser?.name ?? "there")")
                .font(.system(size: 14))
                .foregroundColor(ForMe.stone400)
        }
        .padding(.horizontal)
        .padding(.top, ForMe.space3)
    }

    private var tabBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Tab.allCases) { tab in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) { selectedTab = tab }
                    } label: {
                        Text(tab.title)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(selectedTab == tab ? .white : ForMe.stone500)
                            .padding(.horizontal, 16)
                            .frame(height: 36)
                            .background(
                                Capsule()
                                    .fill(selectedTab == tab
                                          ? AnyShapeStyle(LinearGradient(
                                              colors: [Color(hex: "292524"), Color.black],
                                              startPoint: .top, endPoint: .bottom))
                                          : AnyShapeStyle(ForMe.stone50))
                            )
                            .overlay(
                                Capsule()
                                    .stroke(selectedTab == tab ? .clear : ForMe.stone200, lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "chart.bar")
                .font(.system(size: 28))
                .foregroundColor(ForMe.stone300)
            Text("Couldn't load analytics")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(ForMe.stone500)
            if let err = viewModel.error {
                Text(err)
                    .font(.system(size: 12))
                    .foregroundColor(ForMe.stone400)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

// MARK: - Overview tab

private extension AnalyticsView {
    func overviewTab(_ data: AnalyticsData) -> some View {
        VStack(spacing: 20) {
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                StatCard(title: "Total listings", value: "\(data.overview.totalListings)")
                StatCard(title: "Total reservations",
                         value: "\(data.overview.totalReservations)",
                         growth: viewModel.reservationGrowth)
                StatCard(title: "Total revenue",
                         value: currency(data.overview.totalRevenue),
                         growth: viewModel.revenueGrowth)
                StatCard(title: "Total posts", value: "\(data.overview.totalPosts)")
                StatCard(title: "Followers", value: "\(data.overview.totalFollowers)")
                StatCard(title: "Following", value: "\(data.overview.totalFollowing)")
            }

            AnalyticsCard(title: "Revenue & reservations") {
                Chart(data.monthlyData) { point in
                    LineMark(x: .value("Month", point.month),
                             y: .value("Reservations", point.reservations),
                             series: .value("Series", "Reservations"))
                        .foregroundStyle(ForMe.accent)
                        .interpolationMethod(.catmullRom)
                        .lineStyle(StrokeStyle(lineWidth: 2))

                    LineMark(x: .value("Month", point.month),
                             y: .value("Revenue", point.revenue),
                             series: .value("Series", "Revenue"))
                        .foregroundStyle(Color(hex: "C4B5FD"))
                        .interpolationMethod(.catmullRom)
                        .lineStyle(StrokeStyle(lineWidth: 2))
                }
                .frame(height: 220)
                .chartYAxis {
                    AxisMarks { _ in
                        AxisGridLine().foregroundStyle(ForMe.stone100)
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
                .chartXAxis {
                    // 12 months of timeseries — thin to ~4 labels so the
                    // month/year strings don't overlap on a phone-width chart.
                    AxisMarks(values: .automatic(desiredCount: 4)) { _ in
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
            }

            AnalyticsCard(title: "Top services") {
                if data.topServices.isEmpty {
                    placeholderRow("No services yet")
                } else {
                    VStack(spacing: 0) {
                        ForEach(Array(data.topServices.prefix(5).enumerated()), id: \.element.id) { idx, service in
                            topServiceRow(service, isLast: idx == min(data.topServices.count, 5) - 1)
                        }
                    }
                }
            }

            AnalyticsCard(title: "Recent reservations") {
                if data.recentActivity.reservations.isEmpty {
                    placeholderRow("No reservations yet")
                } else {
                    VStack(spacing: 0) {
                        ForEach(Array(data.recentActivity.reservations.prefix(5).enumerated()), id: \.element.id) { idx, res in
                            recentReservationRow(res, isLast: idx == min(data.recentActivity.reservations.count, 5) - 1)
                        }
                    }
                }
            }

            AnalyticsCard(title: "Recent posts") {
                if data.recentActivity.posts.isEmpty {
                    placeholderRow("No posts yet")
                } else {
                    VStack(spacing: 0) {
                        ForEach(Array(data.recentActivity.posts.prefix(5).enumerated()), id: \.element.id) { idx, post in
                            recentPostRow(post, isLast: idx == min(data.recentActivity.posts.count, 5) - 1)
                        }
                    }
                }
            }
        }
    }

    func topServiceRow(_ service: AnalyticsData.ServiceStat, isLast: Bool) -> some View {
        VStack(spacing: 0) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(service.serviceName)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                    Text(service.category)
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.stone500)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(service.bookings)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                    Text(currency(service.revenue))
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.stone500)
                }
            }
            .padding(.vertical, 12)
            if !isLast { Divider().background(ForMe.stone100) }
        }
    }

    func recentReservationRow(_ res: AnalyticsData.RecentActivity.ReservationSummary, isLast: Bool) -> some View {
        VStack(spacing: 0) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(res.serviceName)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                    Text("\(res.user.name ?? "Customer") · \(shortDate(res.date))")
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.stone500)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text(currency(res.totalPrice))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                    Text(res.status.prefix(1).uppercased() + res.status.dropFirst())
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(statusColor(res.status))
                }
            }
            .padding(.vertical, 12)
            if !isLast { Divider().background(ForMe.stone100) }
        }
    }

    func recentPostRow(_ post: AnalyticsData.RecentActivity.PostSummary, isLast: Bool) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(post.content)
                .font(.system(size: 14))
                .foregroundColor(ForMe.stone700)
                .lineLimit(2)

            HStack(spacing: 16) {
                Label("\(post.likes.count)", systemImage: "heart")
                    .labelStyle(.titleAndIcon)
                Label("\(post.comments)", systemImage: "bubble.right")
                    .labelStyle(.titleAndIcon)
                Text(shortDate(post.createdAt))
            }
            .font(.system(size: 12))
            .foregroundColor(ForMe.stone500)

            if !isLast { Divider().background(ForMe.stone100).padding(.top, 4) }
        }
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Listings tab

private extension AnalyticsView {
    func listingsTab(_ data: AnalyticsData) -> some View {
        VStack(spacing: 0) {
            // Header row
            HStack {
                Text("Listing")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(ForMe.stone500)
                Spacer()
                Text("Reservations")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(ForMe.stone500)
                    .frame(width: 90, alignment: .trailing)
                Text("Revenue")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(ForMe.stone500)
                    .frame(width: 80, alignment: .trailing)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(ForMe.stone50.opacity(0.6))

            Divider().background(ForMe.stone200)

            if data.listings.isEmpty {
                placeholderRow("No listings yet")
                    .padding(.vertical, 24)
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(data.listings.enumerated()), id: \.element.id) { idx, listing in
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(listing.title)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(ForMe.textPrimary)
                                    .lineLimit(1)
                                HStack(spacing: 6) {
                                    Text(listing.category)
                                        .font(.system(size: 11, weight: .medium))
                                        .foregroundColor(ForMe.stone600)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 2)
                                        .background(Capsule().fill(ForMe.stone100))
                                    Text(shortDate(listing.createdAt))
                                        .font(.system(size: 11))
                                        .foregroundColor(ForMe.stone400)
                                }
                            }
                            Spacer()
                            Text("\(listing.reservations)")
                                .font(.system(size: 14))
                                .foregroundColor(ForMe.textPrimary)
                                .frame(width: 90, alignment: .trailing)
                            Text(currency(listing.revenue))
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(ForMe.textPrimary)
                                .frame(width: 80, alignment: .trailing)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)

                        if idx != data.listings.count - 1 {
                            Divider().background(ForMe.stone100)
                        }
                    }
                }
            }
        }
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.stone200.opacity(0.6), lineWidth: 1)
        )
    }
}

// MARK: - Revenue tab

private extension AnalyticsView {
    func revenueTab(_ data: AnalyticsData) -> some View {
        VStack(spacing: 20) {
            AnalyticsCard(title: "Monthly revenue") {
                Chart(data.monthlyData) { point in
                    AreaMark(x: .value("Month", point.month),
                             y: .value("Revenue", point.revenue))
                        .foregroundStyle(LinearGradient(
                            colors: [ForMe.accent.opacity(0.35), ForMe.accent.opacity(0.02)],
                            startPoint: .top, endPoint: .bottom
                        ))
                        .interpolationMethod(.catmullRom)

                    LineMark(x: .value("Month", point.month),
                             y: .value("Revenue", point.revenue))
                        .foregroundStyle(ForMe.accent)
                        .interpolationMethod(.catmullRom)
                        .lineStyle(StrokeStyle(lineWidth: 2))
                }
                .frame(height: 260)
                .chartYAxis {
                    AxisMarks { _ in
                        AxisGridLine().foregroundStyle(ForMe.stone100)
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
                .chartXAxis {
                    // 12 months of timeseries — thin to ~4 labels so the
                    // month/year strings don't overlap on a phone-width chart.
                    AxisMarks(values: .automatic(desiredCount: 4)) { _ in
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
            }

            AnalyticsCard(title: "Revenue by service") {
                if data.topServices.isEmpty {
                    placeholderRow("No service revenue yet")
                } else {
                    Chart(data.topServices.prefix(8), id: \.id) { service in
                        BarMark(x: .value("Service", service.serviceName),
                                y: .value("Revenue", service.revenue))
                            .foregroundStyle(ForMe.accent)
                            .cornerRadius(6)
                    }
                    .frame(height: 220)
                    .chartYAxis {
                        AxisMarks { _ in
                            AxisGridLine().foregroundStyle(ForMe.stone100)
                            AxisValueLabel()
                                .font(.system(size: 10))
                                .foregroundStyle(ForMe.stone400)
                        }
                    }
                    .chartXAxis {
                        AxisMarks { _ in
                            // Service names can be long — angle them so
                            // adjacent bars don't collide horizontally.
                            AxisValueLabel(orientation: .verticalReversed)
                                .font(.system(size: 10))
                                .foregroundStyle(ForMe.stone400)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Engagement tab

private extension AnalyticsView {
    func engagementTab(_ data: AnalyticsData) -> some View {
        VStack(spacing: 20) {
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                StatCard(title: "Total posts", value: "\(data.overview.totalPosts)")
                StatCard(title: "Followers", value: "\(data.overview.totalFollowers)")
                StatCard(title: "Following", value: "\(data.overview.totalFollowing)")
            }

            AnalyticsCard(title: "Monthly posts") {
                Chart(data.monthlyData) { point in
                    BarMark(x: .value("Month", point.month),
                            y: .value("Posts", point.posts))
                        .foregroundStyle(ForMe.accent)
                        .cornerRadius(6)
                }
                .frame(height: 240)
                .chartYAxis {
                    AxisMarks { _ in
                        AxisGridLine().foregroundStyle(ForMe.stone100)
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
                .chartXAxis {
                    // 12 months of timeseries — thin to ~4 labels so the
                    // month/year strings don't overlap on a phone-width chart.
                    AxisMarks(values: .automatic(desiredCount: 4)) { _ in
                        AxisValueLabel()
                            .font(.system(size: 10))
                            .foregroundStyle(ForMe.stone400)
                    }
                }
            }
        }
    }
}

// MARK: - Reviews tab

private extension AnalyticsView {
    func reviewsTab(_ data: AnalyticsData) -> some View {
        VStack(spacing: 20) {
            // Three big summary cards
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                bigReviewCard(title: "Average rating",
                              content: AnyView(averageRatingContent(data.reviews)))
                bigReviewCard(title: "Total reviews",
                              content: AnyView(totalReviewsContent(data.reviews)))
                bigReviewCard(title: "5-star reviews",
                              content: AnyView(fiveStarContent(data.reviews)))
            }

            AnalyticsCard(title: "Rating distribution") {
                if data.reviews.totalReviews == 0 {
                    placeholderRow("No reviews yet")
                } else {
                    VStack(spacing: 14) {
                        ForEach((1...5).reversed(), id: \.self) { star in
                            ratingBarRow(star: star, reviews: data.reviews)
                        }
                    }
                }
            }

            AnalyticsCard(title: "Rating goal calculator") {
                goalCalculatorContent(data.reviews)
            }
        }
    }

    func averageRatingContent(_ reviews: AnalyticsData.ReviewStatsBlock) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(String(format: "%.1f", reviews.averageRating))
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                Text("/5")
                    .font(.system(size: 14))
                    .foregroundColor(ForMe.stone400)
            }
            HStack(spacing: 2) {
                ForEach(1...5, id: \.self) { s in
                    if s <= Int(reviews.averageRating.rounded()) {
                        GoldStar(size: 12)
                    } else {
                        GoldStar(size: 12, fillColor: ForMe.stone200)
                    }
                }
            }
        }
    }

    func totalReviewsContent(_ reviews: AnalyticsData.ReviewStatsBlock) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("\(reviews.totalReviews)")
                .font(.system(size: 28, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)
            Text("Reviews received")
                .font(.system(size: 12))
                .foregroundColor(ForMe.stone500)
        }
    }

    func fiveStarContent(_ reviews: AnalyticsData.ReviewStatsBlock) -> some View {
        let count = reviews.ratingDistribution.first(where: { $0.rating == 5 })?.count ?? 0
        let pct = reviews.totalReviews > 0
            ? Int(Double(count) / Double(reviews.totalReviews) * 100)
            : 0
        return VStack(alignment: .leading, spacing: 8) {
            Text("\(count)")
                .font(.system(size: 28, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)
            Text(reviews.totalReviews > 0 ? "\(pct)% of total" : "No reviews yet")
                .font(.system(size: 12))
                .foregroundColor(ForMe.stone500)
        }
    }

    func ratingBarRow(star: Int, reviews: AnalyticsData.ReviewStatsBlock) -> some View {
        let count = reviews.ratingDistribution.first(where: { $0.rating == star })?.count ?? 0
        let pct = reviews.totalReviews > 0
            ? Double(count) / Double(reviews.totalReviews)
            : 0
        return HStack(spacing: 12) {
            HStack(spacing: 4) {
                Text("\(star)")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(ForMe.stone700)
                GoldStar(size: 12)
            }
            .frame(width: 40, alignment: .leading)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(ForMe.stone100).frame(height: 10)
                    Capsule().fill(ForMe.stone900)
                        .frame(width: geo.size.width * CGFloat(pct), height: 10)
                }
            }
            .frame(height: 10)

            Text("\(count)")
                .font(.system(size: 13))
                .foregroundColor(ForMe.stone500)
                .frame(width: 36, alignment: .trailing)
        }
    }

    @ViewBuilder
    func goalCalculatorContent(_ reviews: AnalyticsData.ReviewStatsBlock) -> some View {
        if reviews.totalReviews == 0 {
            VStack(spacing: 10) {
                GoldStar(size: 40, fillColor: ForMe.stone200)
                Text("No reviews yet")
                    .font(.system(size: 14))
                    .foregroundColor(ForMe.stone500)
                Text("Start collecting reviews to see goal progress")
                    .font(.system(size: 12))
                    .foregroundColor(ForMe.stone400)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
        } else if reviews.averageRating >= 5 {
            VStack(spacing: 10) {
                HStack(spacing: 4) {
                    ForEach(0..<5, id: \.self) { _ in GoldStar(size: 24) }
                }
                Text("Perfect 5-star rating!")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                Text("You've achieved the highest possible rating")
                    .font(.system(size: 12))
                    .foregroundColor(ForMe.stone500)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
        } else {
            VStack(spacing: 16) {
                // Current rating summary
                VStack(alignment: .leading, spacing: 4) {
                    Text("Current rating")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone600)
                    HStack(spacing: 8) {
                        Text(String(format: "%.1f", reviews.averageRating))
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(ForMe.textPrimary)
                        HStack(spacing: 2) {
                            ForEach(1...5, id: \.self) { s in
                                if s <= Int(reviews.averageRating.rounded()) {
                                    GoldStar(size: 13)
                                } else {
                                    GoldStar(size: 13, fillColor: ForMe.stone200)
                                }
                            }
                        }
                        Text("from \(reviews.totalReviews) reviews")
                            .font(.system(size: 12))
                            .foregroundColor(ForMe.stone500)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(14)
                .background(ForMe.stone50)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                // Targets
                VStack(spacing: 10) {
                    ForEach([4.5, 4.8, 5.0], id: \.self) { target in
                        goalTargetRow(target: target, reviews: reviews)
                    }
                }
            }
        }
    }

    func goalTargetRow(target: Double, reviews: AnalyticsData.ReviewStatsBlock) -> some View {
        let achieved = reviews.averageRating >= target
        let needed = viewModel.reviewsNeeded(to: target)
        let progress = min(reviews.averageRating / target, 1.0)

        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                HStack(spacing: 6) {
                    Text(String(format: "%.1f", target))
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                    GoldStar(size: 14)
                    Text("rating goal")
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.stone500)
                }
                Spacer()
                if achieved {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .bold))
                        Text("Achieved")
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundColor(Color(hex: "059669"))
                } else {
                    Text("\(needed) more 5-star \(needed == 1 ? "review" : "reviews") needed")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                }
            }

            if !achieved {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(ForMe.stone100).frame(height: 6)
                        Capsule().fill(ForMe.stone900)
                            .frame(width: geo.size.width * CGFloat(progress), height: 6)
                    }
                }
                .frame(height: 6)
            }
        }
        .padding(14)
        .background(achieved ? Color(hex: "ECFDF5") : ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(achieved ? Color(hex: "BBF7D0") : ForMe.stone200, lineWidth: 1)
        )
    }

    func bigReviewCard(title: String, content: AnyView) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(ForMe.stone400)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.stone200.opacity(0.6), lineWidth: 1)
        )
    }
}

// MARK: - Helpers

private extension AnalyticsView {
    func placeholderRow(_ text: String) -> some View {
        HStack {
            Spacer()
            Text(text)
                .font(.system(size: 13))
                .foregroundColor(ForMe.stone400)
            Spacer()
        }
        .padding(.vertical, 12)
    }

    func currency(_ value: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = "USD"
        f.maximumFractionDigits = 0
        return f.string(from: NSNumber(value: value)) ?? "$\(Int(value))"
    }

    func shortDate(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let out = DateFormatter()
        out.dateFormat = "MMM d, yyyy"
        if let d = formatter.date(from: iso) { return out.string(from: d) }
        let basic = ISO8601DateFormatter()
        if let d = basic.date(from: iso) { return out.string(from: d) }
        return iso.prefix(10).description
    }

    func statusColor(_ status: String) -> Color {
        switch status.lowercased() {
        case "accepted", "confirmed", "completed": return Color(hex: "059669")
        case "pending": return Color(hex: "D97706")
        default: return Color(hex: "DC2626")
        }
    }

}

// MARK: - Reusable card + stat

struct AnalyticsCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(ForMe.stone500)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.stone200.opacity(0.6), lineWidth: 1)
        )
    }
}

struct StatCard: View {
    let title: String
    let value: String
    var growth: Double? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.system(size: 12))
                    .foregroundColor(ForMe.stone400)
                    .lineLimit(1)
                Spacer()
                if let g = growth {
                    HStack(spacing: 3) {
                        Image(systemName: g >= 0 ? "arrow.up.right" : "arrow.down.right")
                            .font(.system(size: 10, weight: .semibold))
                        Text(String(format: "%.1f%%", abs(g)))
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundColor(g >= 0 ? Color(hex: "059669") : Color(hex: "DC2626"))
                }
            }

            Text(value)
                .font(.system(size: 24, weight: .bold))
                .tracking(-0.5)
                .foregroundColor(ForMe.textPrimary)
                .monospacedDigit()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.stone200.opacity(0.6), lineWidth: 1)
        )
    }
}

#Preview {
    NavigationStack {
        AnalyticsView()
            .environmentObject(AuthViewModel())
    }
}
