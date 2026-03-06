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
            ForMeTabBar(selectedTab: $appState.selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - Custom Tab Bar

private struct ForMeTabBar: View {
    @Binding var selectedTab: AppState.Tab
    @Namespace private var tabNamespace

    private struct TabItem: Identifiable {
        let id: AppState.Tab
        let label: String
        let icon: String
        let activeIcon: String
        let isCustom: Bool

        init(_ tab: AppState.Tab, _ label: String, _ icon: String, _ activeIcon: String, isCustom: Bool = false) {
            self.id = tab; self.label = label; self.icon = icon; self.activeIcon = activeIcon; self.isCustom = isCustom
        }
    }

    private let tabs: [TabItem] = [
        TabItem(.home, "Discover", "TabDiscover", "TabDiscover", isCustom: true),
        TabItem(.search, "Search", "TabSearch", "TabSearch", isCustom: true),
        TabItem(.bookings, "Bookings", "TabBooking", "TabBooking", isCustom: true),
        TabItem(.messages, "Vendors", "TabVendors", "TabVendors", isCustom: true),
    ]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(tabs) { item in
                let isActive = selectedTab == item.id

                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                        selectedTab = item.id
                    }
                } label: {
                    VStack(spacing: 4) {
                        Group {
                            if item.isCustom {
                                Image(isActive ? item.activeIcon : item.icon)
                                    .renderingMode(.template)
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: 22, height: 22)
                            } else {
                                Image(systemName: isActive ? item.activeIcon : item.icon)
                                    .font(.system(size: 22, weight: isActive ? .semibold : .regular))
                            }
                        }
                        .foregroundColor(isActive ? ForMe.textPrimary : ForMe.textTertiary)

                        Text(item.label)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(isActive ? ForMe.textPrimary : ForMe.textTertiary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(isActive ? ForMe.textPrimary.opacity(0.08) : Color.clear)
                    )
                    .contentShape(Rectangle())
                }
                .buttonStyle(TabButtonStyle())
            }
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.1), radius: 16, x: 0, y: 4)
        )
        .fixedSize(horizontal: false, vertical: true)
        .padding(.horizontal, 16)
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
