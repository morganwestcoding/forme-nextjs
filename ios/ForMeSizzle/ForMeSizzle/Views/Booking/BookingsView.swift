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
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Bookings")
                            .font(.largeTitle.bold())
                            .foregroundColor(ForMe.textPrimary)

                        Text("Your upcoming appointments")
                            .font(.subheadline)
                            .foregroundColor(ForMe.textSecondary)
                    }

                    Spacer()

                    HStack(spacing: 12) {
                        HeaderIconButton(icon: "AlertBell") {
                            // TODO: alerts
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
                            BookingCard(reservation: reservation) {
                                Task {
                                    await viewModel.cancelReservation(id: reservation.id)
                                }
                            }
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
    let onCancel: () -> Void

    @State private var showCancelConfirm = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(reservation.serviceName ?? "Service")
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(ForMe.textPrimary)

                    if let listing = reservation.listing {
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
                        Text(dateStr)
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

            if reservation.status == .pending || reservation.status == .confirmed {
                Button(role: .destructive) {
                    showCancelConfirm = true
                } label: {
                    Text("Cancel Booking")
                        .font(.caption.weight(.medium))
                        .foregroundColor(ForMe.statusCancelled)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(ForMe.statusCancelled.opacity(0.3), lineWidth: 1)
                        )
                        .cornerRadius(8)
                }
            }
        }
        .forMeCard()
        .confirmationDialog("Cancel Booking?", isPresented: $showCancelConfirm) {
            Button("Cancel Booking", role: .destructive, action: onCancel)
            Button("Keep Booking", role: .cancel) {}
        }
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
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
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
            RoundedRectangle(cornerRadius: 16)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: 1)
    }
}

#Preview {
    BookingsView()
}
