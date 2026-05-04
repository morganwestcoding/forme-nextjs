import Foundation

struct StripeConnectStatus: Codable {
    let hasAccount: Bool
    let onboardingComplete: Bool
    let chargesEnabled: Bool
    let payoutsEnabled: Bool
    let accountId: String?

    /// True when the user can fully accept payouts. Used to decide whether
    /// to surface the onboarding CTA or the dashboard CTA.
    var isFullyOnboarded: Bool {
        hasAccount && onboardingComplete && chargesEnabled && payoutsEnabled
    }
}

struct StripeURLResponse: Codable {
    let url: String
}
