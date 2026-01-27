import Foundation

struct Service: Codable, Identifiable {
    let id: String
    var serviceName: String
    var price: Double
    var category: String?
    var imageSrc: String?
    var description: String?
    var duration: Int? // in minutes

    var listingId: String?

    enum CodingKeys: String, CodingKey {
        case id, serviceName, price, category, imageSrc, description, duration, listingId
    }
}

extension Service {
    var formattedPrice: String {
        return String(format: "$%.2f", price)
    }

    var formattedDuration: String? {
        guard let duration = duration else { return nil }
        if duration >= 60 {
            let hours = duration / 60
            let minutes = duration % 60
            if minutes > 0 {
                return "\(hours)h \(minutes)m"
            }
            return "\(hours)h"
        }
        return "\(duration) min"
    }
}
