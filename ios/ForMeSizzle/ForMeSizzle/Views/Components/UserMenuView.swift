import SwiftUI

struct UserMenuView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    @State private var showLogoutConfirm = false

    private var user: User? { authViewModel.currentUser }

    private let menuItems: [(label: String, action: MenuAction)] = [
        ("Profile", .profile),
        ("Listings", .listings),
        ("Analytics", .analytics),
        ("Favorites", .favorites),
        ("Team", .team),
        ("Subscription", .subscription),
    ]

    enum MenuAction {
        case profile, listings, analytics, favorites, team, subscription
    }

    @ViewBuilder
    private func icon(for action: MenuAction) -> some View {
        switch action {
        case .profile:
            HugeIcon(paths: HugeIcon.userPaths, size: 20, color: ForMe.stone600, lineWidth: 1.5)
        case .listings:
            HugeIcon(paths: HugeIcon.gridViewPaths, size: 20, color: ForMe.stone600, lineWidth: 1.5)
        case .analytics:
            HugeIcon(paths: HugeIcon.analyticsUpPaths, size: 20, color: ForMe.stone600, lineWidth: 1.5)
        case .favorites:
            HugeIcon(paths: HugeIcon.favouritePaths, size: 20, color: ForMe.stone600, lineWidth: 1.5)
        case .team:
            HugeIcon(paths: HugeIcon.userMultiplePaths, size: 20, color: ForMe.stone600, lineWidth: 1.5)
        case .subscription:
            HugeIcon(paths: HugeIcon.creditCardPaths, size: 20, color: ForMe.stone600, lineWidth: 1.5)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Drag handle
            Capsule()
                .fill(ForMe.stone200)
                .frame(width: 36, height: 4)
                .padding(.top, ForMe.space4)

            // User header
            if let user = user {
                HStack(spacing: 14) {
                    DynamicAvatar(
                        name: user.name ?? "User",
                        imageUrl: user.image,
                        size: .medium
                    )
                    VStack(alignment: .leading, spacing: 2) {
                        Text(user.name ?? "User")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                        if let email = user.email {
                            Text(email)
                                .font(.system(size: 12))
                                .foregroundColor(ForMe.textTertiary)
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, ForMe.space6)
                .padding(.top, ForMe.space5)
                .padding(.bottom, ForMe.space4)
            }

            Divider()
                .padding(.horizontal, ForMe.space4)

            // Menu items
            VStack(spacing: 0) {
                ForEach(menuItems, id: \.label) { item in
                    Button {
                        handleAction(item.action)
                    } label: {
                        HStack(spacing: 14) {
                            icon(for: item.action)
                                .frame(width: 24)
                            Text(item.label)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(ForMe.textPrimary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(ForMe.stone300)
                        }
                        .padding(.horizontal, ForMe.space5)
                        .padding(.vertical, 14)
                    }
                    .buttonStyle(.plain)
                }
            }

            Divider()
                .padding(.horizontal, ForMe.space4)

            // Settings + logout
            Button {
                dismiss()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    appState.showingSettings = true
                }
            } label: {
                HStack(spacing: 14) {
                    Image(systemName: "gearshape")
                        .font(.system(size: 16))
                        .foregroundColor(ForMe.stone600)
                        .frame(width: 24)
                    Text("Settings")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.stone300)
                }
                .padding(.horizontal, ForMe.space6)
                .padding(.vertical, 14)
            }
            .buttonStyle(.plain)

            Button {
                showLogoutConfirm = true
            } label: {
                HStack(spacing: 14) {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                        .font(.system(size: 16))
                        .foregroundColor(ForMe.statusCancelled)
                        .frame(width: 24)
                    Text("Sign Out")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(ForMe.statusCancelled)
                    Spacer()
                }
                .padding(.horizontal, ForMe.space6)
                .padding(.vertical, 14)
            }
            .buttonStyle(.plain)

            Spacer()
        }
        .background(ForMe.background)
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.hidden)
        .confirmationDialog("Sign out?", isPresented: $showLogoutConfirm) {
            Button("Sign Out", role: .destructive) {
                Task {
                    await authViewModel.logout()
                    dismiss()
                }
            }
            Button("Cancel", role: .cancel) {}
        }
    }

    private func handleAction(_ action: MenuAction) {
        guard let userId = user?.id else { return }
        dismiss()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            if appState.selectedTab != .home { appState.selectedTab = .home }

            switch action {
            case .profile:
                appState.navigationPath.append(ProfileRoute(userId: userId))
            case .favorites:
                appState.showingFavorites = true
            case .listings:
                appState.navigationPath.append(BusinessRoute.properties)
            case .analytics:
                appState.navigationPath.append(BusinessRoute.analytics)
            case .team:
                appState.navigationPath.append(BusinessRoute.team)
            case .subscription:
                break // TODO
            }
        }
    }
}

// MARK: - Business Routes

enum BusinessRoute: Hashable {
    case properties, analytics, team
}

// MARK: - Profile Route (for navigation stack)

struct ProfileRoute: Hashable {
    let userId: String
}

#Preview {
    UserMenuView()
        .environmentObject(AuthViewModel())
        .environmentObject(AppState())
}
