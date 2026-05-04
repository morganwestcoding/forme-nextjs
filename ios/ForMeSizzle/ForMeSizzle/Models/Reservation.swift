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
    var refundStatus: String?  // "requested" | "completed" | nil
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

struct RefundResponse: Codable {
    let status: String        // "completed" | "requested"
    let refundId: String?
    let amount: Int?
}

// MARK: - Status Enums

enum ReservationStatus: String, Codable {
    case pending
    case confirmed
    case accepted   // server writes this via /api/reservations/[id] PATCH
    case declined   // server writes this via /api/reservations/[id] PATCH
    case cancelled
    case completed
    case unknown

    // Any status the server introduces later shouldn't crash decoding of
    // the entire reservations response — fall back to `.unknown`.
    init(from decoder: Decoder) throws {
        let raw = try decoder.singleValueContainer().decode(String.self)
        self = ReservationStatus(rawValue: raw) ?? .unknown
    }

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .confirmed, .accepted: return "Confirmed"
        case .declined: return "Declined"
        case .cancelled: return "Cancelled"
        case .completed: return "Completed"
        case .unknown: return "Unknown"
        }
    }

    var color: String {
        switch self {
        case .pending: return "FBBF24"     // amber
        case .confirmed, .accepted: return "34D399"   // emerald
        case .declined, .cancelled: return "FB7185"   // rose
        case .completed: return "60A5FA"   // sky
        case .unknown: return "9CA3AF"     // gray
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
