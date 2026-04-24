import SwiftUI
import Combine

@MainActor
class AppState: ObservableObject {
    enum Tab: Int, CaseIterable {
        case home = 0
        case search
        case maps
        case bookings
        case shops
    }

    @Published var selectedTab: Tab = .home
    @Published var navigationPath = NavigationPath()

    // Set to true after a booking completes so BookingsView re-fetches
    // (with retries) when it next mounts, covering the Stripe-webhook
    // → reservation-row latency. BookingsView clears the flag on read.
    @Published var pendingBookingRefresh = false

    // Modal presentation state
    @Published var showingInbox = false
    @Published var showingNotifications = false
    @Published var showingCreateMenu = false
    @Published var showingPostFlow = false
    @Published var showingListingFlow = false
    @Published var showingShopFlow = false
    @Published var showingWorkerFlow = false
    @Published var showingProductFlow = false

    // Pre-selected context for Worker / Product flows — set by the create
    // menu's permission gate (matching web's "use the user's first listing /
    // shop") and read by the flow when it mounts. Nil means the flow must
    // pick one itself (e.g. via a chooser screen).
    @Published var workerFlowListingId: String?
    @Published var productFlowShopId: String?
    @Published var showingSettings = false
    @Published var showingProfile = false
    @Published var showingFavorites = false
    @Published var showingSubscription = false

    func resetNavigation() {
        navigationPath = NavigationPath()
    }

    func switchToTab(_ tab: Tab) {
        if selectedTab == tab {
            resetNavigation()
        }
        selectedTab = tab
    }
}
