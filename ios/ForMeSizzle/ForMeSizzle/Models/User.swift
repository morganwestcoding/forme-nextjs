import Foundation

// MARK: - User (matches web SafeUser)

struct User: Codable, Identifiable, Hashable {
    static func == (lhs: User, rhs: User) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    var name: String?
    var email: String?
    var image: String?
    var imageSrc: String?
    var backgroundImage: String?
    var bio: String?
    var location: String?
    var galleryImages: [String]?
    var favoriteIds: [String]?

    // Licensing / Verification
    var licensingImage: String?
    var verificationStatus: VerificationStatus?
    var verifiedAt: String?
    var verificationRejectedAt: String?
    var rejectionReason: String?

    // Subscription
    var isSubscribed: Bool?
    var subscriptionStartDate: String?
    var subscriptionEndDate: String?
    var subscriptionTier: String?

    // Stripe
    var stripeCustomerId: String?
    var stripeSubscriptionId: String?

    // Stripe Connect
    var stripeConnectAccountId: String?
    var stripeConnectOnboardingComplete: Bool?
    var stripeConnectDetailsSubmitted: Bool?
    var stripeConnectChargesEnabled: Bool?
    var stripeConnectPayoutsEnabled: Bool?

    // Social
    var following: [String]?
    var followers: [String]?
    var conversationIds: [String]?

    // Professional
    var managedListings: [String]?
    var role: String?

    // Timestamps
    var createdAt: String?
    var updatedAt: String?
    var emailVerified: String?

    // MARK: Computed

    var isVerified: Bool { verificationStatus == .verified }
    var displayName: String { name ?? "User" }
    var avatarURL: String? { image ?? imageSrc }
    var followerCount: Int { followers?.count ?? 0 }
    var followingCount: Int { following?.count ?? 0 }
}

// MARK: - Compact User (for nested references in API responses)

struct CompactUser: Codable, Identifiable, Hashable {
    let id: String
    var name: String?
    var image: String?
    var imageSrc: String?
    var backgroundImage: String?
    var verificationStatus: String?
}

// MARK: - Verification Status

enum VerificationStatus: String, Codable {
    case unverified = "none"
    case pending
    case verified
    case rejected
}

// MARK: - Auth Types

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
    var userType: String?
    var location: String?
    var bio: String?
    var image: String?
    var jobTitle: String?
    var isOwnerManager: Bool?
    var selectedListing: String?
    var listingCategory: String?
    var listingTitle: String?
    var listingDescription: String?
}

struct CheckEmailResponse: Codable {
    let exists: Bool
}

struct ProfileUpdateRequest: Codable {
    var name: String?
    var bio: String?
    var location: String?
    var image: String?
    var backgroundImage: String?
}
