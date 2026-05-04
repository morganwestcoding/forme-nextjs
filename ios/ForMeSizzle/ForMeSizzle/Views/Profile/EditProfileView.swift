import SwiftUI
import PhotosUI

struct EditProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var bio = ""
    @State private var location = ""
    @State private var imagePickerItem: PhotosPickerItem?
    @State private var imageData: Data?
    @State private var isSaving = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: ForMe.space5) {
                    PhotosPicker(selection: $imagePickerItem, matching: .images) {
                        ZStack(alignment: .bottomTrailing) {
                            if let data = imageData, let uiImage = UIImage(data: data) {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(width: 110, height: 110)
                                    .clipShape(Circle())
                            } else {
                                DynamicAvatar(
                                    name: authViewModel.currentUser?.name ?? "User",
                                    imageUrl: authViewModel.currentUser?.image,
                                    size: .extraLarge
                                )
                            }

                            Image(systemName: "camera.fill")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 32, height: 32)
                                .background(ForMe.stone900)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(.white, lineWidth: 2))
                        }
                    }
                    .padding(.top, ForMe.space5)
                    .onChange(of: imagePickerItem) { _, newValue in
                        Task {
                            if let data = try? await newValue?.loadTransferable(type: Data.self) {
                                imageData = data
                            }
                        }
                    }

                    VStack(spacing: ForMe.space3) {
                        formField(label: "Name", text: $name)
                        formField(label: "Bio", text: $bio, isMultiline: true)
                        formField(label: "Location", text: $location)
                    }
                    .padding(.horizontal, ForMe.space6)
                }
                .padding(.bottom, 80)
            }
            .background(ForMe.background)
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(ForMe.textSecondary)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await save() }
                    } label: {
                        if isSaving {
                            ProgressView().tint(ForMe.textPrimary)
                        } else {
                            Text("Save")
                                .font(ForMe.font(.semibold, size: 14))
                                .foregroundColor(ForMe.textPrimary)
                        }
                    }
                    .disabled(isSaving)
                }
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
            .onAppear {
                name = authViewModel.currentUser?.name ?? ""
                bio = authViewModel.currentUser?.bio ?? ""
                location = authViewModel.currentUser?.location ?? ""
            }
        }
    }

    private func formField(label: String, text: Binding<String>, isMultiline: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(ForMe.font(.semibold, size: 12))
                .foregroundColor(ForMe.stone500)

            if isMultiline {
                TextEditor(text: text)
                    .font(ForMe.font(.regular, size: 15))
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 100)
                    .padding(ForMe.space3)
                    .background(ForMe.surface)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
            } else {
                TextField("", text: text)
                    .font(ForMe.font(.regular, size: 15))
                    .padding(.horizontal, ForMe.space4)
                    .padding(.vertical, 14)
                    .background(ForMe.surface)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
            }
        }
    }

    private func save() async {
        isSaving = true
        do {
            var update = ProfileUpdateRequest()
            update.name = name
            update.bio = bio
            update.location = location

            if let data = imageData, let image = UIImage(data: data) {
                update.image = try await CloudinaryService.shared.uploadImage(
                    image,
                    folder: .profiles,
                    targetWidth: 400,
                    targetHeight: 400,
                    cropMode: .thumb,
                    gravity: "g_face"
                )
            }

            let updated = try await APIService.shared.updateProfile(update)
            authViewModel.currentUser = updated
            isSaving = false
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSaving = false
        }
    }
}

#Preview {
    EditProfileView()
        .environmentObject(AuthViewModel())
}
