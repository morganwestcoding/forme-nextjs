import SwiftUI
import SafariServices

/// Wraps SFSafariViewController to show Stripe's hosted checkout page
struct StripeCheckoutView: UIViewControllerRepresentable {
    let url: URL
    let onComplete: () -> Void

    func makeUIViewController(context: Context) -> SFSafariViewController {
        let config = SFSafariViewController.Configuration()
        config.entersReaderIfAvailable = false
        config.barCollapsingEnabled = false

        let safari = SFSafariViewController(url: url, configuration: config)
        safari.preferredBarTintColor = UIColor(ForMe.background)
        safari.preferredControlTintColor = UIColor(ForMe.textPrimary)
        safari.dismissButtonStyle = .close
        safari.delegate = context.coordinator
        return safari
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onComplete: onComplete)
    }

    class Coordinator: NSObject, SFSafariViewControllerDelegate {
        let onComplete: () -> Void

        init(onComplete: @escaping () -> Void) {
            self.onComplete = onComplete
        }

        func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
            // User closed the checkout — they may have completed payment
            onComplete()
        }
    }
}

#Preview {
    StripeCheckoutView(url: URL(string: "https://checkout.stripe.com/test")!) {
        print("Checkout complete")
    }
}
