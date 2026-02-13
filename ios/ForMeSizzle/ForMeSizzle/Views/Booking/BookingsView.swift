import SwiftUI

struct BookingsView: View {
    @StateObject private var viewModel = BookingsListViewModel()
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            // Tabs
            Picker("", selection: $selectedTab) {
                Text("Upcoming").tag(0)
                Text("Past").tag(1)
            }
            .pickerStyle(.segmented)
            .padding()

            if viewModel.isLoading {
                Spacer()
                ForMeLoader(size: .medium)
                Spacer()
            } else if currentBookings.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "calendar")
                        .font(.system(size: 40))
                        .foregroundColor(ForMe.textTertiary)
                    Text(selectedTab == 0 ? "No upcoming bookings" : "No past bookings")
                        .font(.subheadline)
                        .foregroundColor(ForMe.textSecondary)
                }
                Spacer()
            } else {
                ScrollView {
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
                    .padding()
                }
            }
        }
        .navigationTitle("Bookings")
        .refreshable {
            await viewModel.loadReservations()
        }
        .task {
            await viewModel.loadReservations()
        }
    }

    var currentBookings: [Reservation] {
        let now = Date()
        if selectedTab == 0 {
            return viewModel.reservations.filter { reservation in
                guard let date = reservation.date else { return true }
                return date >= now
            }
        } else {
            return viewModel.reservations.filter { reservation in
                guard let date = reservation.date else { return false }
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
                if let date = reservation.date {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                        Text(date, style: .date)
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

#Preview {
    BookingsView()
}
