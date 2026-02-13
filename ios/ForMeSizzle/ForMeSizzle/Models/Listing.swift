import Foundation

struct Listing: Codable, Identifiable, Hashable {
    static func == (lhs: Listing, rhs: Listing) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

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

    init(
        id: String, title: String, description: String? = nil, imageSrc: String? = nil,
        category: ServiceCategory = .other, location: String? = nil, address: String? = nil,
        zipCode: String? = nil, phoneNumber: String? = nil, website: String? = nil,
        galleryImages: [String]? = nil, services: [Service]? = nil, employees: [Employee]? = nil,
        storeHours: [StoreHours]? = nil, rating: Double? = nil, ratingCount: Int? = nil,
        followerIds: [String]? = nil, userId: String, user: User? = nil, createdAt: Date? = nil
    ) {
        self.id = id; self.title = title; self.description = description; self.imageSrc = imageSrc
        self.category = category; self.location = location; self.address = address
        self.zipCode = zipCode; self.phoneNumber = phoneNumber; self.website = website
        self.galleryImages = galleryImages; self.services = services; self.employees = employees
        self.storeHours = storeHours; self.rating = rating; self.ratingCount = ratingCount
        self.followerIds = followerIds; self.userId = userId; self.user = user; self.createdAt = createdAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        imageSrc = try container.decodeIfPresent(String.self, forKey: .imageSrc)
        // Gracefully handle unknown categories
        category = (try? container.decode(ServiceCategory.self, forKey: .category)) ?? .other
        location = try container.decodeIfPresent(String.self, forKey: .location)
        address = try container.decodeIfPresent(String.self, forKey: .address)
        zipCode = try container.decodeIfPresent(String.self, forKey: .zipCode)
        phoneNumber = try container.decodeIfPresent(String.self, forKey: .phoneNumber)
        website = try container.decodeIfPresent(String.self, forKey: .website)
        galleryImages = try container.decodeIfPresent([String].self, forKey: .galleryImages)
        services = try container.decodeIfPresent([Service].self, forKey: .services)
        employees = try container.decodeIfPresent([Employee].self, forKey: .employees)
        storeHours = try container.decodeIfPresent([StoreHours].self, forKey: .storeHours)
        rating = try container.decodeIfPresent(Double.self, forKey: .rating)
        ratingCount = try container.decodeIfPresent(Int.self, forKey: .ratingCount)
        followerIds = try container.decodeIfPresent([String].self, forKey: .followerIds)
        userId = try container.decode(String.self, forKey: .userId)
        user = try container.decodeIfPresent(User.self, forKey: .user)
        createdAt = try? container.decodeIfPresent(Date.self, forKey: .createdAt)
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
    case salon = "Salon"
    case beauty = "Beauty"
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
        case .salon: return "comb"
        case .beauty: return "sparkles"
        case .other: return "sparkles"
        }
    }
}

extension Listing {
    var priceRange: String? {
        guard let services = services, !services.isEmpty else { return nil }
        let prices = services.map { $0.price }
        guard let minPrice = prices.min(), let maxPrice = prices.max() else { return nil }
        if minPrice == maxPrice {
            return String(format: "$%.0f", minPrice)
        }
        return String(format: "$%.0f–$%.0f", minPrice, maxPrice)
    }
}

struct ListingsResponse: Codable {
    let listings: [Listing]
    let totalCount: Int?
    let hasMore: Bool?
}
