import SwiftUI
import Combine

@MainActor
class TeamViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var selectedListingId: String?
    @Published var allBookings: [Reservation] = []

    private let api = APIService.shared

    var selectedListing: Listing? {
        listings.first { $0.id == selectedListingId }
    }

    /// Employees tied to the currently selected listing
    var employees: [Employee] {
        selectedListing?.employees ?? []
    }

    /// Bookings filtered to the selected listing's employees
    var bookings: [Reservation] {
        let employeeIds = Set(employees.map(\.id))
        return allBookings.filter {
            if let listingId = $0.listingId, listingId == selectedListingId { return true }
            if let empId = $0.employeeId { return employeeIds.contains(empId) }
            return false
        }
    }

    var activeCount: Int {
        employees.filter { $0.isActive == true }.count
    }

    var todayBookings: Int {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let today = Calendar.current.startOfDay(for: Date())
        return bookings.filter {
            guard let dateStr = $0.date, let date = formatter.date(from: dateStr) else { return false }
            return Calendar.current.isDate(date, inSameDayAs: today)
        }.count
    }

    var monthlyRevenue: Int {
        bookings.compactMap { $0.totalPrice.map { Int($0) } }.reduce(0, +)
    }

    func load() async {
        do {
            let user = try await api.getCurrentUser()
            listings = try await api.getUserListings(userId: user.id)
            // Default to first listing
            if selectedListingId == nil {
                selectedListingId = listings.first?.id
            }
            allBookings = (try? await api.getReservations()) ?? []
        } catch {
            // silent
        }
    }
}
