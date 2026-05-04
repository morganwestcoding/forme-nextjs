import SwiftUI
import WebKit

/// Stripe Connect onboarding for an Academy. Mirrors `StripeConnectView` but
/// scoped per-academy and admin-only. There's no academy "dashboard" endpoint,
/// so we surface status + onboarding only. Web routes accept mobile auth via
/// the bearer token (Phase 11 patch).
struct AcademyStripeConnectView: View {
    let academy: Academy

    @Environment(\.dismiss) private var dismiss

    @State private var status: StripeConnectStatus?
    @State private var isLoading = false
    @State private var error: String?
    @State private var hostedURL: HostedURL?

    private struct HostedURL: Identifiable {
        let id = UUID()
        let url: URL
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: ForMe.space5) {
                    header
                    statusCard
                    actionButton
                    if let error {
                        Text(error)
                            .font(ForMe.font(.medium, size: 12))
                            .foregroundColor(Color(hex: "F43F5E"))
                            .multilineTextAlignment(.leading)
                    }
                }
                .padding(.horizontal, ForMe.space5)
                .padding(.top, ForMe.space4)
                .padding(.bottom, ForMe.space8)
            }
            .background(ForMe.background)
            .navigationTitle("Academy payouts")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                        .foregroundColor(ForMe.textPrimary)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await load() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(ForMe.textPrimary)
                    }
                    .disabled(isLoading)
                }
            }
            .task { await load() }
            .sheet(item: $hostedURL) { hosted in
                AcademyStripeWebSheet(
                    url: hosted.url,
                    onFinished: { didComplete in
                        hostedURL = nil
                        if didComplete {
                            Task { await load() }
                        }
                    }
                )
            }
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(academy.name)
                .font(ForMe.font(.bold, size: 20))
                .foregroundColor(ForMe.textPrimary)
            Text("Set up a Stripe-managed account so this academy can receive transfers from booking revenue.")
                .font(ForMe.font(.regular, size: 13))
                .foregroundColor(ForMe.textSecondary)
        }
    }

    private var statusCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                Circle()
                    .fill(statusDot)
                    .frame(width: 10, height: 10)
                Text(statusHeadline)
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
            }

            if let status {
                VStack(alignment: .leading, spacing: 8) {
                    statusRow(label: "Account", isOn: status.hasAccount)
                    statusRow(label: "Onboarding complete", isOn: status.onboardingComplete)
                    statusRow(label: "Charges enabled", isOn: status.chargesEnabled)
                    statusRow(label: "Payouts enabled", isOn: status.payoutsEnabled)
                }
            } else if isLoading {
                ProgressView().padding(.vertical, 4)
            }
        }
        .padding(ForMe.space4)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    private func statusRow(label: String, isOn: Bool) -> some View {
        HStack(spacing: 8) {
            Image(systemName: isOn ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 14))
                .foregroundColor(isOn ? ForMe.statusConfirmed : ForMe.stone300)
            Text(label)
                .font(ForMe.font(.regular, size: 13))
                .foregroundColor(isOn ? ForMe.textPrimary : ForMe.textTertiary)
            Spacer()
        }
    }

    private var actionButton: some View {
        Button {
            Task { await openOnboarding() }
        } label: {
            Text(primaryCTALabel)
                .font(ForMe.font(.semibold, size: 15))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(ForMe.stone900)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(isLoading)
    }

    // MARK: - Computed

    private var statusDot: Color {
        guard let status else { return ForMe.stone300 }
        if status.isFullyOnboarded { return ForMe.statusConfirmed }
        if status.hasAccount { return ForMe.statusPending }
        return ForMe.stone300
    }

    private var statusHeadline: String {
        guard let status else { return "Loading…" }
        if status.isFullyOnboarded { return "Active — ready for payouts" }
        if status.hasAccount { return "Setup incomplete" }
        return "Not connected"
    }

    private var primaryCTALabel: String {
        guard let status else { return "Set up payouts" }
        if status.isFullyOnboarded { return "Manage payout settings" }
        if status.hasAccount { return "Continue setup" }
        return "Set up payouts"
    }

    // MARK: - Actions

    private func load() async {
        isLoading = true
        error = nil
        do {
            status = try await APIService.shared.getAcademyStripeConnectStatus(academyId: academy.id)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    private func openOnboarding() async {
        isLoading = true
        error = nil
        do {
            let response = try await APIService.shared.createAcademyStripeConnectOnboarding(academyId: academy.id)
            if let url = URL(string: response.url) { hostedURL = HostedURL(url: url) }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - Web sheet (academy variant)
//
// Mirrors `StripeConnectView`'s private web sheet. The redirect URL on the web
// side is `/admin/academies/{id}?stripe_connect=success|refresh`; we only key
// on the `stripe_connect=` query so the path doesn't matter.

private struct AcademyStripeWebSheet: View {
    let url: URL
    let onFinished: (Bool) -> Void

    @State private var didComplete = false

    var body: some View {
        NavigationStack {
            AcademyStripeWebView(url: url) { redirectURL in
                let str = redirectURL.absoluteString
                if str.contains("stripe_connect=success") {
                    didComplete = true
                    onFinished(true)
                } else if str.contains("stripe_connect=refresh") {
                    onFinished(false)
                }
            }
            .ignoresSafeArea(edges: .bottom)
            .navigationTitle("Set up payouts")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") { onFinished(didComplete) }
                        .foregroundColor(ForMe.textPrimary)
                }
            }
        }
    }
}

private struct AcademyStripeWebView: UIViewRepresentable {
    let url: URL
    let onRedirect: (URL) -> Void

    func makeCoordinator() -> Coordinator { Coordinator(onRedirect: onRedirect) }

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKNavigationDelegate {
        let onRedirect: (URL) -> Void
        init(onRedirect: @escaping (URL) -> Void) { self.onRedirect = onRedirect }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url,
               url.absoluteString.contains("stripe_connect=") {
                onRedirect(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }
    }
}
