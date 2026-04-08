import Foundation

// MARK: - Reservation (matches web SafeReservation)

struct Reservation: Codable, Identifiable {
    let id: String
    var date: String?
    var time: String?
    var note: String?
    var totalPrice: Double?
    var paymentIntentId: String?
    var paymentStatus: String?
    var status: ReservationStatus
    var userId: String?
    var listingId: String?
    var employeeId: String?
    var serviceId: String?
    var serviceName: String?
    var user: CompactUser?
    var listing: Listing?
    var employee: Employee?
    var service: Service?
    var createdAt: String?
}

// MARK: - Status Enums

enum ReservationStatus: String, Codable {
    case pending
    case confirmed
    case cancelled
    case completed

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .confirmed: return "Confirmed"
        case .cancelled: return "Cancelled"
        case .completed: return "Completed"
        }
    }

    var color: String {
        switch self {
        case .pending: return "FBBF24"     // amber
        case .confirmed: return "34D399"   // emerald
        case .cancelled: return "FB7185"   // rose
        case .completed: return "60A5FA"   // sky
        }
    }
}

struct ReservationRequest: Codable {
    let listingId: String
    var employeeId: String?
    let serviceId: String
    let date: String
    let time: String
    var note: String?
    let totalPrice: Double
}
