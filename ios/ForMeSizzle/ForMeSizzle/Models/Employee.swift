import Foundation

struct Employee: Codable, Identifiable {
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

    var user: User?

    enum CodingKeys: String, CodingKey {
        case id, fullName, jobTitle, imageSrc, bio
        case userId, listingId, serviceIds
        case isActive, isIndependent, user
    }
}
