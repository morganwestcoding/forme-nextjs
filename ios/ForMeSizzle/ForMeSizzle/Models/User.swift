import Foundation

struct User: Codable, Identifiable, Hashable {
    static func == (lhs: User, rhs: User) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

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
    var subscriptionTier: String?

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
    var role: String?

    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, name, email, image, bio, location
        case backgroundImage, galleryImages
        case isSubscribed, subscriptionTier
        case verificationStatus
        case stripeConnectAccountId, stripeConnectOnboardingComplete, stripeConnectChargesEnabled
        case followingIds = "following"
        case followerIds = "followers"
        case managedListings, role, createdAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        name = try container.decodeIfPresent(String.self, forKey: .name)
        email = try container.decodeIfPresent(String.self, forKey: .email)
        image = try container.decodeIfPresent(String.self, forKey: .image)
        bio = try container.decodeIfPresent(String.self, forKey: .bio)
        location = try container.decodeIfPresent(String.self, forKey: .location)
        backgroundImage = try container.decodeIfPresent(String.self, forKey: .backgroundImage)
        galleryImages = try container.decodeIfPresent([String].self, forKey: .galleryImages)
        isSubscribed = try container.decodeIfPresent(Bool.self, forKey: .isSubscribed)
        subscriptionTier = try container.decodeIfPresent(String.self, forKey: .subscriptionTier)
        verificationStatus = try? container.decodeIfPresent(VerificationStatus.self, forKey: .verificationStatus)
        stripeConnectAccountId = try container.decodeIfPresent(String.self, forKey: .stripeConnectAccountId)
        stripeConnectOnboardingComplete = try container.decodeIfPresent(Bool.self, forKey: .stripeConnectOnboardingComplete)
        stripeConnectChargesEnabled = try container.decodeIfPresent(Bool.self, forKey: .stripeConnectChargesEnabled)
        followingIds = try container.decodeIfPresent([String].self, forKey: .followingIds)
        followerIds = try container.decodeIfPresent([String].self, forKey: .followerIds)
        managedListings = try container.decodeIfPresent([String].self, forKey: .managedListings)
        role = try container.decodeIfPresent(String.self, forKey: .role)
        createdAt = try? container.decodeIfPresent(Date.self, forKey: .createdAt)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(name, forKey: .name)
        try container.encodeIfPresent(email, forKey: .email)
        try container.encodeIfPresent(image, forKey: .image)
        try container.encodeIfPresent(bio, forKey: .bio)
        try container.encodeIfPresent(location, forKey: .location)
        try container.encodeIfPresent(backgroundImage, forKey: .backgroundImage)
        try container.encodeIfPresent(galleryImages, forKey: .galleryImages)
        try container.encodeIfPresent(isSubscribed, forKey: .isSubscribed)
        try container.encodeIfPresent(subscriptionTier, forKey: .subscriptionTier)
        try container.encodeIfPresent(verificationStatus, forKey: .verificationStatus)
        try container.encodeIfPresent(stripeConnectAccountId, forKey: .stripeConnectAccountId)
        try container.encodeIfPresent(stripeConnectOnboardingComplete, forKey: .stripeConnectOnboardingComplete)
        try container.encodeIfPresent(stripeConnectChargesEnabled, forKey: .stripeConnectChargesEnabled)
        try container.encodeIfPresent(followingIds, forKey: .followingIds)
        try container.encodeIfPresent(followerIds, forKey: .followerIds)
        try container.encodeIfPresent(managedListings, forKey: .managedListings)
        try container.encodeIfPresent(role, forKey: .role)
        try container.encodeIfPresent(createdAt, forKey: .createdAt)
    }

    // Convenience computed properties
    var isVerified: Bool {
        verificationStatus == .verified
    }

    // Convenience initializer for previews
    init(
        id: String,
        name: String? = nil,
        email: String? = nil,
        image: String? = nil,
        bio: String? = nil,
        location: String? = nil,
        role: String? = nil,
        isVerified: Bool = false
    ) {
        self.id = id
        self.name = name
        self.email = email
        self.image = image
        self.bio = bio
        self.location = location
        self.backgroundImage = nil
        self.galleryImages = nil
        self.isSubscribed = nil
        self.subscriptionTier = nil
        self.verificationStatus = isVerified ? .verified : .none
        self.stripeConnectAccountId = nil
        self.stripeConnectOnboardingComplete = nil
        self.stripeConnectChargesEnabled = nil
        self.followingIds = nil
        self.followerIds = nil
        self.managedListings = nil
        self.role = role
        self.createdAt = nil
    }
}

enum VerificationStatus: String, Codable {
    case unverified = "none"
    case pending, verified, rejected
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
    let location: String?
    let bio: String?
    let image: String?
    let jobTitle: String?
    let isOwnerManager: Bool?
    let selectedListing: String?
    let selectedServices: [String]?
    let listingCategory: String?
    let listingTitle: String?
    let listingDescription: String?
}

struct CheckEmailResponse: Codable {
    let exists: Bool
}
