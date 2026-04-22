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
    @Published var showingSettings = false
    @Published var showingProfile = false
    @Published var showingFavorites = false

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
