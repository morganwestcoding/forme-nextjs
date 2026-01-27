import Foundation

struct User: Codable, Identifiable {
    let id: String
    var name: String?
    var email: String?
    var image: String?
    var bio: String?
    var location: String?
    var backgroundImage: String?
    var galleryImages: [String]?

    // Subscription
    var isSubscribed: Bool?
    var subscriptionTier: SubscriptionTier?

    // Verification
    var verificationStatus: VerificationStatus?

    // Stripe Connect
    var stripeConnectAccountId: String?
    var stripeConnectOnboardingComplete: Bool?
    var stripeConnectChargesEnabled: Bool?

    // Social
    var followingIds: [String]?
    var followerIds: [String]?

    // Business
    var managedListings: [String]?
    var role: UserRole?

    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, name, email, image, bio, location
        case backgroundImage, galleryImages
        case isSubscribed, subscriptionTier
        case verificationStatus
        case stripeConnectAccountId, stripeConnectOnboardingComplete, stripeConnectChargesEnabled
        case followingIds, followerIds
        case managedListings, role, createdAt
    }
}

enum SubscriptionTier: String, Codable {
    case free, basic, pro, premium
}

enum VerificationStatus: String, Codable {
    case none, pending, verified, rejected
}

enum UserRole: String, Codable {
    case user, admin, master
}

struct AuthResponse: Codable {
    let user: User
    let token: String?
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let name: String
    let email: String
    let password: String
    let userType: String?
}
