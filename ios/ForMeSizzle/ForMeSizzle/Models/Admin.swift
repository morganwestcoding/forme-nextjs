import Foundation

// MARK: - Admin (matches /api/admin/* responses)

/// KPI snapshot for the admin dashboard. Mirrors `getAdminStats` server action.
struct AdminStats: Codable, Hashable {
    let totalUsers: Int
    let activeListings: Int
    let reservationsThisMonth: Int
    let revenueThisMonth: Double
    let pendingVerifications: Int
    let activeDisputes: Int
    let activeSubscribers: Int
}

/// One pending-verification user. Returned by GET /api/admin/verifications.
struct AdminVerification: Codable, Identifiable, Hashable {
    let id: String
    let name: String?
    let email: String?
    let image: String?
    let licensingImage: String?
    let createdAt: Date
    let userType: String?
    let location: String?
}

/// One dispute row, enriched with the related reservation summary. Amounts
/// are in cents (Stripe-native), matching the dispute model.
struct AdminDispute: Codable, Identifiable, Hashable {
    let id: String
    let status: String        // needs_response | under_review | won | lost
    let amount: Int           // cents
    let currency: String
    let reason: String?
    let reservationId: String?
    let serviceName: String?
    let listingTitle: String?
    let customerName: String?
    let customerEmail: String?
    let createdAt: Date
}

/// One row in the admin user list. Same shape the SSR /admin/users page renders.
struct AdminUserSummary: Codable, Identifiable, Hashable {
    let id: String
    let name: String?
    let email: String?
    let image: String?
    let role: String
    let subscriptionTier: String?
    let isSubscribed: Bool
    let verificationStatus: String?
    let createdAt: Date
}

// MARK: - Wrappers

struct AdminVerificationsResponse: Codable {
    let users: [AdminVerification]
}

struct AdminDisputesResponse: Codable {
    let disputes: [AdminDispute]
}

struct AdminUsersResponse: Codable {
    let users: [AdminUserSummary]
    let total: Int
    let page: Int
    let pageSize: Int
}

// MARK: - Mutation responses

struct VerificationDecisionResponse: Codable {
    let ok: Bool
    let action: String
}

struct UserSuspendResponse: Codable {
    let ok: Bool
    let userId: String
    let role: String
}
