import SwiftUI

// MARK: - Subscription page (mirrors web SubscriptionClient.tsx)
//
// Renders the same plan selector the web uses, with:
//   • billing toggle (monthly / yearly)
//   • current-plan management card when already subscribed
//   • three plan cards — Bronze (free), Gold (popular, dark-inverted),
//     Platinum — each with a feature list and CTA
//   • cancel + change-plan confirmation sheets
// Paid upgrades open Stripe Checkout inside an ASWebAuthenticationSession;
// the server's ios-return route bounces back via formesizzle:// so the
// auth session dismisses itself. See SubscriptionViewModel for the mechanics.

struct SubscriptionView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = SubscriptionViewModel()

    /// When true, we render the "Choose Your Plan" onboarding variant
    /// (step indicator + celebration on success + Continue routing).
    var isOnboarding: Bool = false
    var onComplete: (() -> Void)? = nil

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.showCelebration {
                    CelebrationView(
                        userName: authViewModel.currentUser?.name?.split(separator: " ").first.map(String.init)
                    ) {
                        viewModel.showCelebration = false
                        if isOnboarding {
                            onComplete?()
                            dismiss()
                        }
                    }
                } else if viewModel.isLoading && viewModel.currentUser == nil {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(ForMe.background)
                } else {
                    content
                }
            }
            .background(ForMe.background)
            .navigationTitle(isOnboarding ? "Choose Plan" : "Subscription")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
            .task {
                await viewModel.load(seed: authViewModel.currentUser)
            }
            .sheet(isPresented: $viewModel.showCancelConfirm) {
                CancelConfirmSheet(viewModel: viewModel)
                    .presentationDetents([.medium])
            }
            .sheet(isPresented: Binding(
                get: { viewModel.pendingPlanChange != nil },
                set: { if !$0 { viewModel.pendingPlanChange = nil } }
            )) {
                ChangePlanConfirmSheet(viewModel: viewModel)
                    .presentationDetents([.medium])
            }
            .alert("Something went wrong",
                   isPresented: Binding(
                    get: { viewModel.error != nil },
                    set: { if !$0 { viewModel.error = nil } }
                   )
            ) {
                Button("OK") { viewModel.error = nil }
            } message: {
                Text(viewModel.error ?? "")
            }
            .alert(viewModel.successMessage ?? "",
                   isPresented: Binding(
                    get: { viewModel.successMessage != nil },
                    set: { if !$0 { viewModel.successMessage = nil } }
                   )
            ) {
                Button("OK") { viewModel.successMessage = nil }
            }
        }
    }

    @ViewBuilder
    private var content: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                header
                if viewModel.isActiveSubscriber, !isOnboarding {
                    currentPlanCard
                }
                billingToggle
                planCards
                termsFooter
                featureComparison
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            if isOnboarding {
                Text("Final step")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(ForMe.stone400)
            }
            Text(isOnboarding ? "Choose Your Plan" : "Subscription")
                .font(.system(size: 26, weight: .bold))
                .foregroundColor(ForMe.textPrimary)
                .tracking(-0.4)
            Group {
                if isOnboarding {
                    Text("Start free, upgrade as you grow")
                } else {
                    Text("You're on ")
                        .foregroundColor(ForMe.stone400)
                    + Text(cleanTierLabel(viewModel.currentUser?.subscriptionTier))
                        .foregroundColor(ForMe.textPrimary)
                        .fontWeight(.semibold)
                    + Text(". Change plans anytime.")
                        .foregroundColor(ForMe.stone400)
                }
            }
            .font(.system(size: 14))
            .foregroundColor(ForMe.stone400)
        }
    }

    private var currentPlanCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text("CURRENT PLAN")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(0.8)
                    .foregroundColor(ForMe.stone400)
                Text(viewModel.currentPlan.displayName)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(ForMe.textPrimary)

                let status = viewModel.currentUser?.subscriptionStatus ?? ""
                let endRaw = viewModel.currentUser?.currentPeriodEnd
                let renews = status == "active" ? "Renews" : "Access until"
                if let endRaw, let formatted = formatDate(endRaw) {
                    Text("\(renews) \(formatted)")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone500)
                }
                if let interval = viewModel.currentUser?.subscriptionBillingInterval {
                    Text("Billed \(interval == "year" ? "yearly" : "monthly")")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone500)
                }
            }

            HStack(spacing: 8) {
                Button { viewModel.openBillingPortal() } label: {
                    Text("Billing & Invoices")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(ForMe.stone600)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(ForMe.inputBg)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(ForMe.border, lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)

                Button { viewModel.showCancelConfirm = true } label: {
                    Text("Cancel Plan")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.red)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(Color.red.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(Color.red.opacity(0.2), lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)
                Spacer(minLength: 0)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
    }

    private var billingToggle: some View {
        HStack(spacing: 8) {
            ForEach(BillingInterval.allCases, id: \.self) { interval in
                Button {
                    withAnimation(.easeOut(duration: 0.18)) { viewModel.billing = interval }
                } label: {
                    Text(interval.displayName)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(viewModel.billing == interval ? .white : ForMe.stone500)
                        .padding(.horizontal, 18)
                        .padding(.vertical, 9)
                        .background(
                            Capsule().fill(
                                viewModel.billing == interval
                                    ? LinearGradient(colors: [ForMe.stone800, Color.black],
                                                     startPoint: .topLeading, endPoint: .bottomTrailing)
                                    : LinearGradient(colors: [ForMe.stone50, ForMe.stone50],
                                                     startPoint: .top, endPoint: .bottom)
                            )
                        )
                        .overlay(
                            Capsule()
                                .stroke(ForMe.border.opacity(viewModel.billing == interval ? 0 : 0.8), lineWidth: 1)
                        )
                        .shadow(color: viewModel.billing == interval ? .black.opacity(0.25) : .clear,
                                radius: 3, x: 0, y: 1)
                }
                .buttonStyle(.plain)
            }
            Spacer(minLength: 0)
        }
    }

    private var planCards: some View {
        VStack(spacing: 14) {
            ForEach(SubscriptionPlan.allCases, id: \.self) { plan in
                PlanCard(plan: plan, viewModel: viewModel, isOnboarding: isOnboarding)
            }
        }
    }

    private var termsFooter: some View {
        HStack {
            Spacer()
            Text("By selecting a plan, you agree to our Terms & Privacy Policy.")
                .font(.system(size: 11))
                .foregroundColor(ForMe.stone400)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(.vertical, 8)
    }

    private var featureComparison: some View {
        VStack(alignment: .leading, spacing: 14) {
            Rectangle()
                .fill(ForMe.border)
                .frame(height: 1)
                .padding(.vertical, 8)
            Text("Feature Comparison")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            FeatureComparisonTable()
        }
    }

    // MARK: - Helpers

    private func cleanTierLabel(_ raw: String?) -> String {
        let stripped = (raw ?? "Freemium").replacingOccurrences(
            of: #"\s*\(.*\)\s*$"#, with: "", options: .regularExpression
        ).trimmingCharacters(in: .whitespaces)
        let normalized = stripped.lowercased() == "bronze" ? "Freemium" : stripped
        return normalized.prefix(1).uppercased() + normalized.dropFirst()
    }

    private func formatDate(_ iso: String) -> String? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: iso) {
            return date.formatted(date: .abbreviated, time: .omitted)
        }
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: iso) {
            return date.formatted(date: .abbreviated, time: .omitted)
        }
        return nil
    }
}

// MARK: - Plan card

private struct PlanCard: View {
    let plan: SubscriptionPlan
    @ObservedObject var viewModel: SubscriptionViewModel
    let isOnboarding: Bool

    private var isCurrent: Bool { viewModel.currentPlan == plan }
    private var isPopular: Bool { plan == .gold }

    private var ctaLabel: String {
        if isCurrent { return "Current Plan" }
        if viewModel.isActiveSubscriber, plan != .bronze {
            return "Switch to \(plan.displayName)"
        }
        if plan == .bronze, viewModel.isActiveSubscriber {
            return "Downgrade"
        }
        return plan.ctaLabel
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            if let badge = plan.badge {
                HStack {
                    Text(badge.uppercased())
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.8)
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(ForMe.stone700))
                    Spacer()
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(plan.displayName)
                    .font(.system(size: 12))
                    .foregroundColor(isPopular ? ForMe.stone400 : ForMe.stone400)
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(viewModel.priceDisplay(for: plan))
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundColor(primaryTextColor)
                        .tracking(-0.6)
                    if plan.monthlyPrice > 0 {
                        Text("/\(viewModel.billing.suffix)")
                            .font(.system(size: 13))
                            .foregroundColor(ForMe.stone400)
                    }
                }
                if viewModel.billing == .yearly, plan.monthlyPrice > 0 {
                    Text("Save $\(viewModel.yearlySavings(for: plan))/yr")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.green)
                }
                Text(plan.feesLabel)
                    .font(.system(size: 11))
                    .foregroundColor(isPopular ? ForMe.stone400 : ForMe.stone500)
                    .padding(.top, 4)
            }

            VStack(alignment: .leading, spacing: 10) {
                ForEach(plan.features, id: \.self) { feature in
                    HStack(alignment: .firstTextBaseline, spacing: 10) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 13))
                            .foregroundColor(isPopular ? ForMe.stone400 : ForMe.stone400)
                        Text(feature)
                            .font(.system(size: 13))
                            .foregroundColor(isPopular ? ForMe.stone300 : ForMe.stone500)
                        Spacer(minLength: 0)
                    }
                }
            }

            Button {
                viewModel.selectPlan(plan, isOnboarding: isOnboarding)
            } label: {
                HStack(spacing: 6) {
                    if viewModel.isSaving {
                        ProgressView().tint(ctaForeground)
                    } else {
                        if isCurrent {
                            Image(systemName: "checkmark.circle.fill").font(.system(size: 12, weight: .semibold))
                        }
                        Text(viewModel.isSaving ? "Processing…" : ctaLabel)
                            .font(.system(size: 14, weight: .semibold))
                        if !isCurrent {
                            Image(systemName: "arrow.right").font(.system(size: 11, weight: .semibold))
                        }
                    }
                }
                .foregroundColor(ctaForeground)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 13)
                .background(ctaBackground)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(isCurrent ? ForMe.border : Color.clear, lineWidth: 1)
                )
                .shadow(color: isCurrent ? .clear : .black.opacity(0.12), radius: 4, x: 0, y: 1)
            }
            .buttonStyle(.plain)
            .disabled(isCurrent || viewModel.isSaving)
            .opacity((isCurrent || viewModel.isSaving) ? 0.9 : 1)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(cardBorder, lineWidth: 1)
        )
        .shadow(color: isPopular ? .black.opacity(0.25) : .clear, radius: 12, x: 0, y: 4)
    }

    private var primaryTextColor: Color {
        isPopular ? .white : ForMe.textPrimary
    }

    private var cardBackground: Color {
        isPopular ? ForMe.stone900 : ForMe.surface
    }

    private var cardBorder: Color {
        isPopular ? ForMe.stone800 : ForMe.border
    }

    private var ctaBackground: Color {
        if isCurrent {
            return ForMe.inputBg
        }
        return isPopular ? .white : ForMe.stone900
    }

    private var ctaForeground: Color {
        if isCurrent { return ForMe.stone400 }
        return isPopular ? ForMe.stone900 : .white
    }
}

// MARK: - Cancel confirmation

private struct CancelConfirmSheet: View {
    @ObservedObject var viewModel: SubscriptionViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                ZStack {
                    Circle().fill(Color.red.opacity(0.1)).frame(width: 40, height: 40)
                    Image(systemName: "xmark").foregroundColor(.red).font(.system(size: 14, weight: .bold))
                }
                Text("Cancel Subscription?")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
            }

            Text("Your \(viewModel.currentPlan.displayName) plan will remain active until the end of your current billing period. After that you'll be downgraded to Freemium and lose access to premium features.")
                .font(.system(size: 13))
                .foregroundColor(ForMe.stone500)

            Spacer()

            HStack(spacing: 10) {
                Button {
                    dismiss()
                } label: {
                    Text("Keep Plan")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.stone600)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(ForMe.inputBg)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(ForMe.border, lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)

                Button {
                    viewModel.confirmCancel()
                    dismiss()
                } label: {
                    Text(viewModel.isSaving ? "Cancelling…" : "Cancel Subscription")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.red)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .buttonStyle(.plain)
                .disabled(viewModel.isSaving)
            }
        }
        .padding(24)
        .background(ForMe.background)
    }
}

// MARK: - Change plan confirmation

private struct ChangePlanConfirmSheet: View {
    @ObservedObject var viewModel: SubscriptionViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Change Plan")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            if let pending = viewModel.pendingPlanChange {
                Text("Switch from ")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone500)
                + Text(viewModel.currentPlan.displayName)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                + Text(" to ")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone500)
                + Text("\(pending.plan.displayName) (\(pending.interval.displayName.lowercased()))")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                + Text("?")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone500)
            }

            Text("The price difference will be prorated to your current billing cycle. Your new plan starts immediately.")
                .font(.system(size: 13))
                .foregroundColor(ForMe.stone500)

            Spacer()

            HStack(spacing: 10) {
                Button { dismiss() } label: {
                    Text("Never Mind")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.stone600)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(ForMe.inputBg)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(ForMe.border, lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)

                Button {
                    viewModel.confirmPlanChange()
                    dismiss()
                } label: {
                    Text(viewModel.isSaving ? "Switching…" : "Confirm Switch")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(ForMe.stone900)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .buttonStyle(.plain)
                .disabled(viewModel.isSaving)
            }
        }
        .padding(24)
        .background(ForMe.background)
    }
}

// MARK: - Celebration (onboarding success)

private struct CelebrationView: View {
    let userName: String?
    let onContinue: () -> Void
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: "sparkles")
                .font(.system(size: 64, weight: .semibold))
                .foregroundColor(ForMe.stone900)
                .scaleEffect(appeared ? 1 : 0.6)
                .opacity(appeared ? 1 : 0)

            VStack(spacing: 8) {
                Text(userName.map { "Welcome, \($0)!" } ?? "You're all set!")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(ForMe.textPrimary)
                Text("Your subscription is active.")
                    .font(.system(size: 15))
                    .foregroundColor(ForMe.stone500)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 12)

            Spacer()

            Button(action: onContinue) {
                Text("Continue")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 24)
        }
        .padding(.vertical, 40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ForMe.background)
        .onAppear {
            withAnimation(.spring(response: 0.55, dampingFraction: 0.7)) {
                appeared = true
            }
        }
    }
}

// MARK: - Feature comparison table (mirrors web FeatureComparison.tsx)

private struct FeatureComparisonTable: View {
    private struct Row {
        let label: String
        let bronze: String
        let gold: String
        let platinum: String
    }

    private let rows: [Row] = [
        Row(label: "Platform access", bronze: "Full", gold: "Full", platinum: "Full"),
        Row(label: "Transaction fees", bronze: "7% / 5% / 3%", gold: "$0", platinum: "$0"),
        Row(label: "Analytics", bronze: "—", gold: "✓", platinum: "✓"),
        Row(label: "SEO tools", bronze: "—", gold: "✓", platinum: "✓"),
        Row(label: "Marketing credits", bronze: "—", gold: "—", platinum: "$200"),
        Row(label: "Marketplace promos", bronze: "—", gold: "—", platinum: "✓"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Feature")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("Freemium")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .frame(width: 72, alignment: .center)
                Text("Gold")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .frame(width: 60, alignment: .center)
                Text("Platinum")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .frame(width: 78, alignment: .center)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)

            ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
                Rectangle().fill(ForMe.border).frame(height: 1)
                HStack {
                    Text(row.label)
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text(row.bronze).font(.system(size: 13)).foregroundColor(ForMe.stone500)
                        .frame(width: 72, alignment: .center)
                    Text(row.gold).font(.system(size: 13)).foregroundColor(ForMe.stone500)
                        .frame(width: 60, alignment: .center)
                    Text(row.platinum).font(.system(size: 13)).foregroundColor(ForMe.stone500)
                        .frame(width: 78, alignment: .center)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
            }
        }
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
    }
}

#Preview {
    SubscriptionView()
        .environmentObject(AuthViewModel())
}
