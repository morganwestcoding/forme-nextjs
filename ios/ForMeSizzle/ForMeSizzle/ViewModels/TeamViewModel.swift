import SwiftUI
import Combine

@MainActor
class TeamViewModel: ObservableObject {
    @Published var teamData: TeamData?
    @Published var selectedListingId: String?
    @Published var allBookings: [Reservation] = []
    @Published var currentUserId: String?

    private let api = APIService.shared

    var listings: [TeamListing] { teamData?.listings ?? [] }
    var ownedListingIds: [String] { teamData?.ownedListingIds ?? [] }

    var selectedListing: TeamListing? {
        listings.first { $0.id == selectedListingId }
    }

    /// Members (with availability & pay agreement) for the selected listing.
    var members: [TeamMember] {
        guard let id = selectedListingId else { return [] }
        return teamData?.members.filter { $0.listingId == id } ?? []
    }

    /// Whether the current user owns the selected listing (vs. just employed there).
    var isOwnerOfSelected: Bool {
        guard let id = selectedListingId else { return false }
        return ownedListingIds.contains(id)
    }

    /// The current user's own employee record on the selected listing, if any.
    var myMember: TeamMember? {
        guard let uid = currentUserId else { return nil }
        return members.first { $0.userId == uid }
    }

    /// Bookings filtered to the selected listing's members.
    var bookings: [Reservation] {
        let memberIds = Set(members.map(\.id))
        return allBookings.filter {
            if let listingId = $0.listingId, listingId == selectedListingId { return true }
            if let empId = $0.employeeId { return memberIds.contains(empId) }
            return false
        }
    }

    var activeCount: Int { members.filter(\.isActive).count }

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
        Int(members.compactMap(\.monthlyRevenue).reduce(0, +))
    }

    func load() async {
        do {
            let user = try await api.getCurrentUser()
            currentUserId = user.id

            let data = try await api.getTeamData()
            teamData = data

            if selectedListingId == nil || !data.listings.contains(where: { $0.id == selectedListingId }) {
                selectedListingId = data.listings.first?.id
            }

            allBookings = (try? await api.getReservations()) ?? []
        } catch {
            // silent
        }
    }

    /// Update one member's weekly schedule and refresh the team data.
    func saveSchedule(memberId: String, schedule: [TeamAvailability]) async -> Bool {
        do {
            try await api.updateAvailability(employeeId: memberId, schedule: schedule)
            // Patch locally so the UI reflects the change without a full refetch.
            if var data = teamData {
                if let idx = data.members.firstIndex(where: { $0.id == memberId }) {
                    data.members[idx].availability = schedule
                    teamData = data
                }
            }
            return true
        } catch {
            return false
        }
    }
}
