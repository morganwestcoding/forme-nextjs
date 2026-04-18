import SwiftUI

@main
struct ForMeSizzleApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var authViewModel = AuthViewModel()
    @AppStorage("isDarkMode") private var isDarkMode = false

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(authViewModel)
                .preferredColorScheme(isDarkMode ? .dark : .light)
        }
    }
}
