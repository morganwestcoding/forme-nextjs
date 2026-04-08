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

    // Modal presentation state
    @Published var showingInbox = false
    @Published var showingNotifications = false
    @Published var showingCreateMenu = false
    @Published var showingSettings = false
    @Published var showingProfile = false

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
