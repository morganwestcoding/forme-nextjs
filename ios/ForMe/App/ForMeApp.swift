import SwiftUI

@main
struct ForMeApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
                .environmentObject(appState)
        }
    }
}

class AppState: ObservableObject {
    @Published var selectedTab: Tab = .home
    @Published var isLoading: Bool = false

    enum Tab {
        case home, search, bookings, messages, profile
    }
}
