import Foundation

// MARK: - Listing (matches web SafeListing)

struct Listing: Codable, Identifiable, Hashable {
    static func == (lhs: Listing, rhs: Listing) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    var title: String
    var description: String?
    var imageSrc: String?
    var category: String
    var location: String?
    var address: String?
    var zipCode: String?
    var city: String?
    var state: String?
    var phoneNumber: String?
    var website: String?
    var galleryImages: [String]?
    var favoriteIds: [String]?
    var services: [Service]?
    var employees: [Employee]?
    var storeHours: [StoreHours]?
    var followers: [String]?
    var followerCount: Int?
    var rating: Double?
    var ratingCount: Int?
    var isTrending: Bool?
    var lat: Double?
    var lng: Double?
    var userId: String?
    var user: CompactUser?
    var createdAt: String?

    // MARK: Computed

    var priceRange: String? {
        guard let services = services, !services.isEmpty else { return nil }
        let prices = services.map(\.price).filter { $0 > 0 }
        guard let min = prices.min(), let max = prices.max() else { return nil }
        if min == max { return "$\(Int(min))" }
        return "$\(Int(min)) - $\(Int(max))"
    }

    var displayLocation: String {
        if let city = city, let state = state { return "\(city), \(state)" }
        return location ?? ""
    }

    var categoryIcon: String {
        ServiceCategory(rawValue: category.lowercased())?.icon ?? "sparkles"
    }
}

struct ListingsResponse: Codable {
    let listings: [Listing]
    let totalCount: Int?
    let hasMore: Bool?
}

// MARK: - Legacy Compatibility
// Old ServiceCategory enum — views still reference this until Phase 2 rebuild

enum ServiceCategory: String, Codable, CaseIterable {
    case hair, nails, skin, makeup, massage, fitness, wellness, barber, spa, salon, beauty, other

    var icon: String {
        switch self {
        case .hair: return "scissors"
        case .nails: return "paintbrush.fill"
        case .skin: return "drop.fill"
        case .makeup: return "face.smiling"
        case .massage: return "hand.raised.fill"
        case .fitness: return "figure.run"
        case .wellness: return "leaf.fill"
        case .barber: return "comb.fill"
        case .spa: return "sparkles"
        case .salon: return "scissors"
        case .beauty: return "sparkles"
        case .other: return "ellipsis"
        }
    }
}
