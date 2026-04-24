import SwiftUI

struct TeamView: View {
    @StateObject private var viewModel = TeamViewModel()
    @State private var selectedTab = 0
    @State private var editingScheduleFor: TeamMember?
    @State private var showMessagesSheet = false

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
                    StatCard(title: "Team members", value: "\(viewModel.members.count)")
                    StatCard(title: "Active now", value: "\(viewModel.activeCount)")
                    StatCard(title: "Today's bookings", value: "\(viewModel.todayBookings)")
                    StatCard(title: "Monthly revenue", value: "$\(viewModel.monthlyRevenue)", growth: 5)
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
        .sheet(item: $editingScheduleFor) { member in
            EditScheduleSheet(member: member) { schedule in
                Task {
                    let ok = await viewModel.saveSchedule(memberId: member.id, schedule: schedule)
                    if ok { editingScheduleFor = nil }
                }
            }
        }
        .sheet(isPresented: $showMessagesSheet) {
            NavigationStack {
                MessagesListView()
            }
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

            if viewModel.members.isEmpty {
                Text("No team members yet")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                VStack(spacing: 0) {
                    ForEach(viewModel.members) { member in
                        TeamMemberRow(member: member)
                        if member.id != viewModel.members.last?.id {
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

            if viewModel.members.isEmpty {
                Text("No team members to schedule")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                VStack(spacing: 12) {
                    ForEach(viewModel.members) { member in
                        MemberScheduleCard(member: member) {
                            editingScheduleFor = member
                        }
                    }
                }
            }
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
            Text(viewModel.isOwnerOfSelected ? "Pay Agreements" : "My Pay")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            // Employee view — only own row + message-manager CTA when no agreement
            if !viewModel.isOwnerOfSelected, let me = viewModel.myMember {
                MemberPayRow(member: me, showMessageManager: true) {
                    showMessagesSheet = true
                }
            } else if viewModel.isOwnerOfSelected {
                if viewModel.members.isEmpty {
                    Text("Add team members to set up pay agreements")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone400)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                } else {
                    VStack(spacing: 12) {
                        ForEach(viewModel.members) { member in
                            MemberPayRow(member: member, showMessageManager: false, onMessageManager: {})
                        }
                    }
                }
            } else {
                Text("No pay info available")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            }
        }
    }
}

// MARK: - Team Member Row (Overview)

struct TeamMemberRow: View {
    let member: TeamMember

    var body: some View {
        HStack(spacing: 14) {
            DynamicAvatar(
                name: member.fullName,
                imageUrl: member.user?.image,
                size: .medium
            )
            VStack(alignment: .leading, spacing: 3) {
                Text(member.fullName)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                if let title = member.jobTitle {
                    Text(title)
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
            Spacer()
            Circle()
                .fill(member.isActive ? ForMe.statusConfirmed : ForMe.stone300)
                .frame(width: 8, height: 8)
        }
        .padding(.horizontal, ForMe.space4)
        .padding(.vertical, ForMe.space3)
    }
}

// MARK: - Member Schedule Card (Schedule tab)

struct MemberScheduleCard: View {
    let member: TeamMember
    let onEdit: () -> Void

    private let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    private let short: [String: String] = [
        "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed", "Thursday": "Thu",
        "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun",
    ]

    private func display(for day: String) -> String {
        guard let a = member.availability.first(where: { $0.dayOfWeek == day }) else { return "Off" }
        if a.isOff { return "Off" }
        return "\(a.startTime) – \(a.endTime)"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                DynamicAvatar(name: member.fullName, imageUrl: member.user?.image, size: .small)
                Text(member.fullName)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                Button(action: onEdit) {
                    Text("Edit")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(ForMe.stone100)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)
            }

            VStack(spacing: 0) {
                ForEach(days, id: \.self) { day in
                    HStack {
                        Text(short[day] ?? day)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(ForMe.textSecondary)
                            .frame(width: 40, alignment: .leading)
                        Spacer()
                        Text(display(for: day))
                            .font(.system(size: 12))
                            .foregroundColor(display(for: day) == "Off" ? ForMe.stone400 : ForMe.textPrimary)
                    }
                    .padding(.vertical, 8)
                    if day != days.last { Divider() }
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

// MARK: - Member Pay Row

struct MemberPayRow: View {
    let member: TeamMember
    let showMessageManager: Bool
    let onMessageManager: () -> Void

    private var agreementLine: String {
        guard let pa = member.payAgreement else { return "No pay agreement set up" }
        switch pa.type {
        case "commission":
            let pct = pa.splitPercent.map { Int($0) } ?? 0
            return "\(pct)% commission"
        case "chair_rental":
            let amt = pa.rentalAmount.map { Int($0) } ?? 0
            let freq = pa.rentalFrequency ?? "weekly"
            return "$\(amt)/\(freq) chair rental"
        default:
            return "No pay agreement set up"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 14) {
                DynamicAvatar(name: member.fullName, imageUrl: member.user?.image, size: .small)
                VStack(alignment: .leading, spacing: 2) {
                    Text(member.fullName)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                    Text(agreementLine)
                        .font(.system(size: 11))
                        .foregroundColor(ForMe.stone400)
                }
                Spacer()
            }

            if showMessageManager && member.payAgreement == nil {
                Button(action: onMessageManager) {
                    Text("Message your manager →")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                        .underline()
                }
                .buttonStyle(.plain)
                .padding(.leading, 48)
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

#Preview {
    NavigationStack {
        TeamView()
            .environmentObject(AuthViewModel())
    }
}
