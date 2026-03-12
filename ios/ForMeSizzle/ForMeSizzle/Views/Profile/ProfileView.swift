import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showSettings = false
    @State private var showEditProfile = false

    private var user: User? { authViewModel.currentUser }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // MARK: - Hero Header
                ZStack(alignment: .bottom) {
                    // Background
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
                    .frame(height: 220)
                    .clipped()
                    .overlay(
                        // Bottom fade
                        LinearGradient(
                            stops: [
                                .init(color: .clear, location: 0.0),
                                .init(color: ForMe.background.opacity(0.3), location: 0.5),
                                .init(color: ForMe.background, location: 1.0)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )

                    // Avatar + Name overlay
                    VStack(spacing: 12) {
                        ZStack(alignment: .bottomTrailing) {
                            DynamicAvatar(
                                name: user?.name ?? "User",
                                imageUrl: user?.image,
                                size: .large
                            )
                            .shadow(color: .black.opacity(0.12), radius: 8, x: 0, y: 4)

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

                        VStack(spacing: 4) {
                            Text(user?.name ?? "User")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(ForMe.textPrimary)

                            if let location = user?.location {
                                HStack(spacing: 4) {
                                    Image(systemName: "mappin")
                                        .font(.system(size: 11))
                                    Text(location)
                                        .font(.system(size: 13, weight: .medium))
                                }
                                .foregroundColor(ForMe.textTertiary)
                            }
                        }
                    }
                    .padding(.bottom, -30)
                }
                .staggeredFadeIn(index: 0)

                // Spacer for overlap
                Spacer().frame(height: 42)

                // MARK: - Bio
                if let bio = user?.bio, !bio.isEmpty {
                    Text(bio)
                        .font(.system(size: 14, weight: .regular))
                        .foregroundColor(ForMe.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                        .padding(.horizontal, 40)
                        .staggeredFadeIn(index: 1)
                }

                // MARK: - Edit Profile Button
                Button {
                    showEditProfile = true
                } label: {
                    Text("Edit Profile")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 10)
                        .background(
                            Capsule()
                                .fill(ForMe.surface)
                        )
                        .overlay(
                            Capsule()
                                .stroke(ForMe.border, lineWidth: 1)
                        )
                        .shadow(color: .black.opacity(0.04), radius: 2, x: 0, y: 1)
                }
                .padding(.top, 16)
                .staggeredFadeIn(index: 2)

                // MARK: - Stats Row
                HStack(spacing: 0) {
                    ProfileStat(
                        value: "\(user?.followingIds?.count ?? 0)",
                        label: "Following"
                    )

                    RoundedRectangle(cornerRadius: 1)
                        .fill(ForMe.borderLight)
                        .frame(width: 1, height: 28)

                    ProfileStat(
                        value: "\(user?.followerIds?.count ?? 0)",
                        label: "Followers"
                    )

                    RoundedRectangle(cornerRadius: 1)
                        .fill(ForMe.borderLight)
                        .frame(width: 1, height: 28)

                    ProfileStat(
                        value: user?.isSubscribed == true ? "Pro" : "Free",
                        label: "Plan"
                    )
                }
                .padding(.vertical, 20)
                .padding(.horizontal, 24)
                .staggeredFadeIn(index: 3)

                // MARK: - Editorial Service Options
                VStack(spacing: 10) {
                    // Row 1 — two cards
                    HStack(spacing: 10) {
                        EditorialProfileCard(
                            icon: "heart",
                            title: "Favorites",
                            subtitle: "Saved",
                            accentColor: Color(hex: "FB7185"),
                            watermark: "heart.fill"
                        ) {}

                        EditorialProfileCard(
                            icon: "clock.arrow.circlepath",
                            title: "History",
                            subtitle: "Bookings",
                            accentColor: Color(hex: "60A5FA"),
                            watermark: "clock"
                        ) {}
                    }

                    // Row 2 — two cards
                    HStack(spacing: 10) {
                        EditorialProfileCard(
                            icon: "creditcard",
                            title: "Payment",
                            subtitle: "Methods",
                            accentColor: Color(hex: "34D399"),
                            watermark: "creditcard.fill"
                        ) {}

                        EditorialProfileCard(
                            icon: "bell",
                            title: "Alerts",
                            subtitle: "Notifications",
                            accentColor: Color(hex: "FBBF24"),
                            watermark: "bell.fill"
                        ) {}
                    }

                    // Row 3 — two cards
                    HStack(spacing: 10) {
                        EditorialProfileCard(
                            icon: "gearshape",
                            title: "Settings",
                            subtitle: "Preferences",
                            accentColor: Color(hex: "A78BFA"),
                            watermark: "gearshape.fill"
                        ) {
                            showSettings = true
                        }

                        EditorialProfileCard(
                            icon: "questionmark.circle",
                            title: "Support",
                            subtitle: "Help",
                            accentColor: Color(hex: "6B7280"),
                            watermark: "questionmark"
                        ) {}
                    }
                }
                .padding(.horizontal, 16)
                .staggeredFadeIn(index: 4)

                // MARK: - Logout
                Button(role: .destructive) {
                    authViewModel.logout()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .font(.system(size: 13))
                        Text("Log Out")
                            .font(.system(size: 14, weight: .medium))
                    }
                    .foregroundColor(ForMe.textTertiary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .padding(.top, 8)
                .padding(.horizontal, 16)
                .staggeredFadeIn(index: 5)

                Spacer().frame(height: 32)
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

    // Gradient for header when no background image
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
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 17, weight: .bold, design: .rounded))
                .foregroundColor(ForMe.textPrimary)
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(ForMe.textTertiary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Editorial Profile Card (magazine-style service option)

struct EditorialProfileCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let accentColor: Color
    let watermark: String
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .topLeading) {
                // Watermark icon — large, faded, offset to bottom-right
                Image(systemName: watermark)
                    .font(.system(size: 54, weight: .ultraLight))
                    .foregroundColor(accentColor.opacity(0.08))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                    .padding(.trailing, 8)
                    .padding(.bottom, 6)

                // Content
                VStack(alignment: .leading, spacing: 0) {
                    // Icon circle
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(accentColor)
                        .frame(width: 36, height: 36)
                        .background(
                            Circle()
                                .fill(accentColor.opacity(0.1))
                        )

                    Spacer()

                    // Title — bold editorial
                    Text(title)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(ForMe.textPrimary)
                        .tracking(-0.3)

                    // Subtitle
                    Text(subtitle)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)
                        .padding(.top, 1)

                    // Arrow indicator
                    HStack {
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(ForMe.textTertiary)
                    }
                    .padding(.top, 6)
                }
                .padding(16)
            }
            .frame(height: 140)
            .frame(maxWidth: .infinity)
            .background(ForMe.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .shadow(color: .black.opacity(0.03), radius: 2, x: 0, y: 1)
            .scaleEffect(isPressed ? 0.97 : 1.0)
            .animation(.easeOut(duration: 0.15), value: isPressed)
        }
        .buttonStyle(EditorialCardButtonStyle(isPressed: $isPressed))
    }
}

struct EditorialCardButtonStyle: ButtonStyle {
    @Binding var isPressed: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .onChange(of: configuration.isPressed) { _, newValue in
                isPressed = newValue
            }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
