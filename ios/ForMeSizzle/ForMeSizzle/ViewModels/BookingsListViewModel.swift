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

    func cancelReservation(id: String) async {
        do {
            try await api.cancelReservation(id: id)
            reservations.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
