import SwiftUI
import PhotosUI

struct ProfileStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var selectedPhoto: PhotosPickerItem?

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Almost done!")
                    .font(.title.bold())

                Text("Add your photo so others can recognize you")
                    .foregroundColor(ForMe.textSecondary)
            }

            // Profile preview
            HStack(spacing: 16) {
                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    ZStack {
                        if let imageData = viewModel.profileImageData,
                           let uiImage = UIImage(data: imageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 80, height: 80)
                                .clipShape(Circle())
                        } else {
                            Circle()
                                .fill(ForMe.inputBg)
                                .frame(width: 80, height: 80)
                                .overlay(
                                    Image(systemName: "camera.fill")
                                        .foregroundColor(ForMe.textTertiary)
                                        .font(.title3)
                                )
                        }

                        // Edit overlay
                        Circle()
                            .fill(Color.black.opacity(0.001))
                            .frame(width: 80, height: 80)
                            .overlay(alignment: .bottomTrailing) {
                                ZStack {
                                    Circle()
                                        .fill(ForMe.textPrimary)
                                        .frame(width: 24, height: 24)

                                    Image(systemName: "pencil")
                                        .font(.caption2.bold())
                                        .foregroundColor(.white)
                                }
                                .offset(x: 2, y: 2)
                            }
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(viewModel.name.isEmpty ? "Your Name" : viewModel.name)
                        .font(.title3.bold())

                    Text(viewModel.jobTitle.isEmpty ? "Your profession" : viewModel.jobTitle)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }

            // Bio
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Bio")
                        .font(.subheadline.weight(.medium))

                    Text("(optional)")
                        .font(.subheadline)
                        .foregroundColor(ForMe.textTertiary)
                }

                ZStack(alignment: .topLeading) {
                    if viewModel.bio.isEmpty {
                        Text("Tell others a bit about yourself...")
                            .foregroundColor(Color(.placeholderText))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                    }

                    TextEditor(text: $viewModel.bio)
                        .frame(minHeight: 80)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .scrollContentBackground(.hidden)
                        .onChange(of: viewModel.bio) {
                            if viewModel.bio.count > 150 {
                                viewModel.bio = String(viewModel.bio.prefix(150))
                            }
                        }
                }
                .background(ForMe.inputBg)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )
                .cornerRadius(12)

                Text("\(viewModel.bio.count)/150")
                    .font(.caption)
                    .foregroundColor(ForMe.textTertiary)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
        }
        .onChange(of: selectedPhoto) {
            Task { @MainActor in
                if let data = try? await selectedPhoto?.loadTransferable(type: Data.self) {
                    viewModel.profileImageData = data
                }
            }
        }
    }
}
