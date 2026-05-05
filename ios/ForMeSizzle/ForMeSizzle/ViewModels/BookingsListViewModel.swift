import SwiftUI
import Combine

@MainActor
class BookingsListViewModel: ObservableObject {
    // Two buckets, mirroring web /api/reservations: outgoing = bookings you
    // made as a customer; incoming = bookings other customers made for you
    // (either at your listing or for you as an assigned employee).
    @Published var outgoing: [Reservation] = []
    @Published var incoming: [Reservation] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    /// Total pending requests in the incoming queue (any date) — surfaced as
    /// the attention badge on the Incoming tab.
    var pendingIncomingCount: Int {
        incoming.filter { $0.status == .pending }.count
    }

    func loadReservations() async {
        isLoading = true
        do {
            let buckets = try await api.getReservations()
            outgoing = buckets.outgoing
            incoming = buckets.incoming
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
            outgoing.removeAll { $0.id == id }
            incoming.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func updateReservationStatus(id: String, status: String) async {
        do {
            try await api.updateReservationStatus(id: id, status: status)
            applyToBoth(id: id) { r in
                r.status = ReservationStatus(rawValue: status) ?? .pending
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
            applyToBoth(id: id) { r in
                r.refundStatus = response.status
                if response.status == "completed" {
                    r.paymentStatus = "refunded"
                    r.status = .cancelled
                }
            }
            return response
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }

    /// A reservation can live in both arrays (e.g. self-booking at your own
    /// business), so mutations need to walk both rather than picking one.
    private func applyToBoth(id: String, mutation: (inout Reservation) -> Void) {
        if let i = outgoing.firstIndex(where: { $0.id == id }) {
            mutation(&outgoing[i])
        }
        if let i = incoming.firstIndex(where: { $0.id == id }) {
            mutation(&incoming[i])
        }
    }
}
