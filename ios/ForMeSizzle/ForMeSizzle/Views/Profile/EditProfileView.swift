import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss

    @State private var name: String = ""
    @State private var bio: String = ""
    @State private var location: String = ""
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Avatar
                    VStack(spacing: 12) {
                        DynamicAvatar(
                            name: authViewModel.currentUser?.name ?? "User",
                            imageUrl: authViewModel.currentUser?.image,
                            size: .large
                        )

                        Button("Change Photo") {
                            // TODO: Implement photo picker
                        }
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(ForMe.accent)
                    }
                    .padding(.top, 8)

                    // Fields
                    VStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Name")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(ForMe.textPrimary)
                            TextField("Your name", text: $name)
                                .forMeInput()
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Bio")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(ForMe.textPrimary)
                            TextField("Tell us about yourself", text: $bio, axis: .vertical)
                                .lineLimit(3...6)
                                .forMeInput()
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Location")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(ForMe.textPrimary)
                            TextField("City, State", text: $location)
                                .forMeInput()
                        }
                    }
                }
                .padding(.horizontal, 24)
            }
            .background(ForMe.background)
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(ForMe.textSecondary)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task {
                            isSaving = true
                            if await authViewModel.updateProfile(
                                name: name.isEmpty ? nil : name,
                                bio: bio.isEmpty ? nil : bio,
                                location: location.isEmpty ? nil : location
                            ) {
                                dismiss()
                            }
                            isSaving = false
                        }
                    } label: {
                        if isSaving {
                            ForMeLoader(size: .small, color: ForMe.accent)
                        } else {
                            Text("Save")
                                .bold()
                                .foregroundColor(ForMe.accent)
                        }
                    }
                    .disabled(isSaving)
                }
            }
            .onAppear {
                name = authViewModel.currentUser?.name ?? ""
                bio = authViewModel.currentUser?.bio ?? ""
                location = authViewModel.currentUser?.location ?? ""
            }
        }
    }
}

#Preview {
    EditProfileView()
        .environmentObject(AuthViewModel())
}
