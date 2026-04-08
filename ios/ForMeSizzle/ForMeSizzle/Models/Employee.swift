import Foundation

// MARK: - Employee (matches web SafeEmployee)

struct Employee: Codable, Identifiable, Hashable {
    static func == (lhs: Employee, rhs: Employee) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    var fullName: String
    var jobTitle: String?
    var imageSrc: String?
    var bio: String?
    var userId: String?
    var listingId: String?
    var serviceIds: [String]?
    var isActive: Bool?
    var isIndependent: Bool?
    var listingTitle: String?
    var listingCategory: String?
    var user: CompactUser?
    var createdAt: String?
}
