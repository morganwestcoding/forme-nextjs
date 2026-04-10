import SwiftUI

struct BookingsView: View {
    @StateObject private var viewModel = BookingsListViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab = 0
    @State private var showMessages = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack(alignment: .center) {
                    Text("Bookings")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(ForMe.textPrimary)

                    Spacer()

                    HStack(spacing: 12) {
                        HeaderIconButton(icon: "AlertBell") {
                            appState.showingNotifications = true
                        }
                        HeaderIconButton(icon: "HeaderChat") {
                            showMessages = true
                        }
                        Button {
                            appState.showingProfile = true
                        } label: {
                            DynamicAvatar(
                                name: authViewModel.currentUser?.name ?? "User",
                                imageUrl: authViewModel.currentUser?.image,
                                size: .smallMedium
                            )
                        }
                    }
                }
                .padding(.horizontal)

                // Toggle
                SlidingToggle(selectedTab: $selectedTab)
                    .padding(.horizontal)

                if viewModel.isLoading {
                    ProgressView()
                        .padding(.top, 60)
                } else if currentBookings.isEmpty {
                    VStack(spacing: 8) {
                        Image("TabBooking")
                            .renderingMode(.template)
                            .resizable()
                            .frame(width: 40, height: 40)
                            .foregroundColor(ForMe.textTertiary)
                            .padding(.bottom, 4)
                        Text(selectedTab == 0 ? "Nothing scheduled yet" : "No past visits")
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(ForMe.textSecondary)
                        Text(selectedTab == 0 ? "Book a service and it'll show up here" : "Your completed bookings will appear here")
                            .font(.caption)
                            .foregroundColor(ForMe.textTertiary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, UIScreen.main.bounds.height * 0.2)
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(Array(currentBookings.enumerated()), id: \.element.id) { index, reservation in
                            let isIncoming = reservation.listing?.userId == authViewModel.currentUser?.id
                                && reservation.userId != authViewModel.currentUser?.id
                            BookingCard(
                                reservation: reservation,
                                isIncoming: isIncoming,
                                onCancel: {
                                    Task { await viewModel.cancelReservation(id: reservation.id) }
                                },
                                onAccept: {
                                    Task { await viewModel.updateReservationStatus(id: reservation.id, status: "confirmed") }
                                },
                                onReject: {
                                    Task { await viewModel.updateReservationStatus(id: reservation.id, status: "cancelled") }
                                }
                            )
                            .staggeredFadeIn(index: index)
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
        .refreshable {
            await viewModel.loadReservations()
        }
        .task {
            await viewModel.loadReservations()
        }
        .sheet(isPresented: $showMessages) {
            NavigationStack {
                MessagesListView()
            }
        }
    }

    var currentBookings: [Reservation] {
        let now = Date()
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if selectedTab == 0 {
            return viewModel.reservations.filter { reservation in
                guard let dateStr = reservation.date, let date = formatter.date(from: dateStr) else { return true }
                return date >= now
            }
        } else {
            return viewModel.reservations.filter { reservation in
                guard let dateStr = reservation.date, let date = formatter.date(from: dateStr) else { return false }
                return date < now
            }
        }
    }
}

struct BookingCard: View {
    let reservation: Reservation
    let isIncoming: Bool
    let onCancel: () -> Void
    var onAccept: (() -> Void)? = nil
    var onReject: (() -> Void)? = nil

    @State private var showCancelConfirm = false
    @State private var showRejectConfirm = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(reservation.serviceName ?? "Service")
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(ForMe.textPrimary)

                    if isIncoming, let user = reservation.user {
                        Text("from \(user.name ?? "Customer")")
                            .font(.caption)
                            .foregroundColor(ForMe.accent)
                    } else if let listing = reservation.listing {
                        Text(listing.title)
                            .font(.caption)
                            .foregroundColor(ForMe.textSecondary)
                    }
                }

                Spacer()

                StatusBadge(status: reservation.status)
            }

            Divider()
                .foregroundColor(ForMe.border)

            HStack(spacing: 16) {
                if let dateStr = reservation.date {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                        Text(formatDate(dateStr))
                    }
                    .font(.caption)
                }

                if let time = reservation.time {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                        Text(time)
                    }
                    .font(.caption)
                }
            }
            .foregroundColor(ForMe.textSecondary)

            if let totalPrice = reservation.totalPrice {
                Text("$\(totalPrice, specifier: "%.0f")")
                    .font(.subheadline.bold())
                    .foregroundColor(ForMe.textPrimary)
            }

            // Incoming: accept/reject for pending
            if isIncoming && reservation.status == .pending {
                HStack(spacing: 10) {
                    Button {
                        onAccept?()
                    } label: {
                        Text("Accept")
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(ForMe.statusConfirmed)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    }

                    Button {
                        showRejectConfirm = true
                    } label: {
                        Text("Reject")
                            .font(.caption.weight(.semibold))
                            .foregroundColor(ForMe.statusCancelled)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .overlay(
                                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                    .stroke(ForMe.statusCancelled.opacity(0.3), lineWidth: 1)
                            )
                    }
                }
            }

            // Outgoing: cancel for pending/confirmed
            if !isIncoming && (reservation.status == .pending || reservation.status == .confirmed) {
                Button(role: .destructive) {
                    showCancelConfirm = true
                } label: {
                    Text("Cancel Booking")
                        .font(.caption.weight(.medium))
                        .foregroundColor(ForMe.statusCancelled)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .stroke(ForMe.statusCancelled.opacity(0.3), lineWidth: 1)
                        )
                }
            }
        }
        .forMeCard()
        .confirmationDialog("Cancel Booking?", isPresented: $showCancelConfirm) {
            Button("Cancel Booking", role: .destructive, action: onCancel)
            Button("Keep Booking", role: .cancel) {}
        }
        .confirmationDialog("Reject this booking?", isPresented: $showRejectConfirm) {
            Button("Reject", role: .destructive) { onReject?() }
            Button("Keep", role: .cancel) {}
        }
    }

    private func formatDate(_ dateStr: String) -> String {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = iso.date(from: dateStr) {
            let f = DateFormatter()
            f.dateFormat = "EEE, MMM d, yyyy"
            return f.string(from: date)
        }
        // Fallback for yyyy-MM-dd format
        let simple = DateFormatter()
        simple.dateFormat = "yyyy-MM-dd"
        if let date = simple.date(from: dateStr) {
            let f = DateFormatter()
            f.dateFormat = "EEE, MMM d, yyyy"
            return f.string(from: date)
        }
        return dateStr
    }
}

struct StatusBadge: View {
    let status: ReservationStatus?

    var body: some View {
        Text(status?.rawValue.capitalized ?? "Unknown")
            .font(.caption2.bold())
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                LinearGradient(
                    colors: [statusColor.opacity(0.15), statusColor.opacity(0.08)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(statusColor)
            .cornerRadius(6)
    }

    var statusColor: Color {
        switch status {
        case .confirmed: return ForMe.statusConfirmed
        case .pending: return ForMe.statusPending
        case .cancelled: return ForMe.statusCancelled
        case .completed: return ForMe.statusCompleted
        case .none: return ForMe.statusClosed
        }
    }
}

private struct SlidingToggle: View {
    @Binding var selectedTab: Int
    @Namespace private var toggleNamespace

    private let tabs = ["Upcoming", "Past"]

    var body: some View {
        HStack(spacing: 4) {
            ForEach(Array(tabs.enumerated()), id: \.offset) { index, title in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = index
                    }
                } label: {
                    Text(title)
                        .font(.system(size: 13, weight: selectedTab == index ? .semibold : .medium))
                        .foregroundColor(selectedTab == index ? .white : ForMe.textSecondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 13)
                        .background {
                            if selectedTab == index {
                                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                    .fill(ForMe.textPrimary)
                                    .matchedGeometryEffect(id: "toggle", in: toggleNamespace)
                            }
                        }
                }
            }
        }
        .padding(4)
        .background(Color(hex: "F7F7F6"))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL))
        .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: 1)
    }
}

#Preview {
    BookingsView()
}
