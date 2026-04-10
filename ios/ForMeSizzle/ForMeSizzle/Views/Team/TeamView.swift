import SwiftUI

struct TeamView: View {
    @StateObject private var viewModel = TeamViewModel()
    @State private var selectedTab = 0

    private let tabs = ["Overview", "Schedule", "Bookings", "Pay"]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Team")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(ForMe.textPrimary)
                    Text("Manage your staff and operations")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone400)
                }
                .padding(.horizontal)
                .padding(.top, ForMe.space3)

                // Listing selector (if multiple)
                if viewModel.listings.count > 1 {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(viewModel.listings) { listing in
                                Button {
                                    withAnimation { viewModel.selectedListingId = listing.id }
                                } label: {
                                    Text(listing.title)
                                        .font(.system(size: 13, weight: .semibold))
                                        .foregroundColor(viewModel.selectedListingId == listing.id ? .white : ForMe.textPrimary)
                                        .padding(.horizontal, ForMe.space4)
                                        .padding(.vertical, 10)
                                        .background(viewModel.selectedListingId == listing.id ? ForMe.stone900 : ForMe.surface)
                                        .clipShape(Capsule())
                                        .overlay(
                                            Capsule().stroke(viewModel.selectedListingId == listing.id ? .clear : ForMe.stone200, lineWidth: 1)
                                        )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal)
                    }
                } else if let listing = viewModel.selectedListing {
                    HStack(spacing: 10) {
                        AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().aspectRatio(contentMode: .fill)
                            default:
                                Rectangle().fill(ForMe.stone100)
                            }
                        }
                        .frame(width: 36, height: 36)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                        Text(listing.title)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                        Spacer()
                    }
                    .padding(.horizontal)
                }

                // Stat cards
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    StatCard(label: "Team Members", value: "\(viewModel.employees.count)", trend: nil)
                    StatCard(label: "Active Now", value: "\(viewModel.activeCount)", trend: nil)
                    StatCard(label: "Today's Bookings", value: "\(viewModel.todayBookings)", trend: nil)
                    StatCard(label: "Monthly Revenue", value: "$\(viewModel.monthlyRevenue)", trend: "+5%")
                }
                .padding(.horizontal)

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

                // Content
                Group {
                    switch selectedTab {
                    case 0: overviewTab
                    case 1: scheduleTab
                    case 2: bookingsTab
                    case 3: payTab
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

private extension TeamView {
    var overviewTab: some View {
        VStack(alignment: .leading, spacing: ForMe.space4) {
            Text("Team Members")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            if viewModel.employees.isEmpty {
                Text("No team members yet")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                VStack(spacing: 0) {
                    ForEach(viewModel.employees) { employee in
                        TeamMemberRow(employee: employee)
                        if employee.id != viewModel.employees.last?.id {
                            Divider().padding(.leading, 60)
                        }
                    }
                }
                .background(ForMe.surface)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )
            }
        }
    }
}

// MARK: - Schedule Tab

private extension TeamView {
    var scheduleTab: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            Text("Weekly Schedule")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            VStack(spacing: 0) {
                ForEach(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], id: \.self) { day in
                    HStack {
                        Text(day)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(ForMe.textPrimary)
                        Spacer()
                        Text("9 am - 5 pm")
                            .font(.system(size: 13))
                            .foregroundColor(ForMe.stone500)
                    }
                    .padding(.horizontal, ForMe.space4)
                    .padding(.vertical, 14)

                    if day != "Sunday" { Divider() }
                }
            }
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
        }
    }
}

// MARK: - Bookings Tab

private extension TeamView {
    var bookingsTab: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            Text("Recent Bookings")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            if viewModel.bookings.isEmpty {
                Text("No bookings yet")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                VStack(spacing: 8) {
                    ForEach(viewModel.bookings) { reservation in
                        BookingCard(
                            reservation: reservation,
                            isIncoming: true,
                            onCancel: {},
                            onAccept: {},
                            onReject: {}
                        )
                    }
                }
            }
        }
    }
}

// MARK: - Pay Tab

private extension TeamView {
    var payTab: some View {
        VStack(alignment: .leading, spacing: ForMe.space4) {
            Text("Pay Agreements")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            if viewModel.employees.isEmpty {
                Text("Add team members to set up pay agreements")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                VStack(spacing: 12) {
                    ForEach(viewModel.employees) { employee in
                        HStack(spacing: 14) {
                            DynamicAvatar(
                                name: employee.fullName,
                                imageUrl: employee.user?.image,
                                size: .small
                            )
                            VStack(alignment: .leading, spacing: 2) {
                                Text(employee.fullName)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(ForMe.textPrimary)
                                Text("70% commission · $350/wk rental")
                                    .font(.system(size: 11))
                                    .foregroundColor(ForMe.stone400)
                            }
                            Spacer()
                            Text("$0")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(ForMe.textPrimary)
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
        }
    }
}

// MARK: - Team Member Row

struct TeamMemberRow: View {
    let employee: Employee

    var body: some View {
        HStack(spacing: 14) {
            DynamicAvatar(
                name: employee.fullName,
                imageUrl: employee.user?.image,
                size: .medium
            )
            VStack(alignment: .leading, spacing: 3) {
                Text(employee.fullName)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                if let title = employee.jobTitle {
                    Text(title)
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
            Spacer()
            Circle()
                .fill(ForMe.statusConfirmed)
                .frame(width: 8, height: 8)
        }
        .padding(.horizontal, ForMe.space4)
        .padding(.vertical, ForMe.space3)
    }
}

#Preview {
    NavigationStack {
        TeamView()
            .environmentObject(AuthViewModel())
    }
}
