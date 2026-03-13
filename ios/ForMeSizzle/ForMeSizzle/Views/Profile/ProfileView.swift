import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showSettings = false
    @State private var showEditProfile = false

    private var user: User? { authViewModel.currentUser }

    private var memberSince: String? {
        guard let date = user?.createdAt else { return nil }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yyyy"
        return formatter.string(from: date)
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // MARK: - Header
                ZStack(alignment: .bottom) {
                    ZStack {
                        if let bgUrl = user?.backgroundImage, let url = URL(string: bgUrl) {
                            AsyncImage(url: url) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                        .scaleEffect(1.05)
                                case .failure, .empty:
                                    profileHeaderGradient
                                @unknown default:
                                    profileHeaderGradient
                                }
                            }
                        } else {
                            profileHeaderGradient
                        }
                    }
                    .frame(height: 200)
                    .clipped()
                    .overlay(
                        LinearGradient(
                            stops: [
                                .init(color: .clear, location: 0.0),
                                .init(color: ForMe.background.opacity(0.4), location: 0.55),
                                .init(color: ForMe.background, location: 1.0)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )

                    // Avatar bleeds into content
                    VStack(spacing: 0) {
                        ZStack(alignment: .bottomTrailing) {
                            DynamicAvatar(
                                name: user?.name ?? "User",
                                imageUrl: user?.image,
                                size: .large
                            )
                            .shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)

                            if user?.verificationStatus == .verified {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(ForMe.textPrimary)
                                    .background(
                                        Circle()
                                            .fill(ForMe.background)
                                            .frame(width: 22, height: 22)
                                    )
                                    .offset(x: 2, y: 2)
                            }
                        }
                    }
                    .offset(y: 40)
                }
                .staggeredFadeIn(index: 0)

                Spacer().frame(height: 52)

                // MARK: - Identity
                VStack(spacing: 6) {
                    Text(user?.name ?? "User")
                        .font(.system(size: 26, weight: .bold))
                        .tracking(-0.5)
                        .foregroundColor(ForMe.textPrimary)

                    // Role + Location inline
                    HStack(spacing: 6) {
                        if let role = user?.role {
                            Text(role)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(ForMe.textSecondary)
                        }
                        if user?.role != nil && user?.location != nil {
                            Text("·")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(ForMe.textTertiary)
                        }
                        if let location = user?.location {
                            Text(location)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(ForMe.textTertiary)
                        }
                    }

                    Text("Barber & stylist based in Long Beach. 10+ years crafting fresh cuts and clean fades.")
                        .font(.system(size: 14))
                        .foregroundColor(ForMe.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(2)
                        .padding(.top, 4)
                        .padding(.horizontal, 32)
                }
                .staggeredFadeIn(index: 1)

                // MARK: - Actions
                HStack(spacing: 10) {
                    Button {
                        showEditProfile = true
                    } label: {
                        Text("Edit Profile")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 11)
                            .background(ForMe.surface)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .stroke(ForMe.border, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }

                    Button {} label: {
                        Text("Share")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 11)
                            .background(ForMe.surface)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .stroke(ForMe.border, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                }
                .padding(.top, 18)
                .padding(.horizontal, 16)
                .staggeredFadeIn(index: 2)

                // MARK: - Stats
                HStack(spacing: 0) {
                    ProfileStat(
                        value: "\(user?.followingIds?.count ?? 0)",
                        label: "Following"
                    )

                    ProfileStat(
                        value: "\(user?.followerIds?.count ?? 0)",
                        label: "Followers"
                    )

                    ProfileStat(
                        value: "5.0",
                        label: "Rating"
                    )
                }
                .padding(.top, 20)
                .padding(.bottom, 6)
                .padding(.horizontal, 16)
                .staggeredFadeIn(index: 3)

                // Divider
                Rectangle()
                    .fill(ForMe.borderLight)
                    .frame(height: 1)
                    .padding(.horizontal, 16)

                // MARK: - Activity
                VStack(alignment: .leading, spacing: 0) {
                    Text("Activity")
                        .font(.system(size: 12, weight: .semibold))
                        .tracking(0.8)
                        .textCase(.uppercase)
                        .foregroundColor(ForMe.textTertiary)
                        .padding(.horizontal, 16)
                        .padding(.top, 20)
                        .padding(.bottom, 10)

                    ProfileMenuRow(icon: "heart", title: "Favorites") {}
                    ProfileMenuRow(icon: "clock.arrow.circlepath", title: "Booking History") {}
                    ProfileMenuRow(icon: "creditcard", title: "Payment Methods") {}
                }
                .staggeredFadeIn(index: 4)

                // Divider
                Rectangle()
                    .fill(ForMe.borderLight)
                    .frame(height: 1)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 4)

                // MARK: - Preferences
                VStack(alignment: .leading, spacing: 0) {
                    Text("Preferences")
                        .font(.system(size: 12, weight: .semibold))
                        .tracking(0.8)
                        .textCase(.uppercase)
                        .foregroundColor(ForMe.textTertiary)
                        .padding(.horizontal, 16)
                        .padding(.top, 16)
                        .padding(.bottom, 10)

                    ProfileMenuRow(icon: "bell", title: "Notifications") {}
                    ProfileMenuRow(icon: "gearshape", title: "Settings") {
                        showSettings = true
                    }
                    ProfileMenuRow(icon: "questionmark.circle", title: "Help & Support") {}
                }
                .staggeredFadeIn(index: 5)

                // MARK: - Logout
                Button(role: .destructive) {
                    authViewModel.logout()
                } label: {
                    Text("Log Out")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(ForMe.statusCancelled)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .padding(.top, 20)
                .padding(.horizontal, 16)
                .staggeredFadeIn(index: 6)

                Spacer().frame(height: 40)
            }
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
        .sheet(isPresented: $showEditProfile) {
            EditProfileView()
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
    }

    private var profileHeaderGradient: some View {
        LinearGradient(
            colors: [
                Color(hex: "1a1a2e"),
                Color(hex: "16213e"),
                Color(hex: "0f3460")
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

// MARK: - Stats

struct ProfileStat: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundColor(ForMe.textPrimary)
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(ForMe.textTertiary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Profile Menu Row

struct ProfileMenuRow: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 15, weight: .regular))
                    .foregroundColor(ForMe.textSecondary)
                    .frame(width: 22)

                Text(title)
                    .font(.system(size: 15))
                    .foregroundColor(ForMe.textPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.textTertiary.opacity(0.6))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 13)
        }
    }
}

// MARK: - Previews

#Preview("Full Profile") {
    let vm = AuthViewModel()
    vm.currentUser = User(
        id: "1",
        name: "Marcus Johnson",
        bio: "Barber & stylist based in Long Beach. 10+ years crafting fresh cuts and clean fades.",
        location: "Long Beach, CA",
        role: "Barber",
        isVerified: true
    )
    return ProfileView()
        .environmentObject(vm)
}

#Preview("No Photo") {
    let vm = AuthViewModel()
    vm.currentUser = User(
        id: "2",
        name: "Sarah Chen",
        bio: "Barber & stylist based in Long Beach. 10+ years crafting fresh cuts and clean fades.",
        location: "Los Angeles, CA",
        role: "Stylist"
    )
    return ProfileView()
        .environmentObject(vm)
}

#Preview("Minimal") {
    let vm = AuthViewModel()
    vm.currentUser = User(
        id: "3",
        name: "New User",
        bio: "Barber & stylist based in Long Beach. 10+ years crafting fresh cuts and clean fades."
    )
    return ProfileView()
        .environmentObject(vm)
}
