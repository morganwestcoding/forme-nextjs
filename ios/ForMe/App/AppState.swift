import SwiftUI

@MainActor
class AppState: ObservableObject {
    enum Tab: Int, CaseIterable {
        case home = 0
        case search
        case bookings
        case messages
        case profile
    }

    @Published var selectedTab: Tab = .home
    @Published var showingListingDetail: Listing?
    @Published var showingUserProfile: User?
    @Published var navigationPath = NavigationPath()

    func resetNavigation() {
        navigationPath = NavigationPath()
        showingListingDetail = nil
        showingUserProfile = nil
    }

    func switchToTab(_ tab: Tab) {
        selectedTab = tab
    }
}
