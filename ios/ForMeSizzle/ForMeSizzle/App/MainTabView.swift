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
            .padding(.bottom, 70)

            ForMeTabBar(selectedTab: $appState.selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - Custom Tab Bar

private struct ForMeTabBar: View {
    @Binding var selectedTab: AppState.Tab
    @Namespace private var tabNamespace

    private let tabs: [(tab: AppState.Tab, label: String, icon: String, activeIcon: String)] = [
        (.home, "Discover", "house", "house.fill"),
        (.search, "Search", "magnifyingglass", "magnifyingglass"),
        (.bookings, "Bookings", "calendar", "calendar"),
        (.messages, "Inbox", "bubble.left", "bubble.left.fill"),
        (.profile, "Profile", "person", "person.fill"),
    ]

    var body: some View {
        HStack(spacing: 4) {
            ForEach(tabs, id: \.tab) { item in
                let isActive = selectedTab == item.tab

                Button {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                        selectedTab = item.tab
                    }
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: isActive ? item.activeIcon : item.icon)
                            .font(.system(size: 18, weight: isActive ? .semibold : .medium))
                            .foregroundColor(isActive ? ForMe.accent : ForMe.textTertiary)

                        Text(item.label)
                            .font(.system(size: 9, weight: .medium))
                            .foregroundColor(isActive ? ForMe.accent : ForMe.textTertiary)
                    }
                    .frame(width: 58, height: 44)
                    .background(
                        isActive
                            ? ForMe.accent.opacity(0.1)
                            : Color.clear
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .contentShape(Rectangle())
                }
                .buttonStyle(TabButtonStyle())
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(ForMe.surface)
                .shadow(color: .black.opacity(0.12), radius: 20, x: 0, y: 4)
        )
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }
}

private struct TabButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppState())
        .environmentObject(AuthViewModel())
}
