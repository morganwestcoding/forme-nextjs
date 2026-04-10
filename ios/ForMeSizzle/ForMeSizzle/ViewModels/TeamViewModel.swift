import SwiftUI
import Combine

@MainActor
class TeamViewModel: ObservableObject {
    @Published var employees: [Employee] = []
    @Published var bookings: [Reservation] = []
    @Published var activeCount = 0
    @Published var todayBookings = 0
    @Published var monthlyRevenue = 0

    private let api = APIService.shared

    func load() async {
        do {
            let user = try await api.getCurrentUser()
            let listings = try await api.getUserListings(userId: user.id)

            // Aggregate employees from all listings
            employees = listings.flatMap { $0.employees ?? [] }
            activeCount = employees.filter { $0.isActive == true }.count

            // Get reservations
            bookings = (try? await api.getReservations()) ?? []

            // Today's bookings
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            let today = Calendar.current.startOfDay(for: Date())
            todayBookings = bookings.filter {
                guard let dateStr = $0.date, let date = formatter.date(from: dateStr) else { return false }
                return Calendar.current.isDate(date, inSameDayAs: today)
            }.count

            monthlyRevenue = bookings.compactMap { $0.totalPrice.map { Int($0) } }.reduce(0, +)
        } catch {
            // silent
        }
    }
}
