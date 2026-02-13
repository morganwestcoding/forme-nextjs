import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        ZStack(alignment: .bottom) {
            Group {
                switch appState.selectedTab {
                case .home:
                    NavigationStack { HomeView() }
                case .search:
                    NavigationStack { SearchView() }
                case .bookings:
                    NavigationStack { BookingsView() }
                case .messages:
                    NavigationStack { MessagesListView() }
                case .profile:
                    NavigationStack { ProfileView() }
                }
            }
            .padding(.bottom, 56)

            ForMeTabBar(selectedTab: $appState.selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - Custom Tab Bar

private struct ForMeTabBar: View {
    @Binding var selectedTab: AppState.Tab

    private let tabs: [(tab: AppState.Tab, label: String, icon: String, activeIcon: String)] = [
        (.home, "Discover", "house", "house.fill"),
        (.search, "Search", "magnifyingglass", "magnifyingglass"),
        (.bookings, "Bookings", "calendar", "calendar"),
        (.messages, "Inbox", "bubble.left", "bubble.left.fill"),
        (.profile, "Profile", "person", "person.fill"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Top border matching PageSearch border style
            Rectangle()
                .fill(Color(hex: "D6D3D1").opacity(0.5))
                .frame(height: 0.5)

            HStack(spacing: 0) {
                ForEach(tabs, id: \.tab) { item in
                    let isActive = selectedTab == item.tab

                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                            selectedTab = item.tab
                        }
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: isActive ? item.activeIcon : item.icon)
                                .font(.system(size: 18, weight: isActive ? .medium : .regular))
                                .frame(height: 22)

                            Text(item.label)
                                .font(.system(size: 10, weight: isActive ? .semibold : .regular))
                        }
                        .foregroundStyle(isActive ? ForMe.textPrimary : Color(hex: "A8A29E"))
                        .opacity(isActive ? 1.0 : 0.5)
                        .frame(maxWidth: .infinity)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.top, 8)
            .padding(.bottom, 28)
        }
        .background(
            Color(hex: "F7F7F6").opacity(0.95)
                .background(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: -1)
                .ignoresSafeArea()
        )
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppState())
        .environmentObject(AuthViewModel())
}
