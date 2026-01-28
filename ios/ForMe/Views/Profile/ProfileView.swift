import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showSettings = false
    @State private var showEditProfile = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    VStack(spacing: 16) {
                        AsyncImage(url: URL(string: authViewModel.currentUser?.image ?? "")) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Circle()
                                .fill(Color(.systemGray4))
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.largeTitle)
                                        .foregroundColor(.white)
                                )
                        }
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())

                        VStack(spacing: 4) {
                            Text(authViewModel.currentUser?.name ?? "User")
                                .font(.title2.bold())

                            if let bio = authViewModel.currentUser?.bio {
                                Text(bio)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                            }

                            if let location = authViewModel.currentUser?.location {
                                HStack(spacing: 4) {
                                    Image(systemName: "mappin")
                                    Text(location)
                                }
                                .font(.caption)
                                .foregroundColor(.secondary)
                            }
                        }

                        // Verification badge
                        if authViewModel.currentUser?.verificationStatus == .verified {
                            HStack(spacing: 4) {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundColor(.blue)
                                Text("Verified")
                                    .font(.caption.bold())
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(16)
                        }

                        Button("Edit Profile") {
                            showEditProfile = true
                        }
                        .font(.subheadline.bold())
                        .foregroundColor(.primary)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 10)
                        .background(Color(.systemGray6))
                        .cornerRadius(20)
                    }
                    .padding()

                    Divider()

                    // Menu Items
                    VStack(spacing: 0) {
                        ProfileMenuItem(icon: "heart", title: "Favorites") {
                            // Navigate to favorites
                        }

                        ProfileMenuItem(icon: "clock", title: "Booking History") {
                            // Navigate to history
                        }

                        ProfileMenuItem(icon: "creditcard", title: "Payment Methods") {
                            // Navigate to payment
                        }

                        ProfileMenuItem(icon: "bell", title: "Notifications") {
                            // Navigate to notifications
                        }

                        ProfileMenuItem(icon: "gearshape", title: "Settings") {
                            showSettings = true
                        }

                        ProfileMenuItem(icon: "questionmark.circle", title: "Help & Support") {
                            // Navigate to help
                        }
                    }

                    // Logout
                    Button(role: .destructive) {
                        authViewModel.logout()
                    } label: {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("Log Out")
                        }
                        .font(.headline)
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)
                }
            }
            .navigationTitle("Profile")
            .sheet(isPresented: $showEditProfile) {
                EditProfileView()
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
        }
    }
}

struct ProfileMenuItem: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .frame(width: 24)
                    .foregroundColor(.primary)

                Text(title)
                    .foregroundColor(.primary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
