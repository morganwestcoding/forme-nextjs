import Foundation

// MARK: - Product (matches web SafeProduct)

struct Product: Codable, Identifiable, Hashable {
    static func == (lhs: Product, rhs: Product) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    var name: String
    var description: String?
    var price: Double
    var compareAtPrice: Double?
    var mainImage: String?
    var galleryImages: [String]?
    var shopId: String?
    var createdAt: String?
    var updatedAt: String?
    var sku: String?
    var barcode: String?
    var categoryId: String?
    var category: ProductCategoryRef?
    var tags: [String]?
    var isPublished: Bool?
    var isFeatured: Bool?
    var inventory: Int?
    var lowStockThreshold: Int?
    var weight: Double?
    var shop: ProductShopRef?
    var favoritedBy: [String]?
    var reviews: [ProductReview]?

    // MARK: Computed
    var inStock: Bool { (inventory ?? 0) > 0 }

    var formattedPrice: String {
        price == price.rounded() ? "$\(Int(price))" : String(format: "$%.2f", price)
    }
}

struct ProductCategoryRef: Codable, Hashable {
    let id: String
    var name: String
}

struct ProductShopRef: Codable, Hashable {
    let id: String
    var name: String
    var logo: String?
}

struct ProductReview: Codable, Hashable {
    var userId: String?
    var userName: String?
    var userImage: String?
    var rating: Double
    var comment: String?
    var date: String?
}
