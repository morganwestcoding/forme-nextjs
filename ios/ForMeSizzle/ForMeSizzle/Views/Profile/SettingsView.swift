import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("accentColorHex") private var accentColorHex = "60A5FA"
    @State private var showLogoutConfirm = false
    @State private var showStripeConnect = false
    @State private var showAcademiesAdmin = false
    @State private var showAdminDashboard = false

    private var isAdmin: Bool {
        let role = authViewModel.currentUser?.role ?? ""
        return role == "master" || role == "admin"
    }

    private let presetColors: [(String, String)] = [
        ("60A5FA", "Blue"),
        ("34D399", "Green"),
        ("F472B6", "Pink"),
        ("FBBF24", "Yellow"),
        ("A78BFA", "Purple"),
        ("FB7185", "Red"),
        ("2DD4BF", "Teal"),
        ("FB923C", "Orange"),
    ]

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: ForMe.space5) {
                    // Header
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Settings")
                            .font(ForMe.font(.bold, size: 22))
                            .foregroundColor(ForMe.textPrimary)
                        Text("Customize your app appearance")
                            .font(ForMe.font(.regular, size: 13))
                            .foregroundColor(ForMe.stone400)
                    }
                    .padding(.horizontal, ForMe.space6)
                    .padding(.top, ForMe.space3)

                    // Dark Mode toggle
                    settingRow(
                        title: "Dark Mode",
                        subtitle: "Switch between light and dark themes"
                    ) {
                        Toggle("", isOn: $isDarkMode)
                            .labelsHidden()
                            .tint(ForMe.stone900)
                    }

                    // Accent color picker
                    VStack(alignment: .leading, spacing: ForMe.space3) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Accent Color")
                                .font(ForMe.font(.semibold, size: 14))
                                .foregroundColor(ForMe.textPrimary)
                            Text("Pick your favorite accent")
                                .font(ForMe.font(.regular, size: 12))
                                .foregroundColor(ForMe.stone400)
                        }

                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 4), spacing: 12) {
                            ForEach(presetColors, id: \.0) { hex, name in
                                Button {
                                    accentColorHex = hex
                                } label: {
                                    VStack(spacing: 6) {
                                        Circle()
                                            .fill(Color(hex: hex))
                                            .frame(width: 44, height: 44)
                                            .overlay(
                                                Circle()
                                                    .stroke(accentColorHex == hex ? ForMe.stone900 : .clear, lineWidth: 2.5)
                                                    .padding(-3)
                                            )
                                        Text(name)
                                            .font(ForMe.font(.regular, size: 11))
                                            .foregroundColor(ForMe.stone500)
                                    }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(ForMe.space4)
                    .background(ForMe.surface)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
                    .padding(.horizontal, ForMe.space6)

                    // Account section
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Account")
                            .font(ForMe.font(.semibold, size: 12))
                            .foregroundColor(ForMe.stone400)
                            .padding(.horizontal, ForMe.space4)
                            .padding(.bottom, 8)

                        accountRow(icon: "person.crop.circle", label: "Edit Profile") {}
                        accountRow(icon: "banknote", label: "Payouts") {
                            showStripeConnect = true
                        }
                        accountRow(icon: "bell", label: "Notifications") {}
                        accountRow(icon: "lock", label: "Privacy") {}
                        accountRow(icon: "questionmark.circle", label: "Help & Support") {}
                    }
                    .padding(.horizontal, ForMe.space6)

                    if isAdmin {
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Admin")
                                .font(ForMe.font(.semibold, size: 12))
                                .foregroundColor(ForMe.stone400)
                                .padding(.horizontal, ForMe.space4)
                                .padding(.bottom, 8)

                            accountRow(icon: "shield.lefthalf.filled", label: "Admin dashboard") {
                                showAdminDashboard = true
                            }
                            accountRow(icon: "graduationcap", label: "Manage academies") {
                                showAcademiesAdmin = true
                            }
                        }
                        .padding(.horizontal, ForMe.space6)
                    }

                    // Sign out
                    Button {
                        showLogoutConfirm = true
                    } label: {
                        Text("Sign Out")
                            .font(ForMe.font(.semibold, size: 14))
                            .foregroundColor(ForMe.statusCancelled)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(ForMe.surface)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                    .stroke(ForMe.statusCancelled.opacity(0.3), lineWidth: 1)
                            )
                    }
                    .padding(.horizontal, ForMe.space6)
                    .padding(.top, ForMe.space3)
                }
                .padding(.bottom, 80)
            }
            .background(ForMe.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
            .confirmationDialog("Sign out?", isPresented: $showLogoutConfirm) {
                Button("Sign Out", role: .destructive) {
                    Task {
                        await authViewModel.logout()
                        dismiss()
                    }
                }
                Button("Cancel", role: .cancel) {}
            }
            .sheet(isPresented: $showStripeConnect) {
                StripeConnectView()
            }
            .sheet(isPresented: $showAcademiesAdmin) {
                NavigationStack {
                    AcademiesAdminListView()
                        .toolbar {
                            ToolbarItem(placement: .navigationBarLeading) {
                                Button("Done") { showAcademiesAdmin = false }
                                    .foregroundColor(ForMe.textPrimary)
                            }
                        }
                }
            }
            .sheet(isPresented: $showAdminDashboard) {
                NavigationStack {
                    AdminDashboardView()
                        .toolbar {
                            ToolbarItem(placement: .navigationBarLeading) {
                                Button("Done") { showAdminDashboard = false }
                                    .foregroundColor(ForMe.textPrimary)
                            }
                        }
                }
            }
        }
    }

    private func settingRow<Content: View>(
        title: String,
        subtitle: String,
        @ViewBuilder trailing: () -> Content
    ) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                Text(subtitle)
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.stone400)
            }
            Spacer()
            trailing()
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
        .padding(.horizontal, ForMe.space6)
    }

    private func accountRow(icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(ForMe.stone600)
                    .frame(width: 24)
                Text(label)
                    .font(ForMe.font(.regular, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(ForMe.stone300)
            }
            .padding(.horizontal, ForMe.space4)
            .padding(.vertical, 14)
            .background(ForMe.surface)
        }
        .buttonStyle(.plain)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(ForMe.stone100)
                .padding(.leading, 50),
            alignment: .bottom
        )
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthViewModel())
}
