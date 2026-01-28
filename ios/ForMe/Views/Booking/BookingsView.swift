import SwiftUI

struct BookingsView: View {
    @StateObject private var viewModel = BookingsListViewModel()
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
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
                    ProgressView()
                    Spacer()
                } else if currentBookings.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "calendar")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)
                        Text(selectedTab == 0 ? "No upcoming bookings" : "No past bookings")
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(currentBookings) { reservation in
                                BookingCard(reservation: reservation) {
                                    Task {
                                        await viewModel.cancelReservation(id: reservation.id)
                                    }
                                }
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
                        .font(.headline)

                    if let listing = reservation.listing {
                        Text(listing.title)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                StatusBadge(status: reservation.status)
            }

            Divider()

            HStack(spacing: 16) {
                if let date = reservation.date {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                        Text(date, style: .date)
                    }
                    .font(.subheadline)
                }

                if let time = reservation.time {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                        Text(time)
                    }
                    .font(.subheadline)
                }
            }
            .foregroundColor(.secondary)

            if let totalPrice = reservation.totalPrice {
                Text("$\(totalPrice, specifier: "%.0f")")
                    .font(.headline)
            }

            if reservation.status == .pending || reservation.status == .confirmed {
                Button(role: .destructive) {
                    showCancelConfirm = true
                } label: {
                    Text("Cancel Booking")
                        .font(.subheadline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
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
            .font(.caption.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(backgroundColor)
            .foregroundColor(foregroundColor)
            .cornerRadius(4)
    }

    var backgroundColor: Color {
        switch status {
        case .confirmed: return .green.opacity(0.2)
        case .pending: return .yellow.opacity(0.2)
        case .cancelled: return .red.opacity(0.2)
        case .none: return .gray.opacity(0.2)
        }
    }

    var foregroundColor: Color {
        switch status {
        case .confirmed: return .green
        case .pending: return .orange
        case .cancelled: return .red
        case .none: return .gray
        }
    }
}

#Preview {
    BookingsView()
}
