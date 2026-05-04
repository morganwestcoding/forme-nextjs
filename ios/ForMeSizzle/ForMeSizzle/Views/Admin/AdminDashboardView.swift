import SwiftUI

/// Admin dashboard — KPI grid + nav into verifications, disputes, users, and
/// academies. Mirrors the SSR /admin page. Reachable from `SettingsView` only
/// when the user has master/admin role.
struct AdminDashboardView: View {
    @State private var stats: AdminStats?
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                header

                if let error {
                    Text(error)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.statusCancelled)
                }

                kpiGrid
                navGrid
            }
            .padding(.horizontal, ForMe.space5)
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space10)
        }
        .background(ForMe.background)
        .navigationTitle("Admin")
        .navigationBarTitleDisplayMode(.inline)
        // .onAppear fires on initial display AND when popping back from a
        // child screen, so the KPI counts auto-refresh after the admin
        // approves a verification or suspends a user. .task only fires on
        // initial display, which would leave the dashboard stale on return.
        .onAppear { Task { await load() } }
        .refreshable { await load() }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Master admin")
                .font(ForMe.font(.medium, size: 11))
                .foregroundColor(ForMe.stone400)
                .textCase(.uppercase)
            Text("Dashboard")
                .font(ForMe.font(.bold, size: 24))
                .foregroundColor(ForMe.textPrimary)
        }
    }

    private var kpiGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
            if let stats {
                kpiCard("Total users", value: "\(stats.totalUsers.formatted())", icon: "person.3.fill")
                kpiCard("Active listings", value: "\(stats.activeListings.formatted())", icon: "square.grid.2x2.fill")
                kpiCard("Reservations · MTD", value: "\(stats.reservationsThisMonth.formatted())", icon: "calendar")
                kpiCard("Revenue · MTD", value: currency(stats.revenueThisMonth), icon: "dollarsign.circle.fill")
                kpiCard("Active subscribers", value: "\(stats.activeSubscribers.formatted())", icon: "checkmark.seal.fill")
                kpiCard(
                    "Pending verifications",
                    value: "\(stats.pendingVerifications.formatted())",
                    icon: "shield.lefthalf.filled",
                    alert: stats.pendingVerifications > 0
                )
                kpiCard(
                    "Active disputes",
                    value: "\(stats.activeDisputes.formatted())",
                    icon: "exclamationmark.triangle.fill",
                    alert: stats.activeDisputes > 0
                )
            } else if isLoading {
                ForEach(0..<6, id: \.self) { _ in
                    placeholderCard
                }
            }
        }
    }

    private func kpiCard(_ label: String, value: String, icon: String, alert: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                ZStack {
                    Circle()
                        .fill(alert ? ForMe.statusPending.opacity(0.18) : ForMe.stone100)
                        .frame(width: 32, height: 32)
                    Image(systemName: icon)
                        .font(.system(size: 14))
                        .foregroundColor(alert ? ForMe.statusPending : ForMe.stone600)
                }
                Spacer()
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(ForMe.font(.medium, size: 11))
                    .foregroundColor(ForMe.stone400)
                Text(value)
                    .font(ForMe.font(.bold, size: 22))
                    .foregroundColor(alert ? ForMe.statusPending : ForMe.textPrimary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(ForMe.space4)
        .background(alert ? ForMe.statusPending.opacity(0.08) : ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(alert ? ForMe.statusPending.opacity(0.4) : ForMe.borderLight, lineWidth: 1)
        )
    }

    private var placeholderCard: some View {
        RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
            .fill(ForMe.stone100)
            .frame(height: 96)
    }

    private var navGrid: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Operations")
                .font(ForMe.font(.semibold, size: 12))
                .foregroundColor(ForMe.stone400)
                .textCase(.uppercase)
                .padding(.horizontal, 4)
                .padding(.bottom, 4)

            navRow(
                label: "Verifications",
                description: "Approve licensing submissions",
                icon: "shield.lefthalf.filled",
                badge: stats?.pendingVerifications
            ) {
                AdminVerificationsView()
            }

            navRow(
                label: "Disputes",
                description: "Payment disputes & resolutions",
                icon: "flag.fill",
                badge: stats?.activeDisputes
            ) {
                AdminDisputesView()
            }

            navRow(
                label: "Users",
                description: "Accounts, roles, suspensions",
                icon: "person.3.fill",
                badge: nil
            ) {
                AdminUsersView()
            }

            navRow(
                label: "Academies",
                description: "Partner programs & payouts",
                icon: "graduationcap.fill",
                badge: nil
            ) {
                AcademiesAdminListView()
            }
        }
    }

    @ViewBuilder
    private func navRow<Destination: View>(
        label: String,
        description: String,
        icon: String,
        badge: Int?,
        @ViewBuilder destination: () -> Destination
    ) -> some View {
        NavigationLink {
            destination()
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(ForMe.stone900)
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .font(.system(size: 17))
                        .foregroundColor(.white)
                }
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(label)
                            .font(ForMe.font(.semibold, size: 14))
                            .foregroundColor(ForMe.textPrimary)
                        if let count = badge, count > 0 {
                            Text(count > 99 ? "99+" : "\(count)")
                                .font(ForMe.font(.bold, size: 10))
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(ForMe.statusPending)
                                .clipShape(Capsule())
                        }
                    }
                    Text(description)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.stone400)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(ForMe.stone400)
            }
            .padding(ForMe.space4)
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Actions

    private func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            stats = try await APIService.shared.getAdminStats()
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func currency(_ value: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = "USD"
        f.maximumFractionDigits = 0
        return f.string(from: NSNumber(value: value)) ?? "$\(Int(value))"
    }
}
