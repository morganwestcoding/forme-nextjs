import SwiftUI
import PhotosUI
import UniformTypeIdentifiers

// MARK: - Multi-step Post Creation Flow (matches web PostFlow)

struct PostFlow: View {
    @Environment(\.dismiss) private var dismiss
    @State private var step: PostStep = .type
    @State private var postType: PostType? = nil
    @State private var caption = ""
    @State private var textContent = ""
    @State private var selectedImage: PhotosPickerItem?
    @State private var imageData: Data?
    @State private var isVideo: Bool = false
    @State private var isSubmitting = false
    @State private var error: String?
    @State private var showSourcePicker = false
    @State private var showCamera = false
    @State private var showPhotoLibrary = false

    enum PostStep: Int, CaseIterable {
        case type = 0, content, caption, preview
    }

    enum PostType: String {
        case media, text
    }

    private var flowPath: [PostStep] {
        if postType == .text {
            return [.type, .content, .preview]
        }
        return [.type, .content, .caption, .preview]
    }

    private var currentIndex: Int {
        flowPath.firstIndex(of: step) ?? 0
    }

    private var progress: CGFloat {
        CGFloat(currentIndex + 1) / CGFloat(flowPath.count)
    }

    private var canProceed: Bool {
        switch step {
        case .type: return postType != nil
        case .content:
            if postType == .text { return !textContent.trimmingCharacters(in: .whitespaces).isEmpty }
            return imageData != nil
        case .caption: return true
        case .preview: return true
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                FlowProgressBar(progress: progress)

                Group {
                    switch step {
                    case .type: typeStep
                    case .content:
                        if postType == .text { textStep } else { mediaStep }
                    case .caption: captionStep
                    case .preview: previewStep
                    }
                }

                bottomBar
            }
            .background(ForMe.background)
            .navigationTitle(navTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        if step == .type {
                            dismiss()
                        } else {
                            goBack()
                        }
                    } label: {
                        Image(systemName: step == .type ? "xmark" : "chevron.left")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
        }
    }

    private var navTitle: String {
        switch step {
        case .type: return "New Post"
        case .content: return postType == .text ? "Write" : "Add Media"
        case .caption: return "Caption"
        case .preview: return "Preview"
        }
    }

    // MARK: - Type Step

    private var typeStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: ForMe.space5) {
                TypeformHeading(
                    question: "What kind of post?",
                    subtitle: "Share something with your community"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                VStack(spacing: 12) {
                    PostTypeButton(
                        icon: "photo.on.rectangle.angled",
                        title: "Photo or Video",
                        subtitle: "Share an image or video clip",
                        isSelected: postType == .media
                    ) { postType = .media }

                    PostTypeButton(
                        icon: "text.alignleft",
                        title: "Text",
                        subtitle: "Just words, no media",
                        isSelected: postType == .text
                    ) { postType = .text }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Media Step

    private var mediaStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Add a photo or video",
                    subtitle: "Choose something to share"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                Button {
                    showSourcePicker = true
                } label: {
                    if let imageData = imageData, let uiImage = UIImage(data: imageData) {
                        Color.clear
                            .frame(height: 360)
                            .frame(maxWidth: .infinity)
                            .overlay(
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    } else {
                        VStack(spacing: 12) {
                            Image(systemName: "photo.badge.plus")
                                .font(.system(size: 36))
                                .foregroundColor(ForMe.stone400)
                            Text("Tap to choose media")
                                .font(ForMe.font(.medium, size: 14))
                                .foregroundColor(ForMe.textSecondary)
                        }
                        .frame(height: 360)
                        .frame(maxWidth: .infinity)
                        .background(ForMe.stone100)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                                .stroke(ForMe.stone200, style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                        )
                    }
                }
                .buttonStyle(.plain)
                .padding(.horizontal)
                .confirmationDialog("Choose source", isPresented: $showSourcePicker, titleVisibility: .visible) {
                    Button("Take Photo") { showCamera = true }
                    Button("Choose from Library") { showPhotoLibrary = true }
                    Button("Cancel", role: .cancel) {}
                }
                .sheet(isPresented: $showCamera) {
                    CameraPicker(imageData: $imageData)
                }
                .photosPicker(isPresented: $showPhotoLibrary, selection: $selectedImage, matching: .any(of: [.images, .videos]))
                .onChange(of: selectedImage) { _, newValue in
                    Task {
                        guard let item = newValue else { return }
                        isVideo = item.supportedContentTypes.contains { $0.conforms(to: .movie) }
                        if let data = try? await item.loadTransferable(type: Data.self) {
                            imageData = data
                        }
                    }
                }
            }
        }
    }

    // MARK: - Text Step (text-only post)

    private var textStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: ForMe.space5) {
                TypeformHeading(
                    question: "What do you want to say?",
                    subtitle: "Share your thoughts"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                TextEditor(text: $textContent)
                    .font(ForMe.font(.regular, size: 16))
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 200)
                    .padding(ForMe.space3)
                    .background(ForMe.surface)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
                    .padding(.horizontal)
            }
        }
    }

    // MARK: - Caption Step (for media posts)

    private var captionStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Add a caption",
                    subtitle: "Optional — say something about your post"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                TextEditor(text: $caption)
                    .font(ForMe.font(.regular, size: 16))
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 150)
                    .padding(ForMe.space3)
                    .background(ForMe.surface)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
                    .padding(.horizontal)
            }
        }
    }

    // MARK: - Preview Step

    private var previewStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Looks good?",
                    subtitle: "Review your post before sharing"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                // Preview card
                VStack(alignment: .leading, spacing: 12) {
                    if postType == .text {
                        ZStack {
                            LinearGradient(
                                colors: [Color(hex: "1a1a1a"), Color(hex: "262626")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                            Text(textContent)
                                .font(ForMe.font(.medium, size: 18))
                                .foregroundColor(.white.opacity(0.9))
                                .multilineTextAlignment(.center)
                                .padding(30)
                        }
                        .frame(height: 280)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    } else if let imageData = imageData, let uiImage = UIImage(data: imageData) {
                        Color.clear
                            .frame(height: 360)
                            .frame(maxWidth: .infinity)
                            .overlay(
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))

                        if !caption.isEmpty {
                            Text(caption)
                                .font(ForMe.font(.regular, size: 14))
                                .foregroundColor(ForMe.textSecondary)
                                .padding(.horizontal, ForMe.space2)
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Bottom Bar

    private var bottomBar: some View {
        VStack(spacing: 0) {
            Divider()
            Button {
                if step == .preview {
                    Task { await submit() }
                } else {
                    goNext()
                }
            } label: {
                if isSubmitting {
                    ForMeLoader(size: .small, color: .white)
                        .frame(maxWidth: .infinity)
                } else {
                    Text(step == .preview ? "Share Post" : "Continue")
                        .font(ForMe.font(.semibold, size: 15))
                        .frame(maxWidth: .infinity)
                }
            }
            .foregroundColor(.white)
            .padding(.vertical, 14)
            .background(canProceed ? ForMe.stone900 : ForMe.stone300)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .disabled(!canProceed || isSubmitting)
            .padding()
        }
        .background(ForMe.background)
    }

    // MARK: - Navigation

    private func goNext() {
        guard let nextIdx = flowPath.firstIndex(of: step).map({ $0 + 1 }), nextIdx < flowPath.count else { return }
        withAnimation(.easeInOut(duration: 0.25)) {
            step = flowPath[nextIdx]
        }
    }

    private func goBack() {
        guard let prevIdx = flowPath.firstIndex(of: step).map({ $0 - 1 }), prevIdx >= 0 else { return }
        withAnimation(.easeInOut(duration: 0.25)) {
            step = flowPath[prevIdx]
        }
    }

    // MARK: - Submit

    private func submit() async {
        isSubmitting = true
        do {
            var imageSrc: String? = nil
            var mediaUrl: String? = nil
            var mediaType: String? = nil

            if postType == .media, let data = imageData {
                if isVideo {
                    let resp = try await CloudinaryService.shared.uploadMedia(
                        data: data,
                        folder: .posts,
                        resourceType: .auto,
                        mimeType: "video/mp4",
                        filename: "post.mp4"
                    )
                    mediaUrl = resp.secure_url
                    mediaType = "video"
                } else if let image = UIImage(data: data) {
                    imageSrc = try await CloudinaryService.shared.uploadImage(
                        image,
                        folder: .posts,
                        targetWidth: 1080,
                        targetHeight: 1080
                    )
                }
            }

            let request = CreatePostRequest(
                content: postType == .text ? textContent : caption,
                imageSrc: imageSrc,
                mediaUrl: mediaUrl,
                mediaType: mediaType,
                beforeImageSrc: nil,
                category: nil,
                location: nil,
                postType: postType == .text ? "text" : nil
            )
            _ = try await APIService.shared.createPost(request)
            isSubmitting = false
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

// MARK: - Post Type Button

struct PostTypeButton: View {
    let icon: String
    let title: String
    let subtitle: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(ForMe.stone700)
                    .frame(width: 48, height: 48)
                    .background(ForMe.stone100)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(ForMe.font(.semibold, size: 15))
                        .foregroundColor(ForMe.textPrimary)
                    Text(subtitle)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 18))
                        .foregroundColor(ForMe.stone900)
                }
            }
            .padding(ForMe.space4)
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(isSelected ? ForMe.stone900 : ForMe.stone200, lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    PostFlow()
}
