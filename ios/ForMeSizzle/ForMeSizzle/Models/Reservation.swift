import Foundation

struct Reservation: Codable, Identifiable {
    let id: String
    var date: Date?
    var time: String?
    var note: String?

    var totalPrice: Double?
    var paymentIntentId: String?
    var paymentStatus: PaymentStatus?
    var status: ReservationStatus

    var userId: String
    var listingId: String
    var employeeId: String?
    var serviceId: String?
    var serviceName: String?

    var user: User?
    var listing: Listing?
    var employee: Employee?
    var service: Service?

    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, date, time, note
        case totalPrice, paymentIntentId, paymentStatus, status
        case userId, listingId, employeeId, serviceId, serviceName
        case user, listing, employee, service, createdAt
    }
}

enum PaymentStatus: String, Codable {
    case pending, succeeded, failed, refunded
}

enum ReservationStatus: String, Codable {
    case pending, confirmed, cancelled, completed

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
        case .pending: return "orange"
        case .confirmed: return "green"
        case .cancelled: return "red"
        case .completed: return "blue"
        }
    }
}

struct ReservationRequest: Codable {
    let listingId: String
    let employeeId: String?
    let serviceId: String
    let date: String
    let time: String
    let note: String?
    let totalPrice: Double
}
