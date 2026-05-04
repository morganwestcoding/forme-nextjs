import SwiftUI
import Combine

@MainActor
class BookingsListViewModel: ObservableObject {
    @Published var reservations: [Reservation] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func loadReservations() async {
        isLoading = true
        do {
            reservations = try await api.getReservations()
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // Used right after a booking completes: load now, then re-load a couple
    // seconds later to cover the Stripe-webhook → reservation-row latency.
    func loadWithPostBookingRetry() async {
        await loadReservations()
        try? await Task.sleep(nanoseconds: 2_500_000_000)
        await loadReservations()
        try? await Task.sleep(nanoseconds: 3_000_000_000)
        await loadReservations()
    }

    func cancelReservation(id: String) async {
        do {
            try await api.cancelReservation(id: id)
            reservations.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func updateReservationStatus(id: String, status: String) async {
        do {
            try await api.updateReservationStatus(id: id, status: status)
            if let index = reservations.firstIndex(where: { $0.id == id }) {
                reservations[index].status = ReservationStatus(rawValue: status) ?? .pending
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    /// Customer-side request OR owner-side immediate refund. The server
    /// branches on role; the iOS UI just reports the status it gets back.
    func refundReservation(id: String, reason: String? = nil) async -> RefundResponse? {
        do {
            let response = try await api.refundReservation(id: id, reason: reason)
            if let index = reservations.firstIndex(where: { $0.id == id }) {
                reservations[index].refundStatus = response.status
                if response.status == "completed" {
                    reservations[index].paymentStatus = "refunded"
                    reservations[index].status = .cancelled
                }
            }
            return response
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }
}
