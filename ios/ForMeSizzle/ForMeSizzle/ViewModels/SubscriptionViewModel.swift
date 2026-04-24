import SwiftUI
import Combine
import AuthenticationServices

// MARK: - SubscriptionViewModel
//
// Mirrors the web SubscriptionClient state machine.
//
// Paid plans (Gold / Platinum) require Stripe Checkout. We:
//   1. POST /subscription/checkout with platform: "ios" and get a hosted
//      checkout URL back.
//   2. Open that URL in an ASWebAuthenticationSession tied to the
//      `formesizzle` URL scheme — when Stripe redirects to the iOS bounce
//      endpoint, the server 302s to formesizzle://subscription-complete
//      and the auth session closes automatically.
//   3. Parse the final callback URL. On success, refresh the user so
//      subscriptionTier, isSubscribed, etc. reflect the new state.
//
// Bronze (free) is a plain backend write — no Stripe involved.

enum SubscriptionPlan: String, CaseIterable {
    case bronze
    case gold
    case platinum

    var displayName: String {
        switch self {
        case .bronze: return "Freemium"
        case .gold: return "Gold"
        case .platinum: return "Platinum"
        }
    }

    var monthlyPrice: Int {
        switch self {
        case .bronze: return 0
        case .gold: return 30
        case .platinum: return 100
        }
    }

    var yearlyPrice: Int {
        switch self {
        case .bronze: return 0
        case .gold: return 300
        case .platinum: return 1000
        }
    }

    var badge: String? {
        self == .gold ? "Most Popular" : nil
    }

    var features: [String] {
        switch self {
        case .bronze:
            return [
                "Full platform access",
                "Professional profile & storefront",
                "Marketing tools",
                "Video content posting",
                "Online booking",
                "Stripe payment processing",
            ]
        case .gold:
            return [
                "Everything in Freemium",
                "SEO tools",
                "Business analytics dashboard",
            ]
        case .platinum:
            return [
                "Everything in Gold",
                "$200 ForMe marketing credits",
                "Run promotions inside marketplace",
            ]
        }
    }

    var feesLabel: String {
        switch self {
        case .bronze: return "Tiered transaction fees (7% / 5% / 3%)"
        case .gold, .platinum: return "$0 transaction fees"
        }
    }

    var ctaLabel: String {
        switch self {
        case .bronze: return "Get Started"
        case .gold: return "Upgrade to Gold"
        case .platinum: return "Upgrade to Platinum"
        }
    }
}

enum BillingInterval: String, CaseIterable {
    case monthly, yearly

    var displayName: String {
        self == .monthly ? "Monthly" : "Yearly"
    }

    var suffix: String {
        self == .monthly ? "mo" : "yr"
    }
}

@MainActor
final class SubscriptionViewModel: NSObject, ObservableObject {
    @Published var billing: BillingInterval = .monthly
    @Published var currentUser: User?
    @Published var isLoading: Bool = false
    @Published var isSaving: Bool = false
    @Published var error: String?
    @Published var successMessage: String?
    @Published var showCelebration: Bool = false

    // Confirmation overlays
    @Published var showCancelConfirm: Bool = false
    @Published var pendingPlanChange: (plan: SubscriptionPlan, interval: BillingInterval)?

    var currentPlan: SubscriptionPlan {
        let raw = (currentUser?.subscriptionTier ?? "bronze").lowercased()
        if raw.contains("platinum") { return .platinum }
        if raw.contains("gold") { return .gold }
        return .bronze
    }

    var isActiveSubscriber: Bool {
        guard currentUser?.isSubscribed == true else { return false }
        let status = currentUser?.subscriptionStatus ?? ""
        return ["active", "trialing", "past_due"].contains(status)
    }

    // MARK: - Load

    func load(seed: User?) async {
        if let seed { currentUser = seed }
        isLoading = true
        defer { isLoading = false }
        do {
            currentUser = try await APIService.shared.getCurrentUser()
        } catch {
            // Silent — seeded user still works for rendering.
        }
    }

    // MARK: - Plan selection

    func selectPlan(_ plan: SubscriptionPlan, isOnboarding: Bool) {
        guard !isSaving else { return }
        // Switching between paid plans goes through the change-plan API
        // (Stripe proration) — surfaced as a confirmation overlay first.
        if isActiveSubscriber, plan != .bronze, plan != currentPlan {
            pendingPlanChange = (plan, billing)
            return
        }

        if plan == .bronze {
            if isActiveSubscriber {
                showCancelConfirm = true
                return
            }
            Task { await applyBronze(isOnboarding: isOnboarding) }
            return
        }

        Task { await startStripeCheckout(plan: plan, isOnboarding: isOnboarding) }
    }

    private func applyBronze(isOnboarding: Bool) async {
        isSaving = true
        defer { isSaving = false }
        do {
            let updated = try await APIService.shared.selectBronzePlan(interval: billing.rawValue)
            currentUser = updated
            if isOnboarding {
                showCelebration = true
            } else {
                successMessage = "Bronze plan selected"
            }
        } catch {
            self.error = "Failed to select Bronze: \(error.localizedDescription)"
        }
    }

    // MARK: - Stripe Checkout via ASWebAuthenticationSession

    private var authSession: ASWebAuthenticationSession?

    private func startStripeCheckout(plan: SubscriptionPlan, isOnboarding: Bool) async {
        isSaving = true
        defer { isSaving = false }
        do {
            let response = try await APIService.shared.subscriptionCheckout(
                planId: plan.rawValue,
                interval: billing.rawValue,
                isOnboarding: isOnboarding
            )
            guard let urlString = response.url, let url = URL(string: urlString) else {
                error = "Failed to start checkout"
                return
            }

            let callback = await withCheckedContinuation { (cont: CheckedContinuation<URL?, Never>) in
                let session = ASWebAuthenticationSession(
                    url: url,
                    callbackURLScheme: "formesizzle"
                ) { url, _ in
                    cont.resume(returning: url)
                }
                session.presentationContextProvider = self
                session.prefersEphemeralWebBrowserSession = false
                self.authSession = session
                session.start()
            }
            authSession = nil

            guard let callback else { return }  // user cancelled
            await handleStripeCallback(callback, isOnboarding: isOnboarding)
        } catch {
            self.error = "Checkout failed: \(error.localizedDescription)"
        }
    }

    private func handleStripeCallback(_ url: URL, isOnboarding: Bool) async {
        let comps = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let status = comps?.queryItems?.first(where: { $0.name == "status" })?.value
        let sessionId = comps?.queryItems?.first(where: { $0.name == "session_id" })?.value

        guard status == "success" else {
            if status == "cancelled" {
                error = "Checkout cancelled. You can try again or continue with Bronze."
            }
            return
        }

        // Confirm with the server so we pick up webhook state as fast as
        // possible (webhook may not have fired yet). Then refresh the user.
        if let sessionId = sessionId {
            _ = try? await APIService.shared.verifySubscription(sessionId: sessionId)
        }
        do {
            currentUser = try await APIService.shared.getCurrentUser()
        } catch {
            // Non-fatal — celebration still renders.
        }
        if isOnboarding {
            showCelebration = true
        } else {
            successMessage = "Subscription activated"
        }
    }

    // MARK: - Cancel / change / billing portal

    func confirmCancel() {
        guard !isSaving else { return }
        Task {
            isSaving = true
            defer { isSaving = false }
            do {
                let response = try await APIService.shared.cancelSubscription()
                showCancelConfirm = false
                if let end = response.currentPeriodEnd {
                    successMessage = "Cancelled. Access through \(formatDate(end))."
                } else {
                    successMessage = "Subscription cancelled."
                }
                currentUser = try await APIService.shared.getCurrentUser()
            } catch {
                self.error = "Failed to cancel: \(error.localizedDescription)"
            }
        }
    }

    func confirmPlanChange() {
        guard let pending = pendingPlanChange, !isSaving else { return }
        Task {
            isSaving = true
            defer { isSaving = false }
            do {
                let response = try await APIService.shared.changeSubscription(
                    planId: pending.plan.rawValue,
                    interval: pending.interval.rawValue
                )
                pendingPlanChange = nil
                successMessage = "Switched to \(response.plan ?? pending.plan.displayName)"
                currentUser = try await APIService.shared.getCurrentUser()
            } catch {
                self.error = "Failed to change plan: \(error.localizedDescription)"
            }
        }
    }

    private var pendingPortalTask: Task<Void, Never>?
    func openBillingPortal() {
        guard !isSaving else { return }
        pendingPortalTask?.cancel()
        pendingPortalTask = Task {
            isSaving = true
            defer { isSaving = false }
            do {
                let response = try await APIService.shared.openBillingPortal()
                guard let urlString = response.url, let url = URL(string: urlString) else {
                    error = "Failed to open billing portal"
                    return
                }
                await withCheckedContinuation { (cont: CheckedContinuation<Void, Never>) in
                    let session = ASWebAuthenticationSession(
                        url: url,
                        callbackURLScheme: "formesizzle"
                    ) { _, _ in cont.resume() }
                    session.presentationContextProvider = self
                    session.prefersEphemeralWebBrowserSession = false
                    self.authSession = session
                    session.start()
                }
                authSession = nil
                currentUser = try await APIService.shared.getCurrentUser()
            } catch {
                self.error = "Failed to open billing portal: \(error.localizedDescription)"
            }
        }
    }

    // MARK: - Helpers

    func priceDisplay(for plan: SubscriptionPlan) -> String {
        let price = billing == .monthly ? plan.monthlyPrice : plan.yearlyPrice
        return price == 0 ? "Free" : "$\(price)"
    }

    func yearlySavings(for plan: SubscriptionPlan) -> Int {
        plan.monthlyPrice * 12 - plan.yearlyPrice
    }

    private func formatDate(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: iso) {
            return date.formatted(date: .abbreviated, time: .omitted)
        }
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: iso) {
            return date.formatted(date: .abbreviated, time: .omitted)
        }
        return iso
    }
}

// MARK: - Web auth presentation

extension SubscriptionViewModel: ASWebAuthenticationPresentationContextProviding {
    nonisolated func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        // Find the current key window. The connected scenes API is the
        // supported iOS 13+ way to do this from a non-UIViewController.
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}
