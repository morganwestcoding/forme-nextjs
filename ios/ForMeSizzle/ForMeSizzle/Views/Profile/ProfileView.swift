import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showSettings = false
    @State private var showEditProfile = false

    private var user: User? { authViewModel.currentUser }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Profile Header Card
                VStack(spacing: 16) {
                    DynamicAvatar(
                        name: user?.name ?? "User",
                        imageUrl: user?.image,
                        size: .large
                    )

                    VStack(spacing: 6) {
                        HStack(spacing: 6) {
                            Text(user?.name ?? "User")
                                .font(.title2.bold())
                                .foregroundColor(ForMe.textPrimary)

                            if user?.verificationStatus == .verified {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundColor(ForMe.accent)
                                    .font(.subheadline)
                            }
                        }

                        if let location = user?.location {
                            HStack(spacing: 4) {
                                Image(systemName: "mappin")
                                Text(location)
                            }
                            .font(.caption)
                            .foregroundColor(ForMe.textTertiary)
                        }
                    }

                    if let bio = user?.bio, !bio.isEmpty {
                        Text(bio)
                            .font(.subheadline)
                            .foregroundColor(ForMe.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 8)
                    }

                    // Edit button
                    Button {
                        showEditProfile = true
                    } label: {
                        Text("Edit Profile")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(ForMe.textPrimary)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(ForMe.border, lineWidth: 1)
                            )
                    }
                }
                .padding(20)
                .frame(maxWidth: .infinity)
                .forMeCard(padding: 0)
                .padding(.horizontal)
                .staggeredFadeIn(index: 0)

                // Menu sections
                VStack(spacing: 2) {
                    ProfileMenuItem(icon: "heart", title: "Favorites") {}
                    ProfileMenuItem(icon: "clock", title: "Booking History") {}
                    ProfileMenuItem(icon: "creditcard", title: "Payment Methods") {}
                }
                .forMeCard(padding: 0)
                .padding(.horizontal)
                .staggeredFadeIn(index: 1)

                VStack(spacing: 2) {
                    ProfileMenuItem(icon: "bell", title: "Notifications") {}
                    ProfileMenuItem(icon: "gearshape", title: "Settings") {
                        showSettings = true
                    }
                    ProfileMenuItem(icon: "questionmark.circle", title: "Help & Support") {}
                }
                .forMeCard(padding: 0)
                .padding(.horizontal)
                .staggeredFadeIn(index: 2)

                // Logout
                Button(role: .destructive) {
                    authViewModel.logout()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Log Out")
                    }
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(ForMe.statusCancelled)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .padding(.horizontal)
                .staggeredFadeIn(index: 3)
            }
            .padding(.vertical)
        }
        .background(ForMe.background)
        .navigationTitle("Profile")
        .sheet(isPresented: $showEditProfile) {
            EditProfileView()
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
    }
}

struct ProfileMenuItem: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.body)
                    .frame(width: 24)
                    .foregroundColor(ForMe.accent)

                Text(title)
                    .font(.subheadline)
                    .foregroundColor(ForMe.textPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundColor(ForMe.textTertiary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
