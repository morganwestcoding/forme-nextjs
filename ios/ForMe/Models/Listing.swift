import Foundation

struct Listing: Codable, Identifiable {
    let id: String
    var title: String
    var description: String?
    var imageSrc: String?
    var category: ServiceCategory
    var location: String?
    var address: String?
    var zipCode: String?
    var phoneNumber: String?
    var website: String?
    var galleryImages: [String]?

    var services: [Service]?
    var employees: [Employee]?
    var storeHours: [StoreHours]?

    var rating: Double?
    var ratingCount: Int?
    var followerIds: [String]?

    var userId: String
    var user: User?

    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, title, description, imageSrc, category
        case location, address, zipCode, phoneNumber, website
        case galleryImages, services, employees, storeHours
        case rating, ratingCount, followerIds
        case userId, user, createdAt
    }
}

enum ServiceCategory: String, Codable, CaseIterable {
    case hair = "Hair"
    case nails = "Nails"
    case skin = "Skin"
    case makeup = "Makeup"
    case massage = "Massage"
    case fitness = "Fitness"
    case wellness = "Wellness"
    case barber = "Barber"
    case spa = "Spa"
    case other = "Other"

    var icon: String {
        switch self {
        case .hair: return "scissors"
        case .nails: return "hand.raised.fill"
        case .skin: return "face.smiling"
        case .makeup: return "paintbrush.fill"
        case .massage: return "hand.wave.fill"
        case .fitness: return "figure.run"
        case .wellness: return "heart.fill"
        case .barber: return "comb.fill"
        case .spa: return "leaf.fill"
        case .other: return "sparkles"
        }
    }
}

struct ListingsResponse: Codable {
    let listings: [Listing]
    let totalCount: Int?
    let hasMore: Bool?
}
