import Foundation

// MARK: - Team Data (matches web /api/team/data response)

struct TeamData: Codable {
    var members: [TeamMember]
    var listings: [TeamListing]
    var ownedListingIds: [String]
    var todayBookings: [TeamBooking]
    var upcomingBookings: [TeamBooking]
    var stats: TeamStats
}

struct TeamListing: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let category: String
    var imageSrc: String?
}

struct TeamMember: Codable, Identifiable, Hashable {
    static func == (lhs: TeamMember, rhs: TeamMember) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    var fullName: String
    var jobTitle: String?
    var userId: String
    var listingId: String
    var serviceIds: [String]?
    var isActive: Bool
    var isIndependent: Bool?
    var teamRole: String?
    var createdAt: String?
    var user: CompactUser?
    var availability: [TeamAvailability]
    var timeOffRequests: [TeamTimeOffRequest]?
    var upcomingBookings: Int?
    var monthlyRevenue: Double?
    var payAgreement: TeamPayAgreement?
    var stripeConnectSetup: Bool?
}

struct TeamAvailability: Codable, Hashable {
    var dayOfWeek: String
    var startTime: String
    var endTime: String
    var isOff: Bool
}

struct TeamTimeOffRequest: Codable, Identifiable, Hashable {
    let id: String
    var startDate: String
    var endDate: String
    var reason: String?
    var status: String
}

struct TeamPayAgreement: Codable, Hashable {
    var type: String             // "commission" | "chair_rental"
    var splitPercent: Double?
    var rentalAmount: Double?
    var rentalFrequency: String?
    var autoApprovePayout: Bool
}

struct TeamBooking: Codable, Identifiable, Hashable {
    let id: String
    var serviceName: String
    var date: String
    var time: String
    var totalPrice: Double
    var status: String
    var note: String?
    var clientName: String?
    var clientImage: String?
    var clientEmail: String?
    var employeeName: String
    var employeeId: String
}

struct TeamStats: Codable {
    var totalMembers: Int
    var activeMembers: Int
    var todayBookingCount: Int
    var weekRevenue: Double
    var monthRevenue: Double
    var pendingTimeOff: Int
}

// MARK: - Availability update request

struct AvailabilityUpdateRequest: Codable {
    let employeeId: String
    let schedule: [TeamAvailability]
}
