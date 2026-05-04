import Foundation

// MARK: - Team Pay (matches /api/team/pay/* endpoints)

/// Snapshot of an employee's earnings, fees, and payouts. Mirrors
/// GET /api/team/pay/balance.
struct PayBalance: Codable, Hashable {
    let totalRevenue: Double
    let grossEarnings: Double
    let commissionTaken: Double
    let totalRentalFees: Double
    let pendingRentalFees: Double
    let totalPaidOut: Double
    let totalPendingPayouts: Double
    let availableBalance: Double
    let agreementType: String?
}

/// One billing period for a chair-rental employee. Returned by
/// GET /api/team/pay/periods.
struct PayPeriod: Codable, Identifiable, Hashable {
    let id: String
    let periodStart: Date
    let periodEnd: Date
    let feeAmount: Double
    let status: String   // "pending" | "charged" | "waived"
    let waivedAt: Date?
    let waivedReason: String?
}

/// One payout request / completed transfer. Returned by
/// GET /api/team/pay/payout.
struct Payout: Codable, Identifiable, Hashable {
    let id: String
    let amount: Double
    let status: String   // "pending" | "approved" | "processing" | "completed" | "denied"
    let note: String?
    let requestedAt: Date
    let processedAt: Date?
}

// MARK: - Wrappers

struct PayAgreementResponse: Codable {
    let agreement: TeamPayAgreement?
}

struct PayPeriodsResponse: Codable {
    let periods: [PayPeriod]
}

struct PayoutsResponse: Codable {
    let payouts: [Payout]
}

// MARK: - Requests

struct PayAgreementRequest: Codable {
    let employeeId: String
    let type: String                 // "commission" | "chair_rental"
    let splitPercent: Double?
    let rentalAmount: Double?
    let rentalFrequency: String?     // "daily" | "weekly" | "monthly"
    let autoApprovePayout: Bool
}

struct RequestPayoutRequest: Codable {
    let employeeId: String
    let amount: Double
    let note: String?
}

struct PayoutDecideRequest: Codable {
    let payoutId: String
    let action: String   // "approve" | "deny"
    let note: String?
}

struct PayPeriodActionRequest: Codable {
    let periodId: String
    let action: String   // "waive" | "charge"
    let reason: String?
}

struct GeneratePayPeriodRequest: Codable {
    let employeeId: String
}

// MARK: - Mutation responses

struct PayoutCreateResponse: Codable {
    let id: String
    let status: String
    let amount: Double
}

struct PayoutDecideResponse: Codable {
    let status: String
    let transferId: String?
}

struct PayPeriodActionResponse: Codable {
    let status: String
}
