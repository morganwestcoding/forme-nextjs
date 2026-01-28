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
            Form {
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 12) {
                            AsyncImage(url: URL(string: authViewModel.currentUser?.image ?? "")) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Circle()
                                    .fill(Color(.systemGray4))
                                    .overlay(
                                        Image(systemName: "person.fill")
                                            .font(.title)
                                            .foregroundColor(.white)
                                    )
                            }
                            .frame(width: 80, height: 80)
                            .clipShape(Circle())

                            Button("Change Photo") {
                                // TODO: Implement photo picker
                            }
                            .font(.subheadline)
                        }
                        Spacer()
                    }
                    .listRowBackground(Color.clear)
                }

                Section("Personal Info") {
                    TextField("Name", text: $name)
                    TextField("Bio", text: $bio, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Location", text: $location)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
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
                            ProgressView()
                        } else {
                            Text("Save")
                                .bold()
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
