import UIKit

/// Centralized haptic feedback so every "feel" choice in the app comes from
/// the same vocabulary. Calling sites describe intent, not raw style values.
enum Haptics {
    /// Fired the moment a tap registers — buttons, chips, toggles.
    static func tap() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    /// A more substantial confirmation — selecting a plan, picking a date,
    /// liking a post. Use when the action commits to something.
    static func confirm() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    /// Heavier punch — irreversible / high-stakes commits like booking
    /// success or account deletion confirmations.
    static func impact() {
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
    }

    /// Discrete tick for picker / segmented selection changes (no commit).
    static func selection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }

    /// Result-flavored notifications — booking confirmed, error toast, etc.
    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    static func warning() {
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
    }

    static func error() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }
}
