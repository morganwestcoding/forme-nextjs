import Foundation

// MARK: - Shop (matches web SafeShop)

struct Shop: Codable, Identifiable, Hashable {
    static func == (lhs: Shop, rhs: Shop) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    var name: String
    var description: String?
    var logo: String?
    var coverImage: String?
    var location: String?
    var address: String?
    var zipCode: String?
    var isOnlineOnly: Bool?
    var userId: String?
    var storeUrl: String?
    var galleryImages: [String]?
    var createdAt: String?
    var updatedAt: String?
    var isVerified: Bool?
    var shopEnabled: Bool?
    var featuredProducts: [String]?
    var followers: [String]?
    var listingId: String?
    var category: String?
    var user: CompactUser?
    var products: [ShopProductSummary]?
    var productCount: Int?
    var followerCount: Int?
    var rating: Double?
    var featuredProductItems: [FeaturedProductItem]?
}

struct ShopProductSummary: Codable, Hashable {
    var name: String
    var image: String
    var price: Double?
}

struct FeaturedProductItem: Codable, Hashable, Identifiable {
    let id: String
    var name: String
    var price: Double
    var image: String
}
