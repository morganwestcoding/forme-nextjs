import Foundation

// MARK: - Service (matches web SafeService + extended fields)

struct Service: Codable, Identifiable, Hashable {
    let id: String
    var serviceName: String
    var price: Double
    var category: String?
    var imageSrc: String?
    var description: String?
    var duration: Int?  // in minutes
    var listingId: String?

    // MARK: Computed

    var formattedPrice: String {
        price == price.rounded() ? "$\(Int(price))" : String(format: "$%.2f", price)
    }

    var formattedDuration: String {
        guard let duration = duration else { return "" }
        if duration >= 60 {
            let hours = duration / 60
            let mins = duration % 60
            return mins > 0 ? "\(hours)h \(mins)min" : "\(hours)h"
        }
        return "\(duration) min"
    }
}
