import Foundation

// MARK: - Review (matches web SafeReview)

struct Review: Codable, Identifiable {
    let id: String
    var rating: Double
    var comment: String?
    var createdAt: String?
    var updatedAt: String?
    var userId: String?
    var targetType: String?  // "user" | "listing"
    var targetUserId: String?
    var targetListingId: String?
    var reservationId: String?
    var helpfulVotes: [String]?
    var user: CompactUser?
    var isVerifiedBooking: Bool?
}

struct SubmitReviewRequest: Codable {
    let rating: Int
    let comment: String?
    let targetType: String
    let targetUserId: String?
    let targetListingId: String?
    let reservationId: String?
}

struct ReviewHelpfulResponse: Codable {
    let success: Bool
    let helpfulVotes: [String]
    let hasVoted: Bool
}
