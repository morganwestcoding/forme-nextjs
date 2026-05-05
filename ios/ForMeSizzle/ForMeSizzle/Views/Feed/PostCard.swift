import SwiftUI

struct PostCard: View {
    let post: Post
    var width: CGFloat? = 180
    /// Fired after a successful hide or delete so the host view can remove
    /// the post locally without waiting for a refresh.
    var onRemove: (() -> Void)? = nil
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var isLiked = false
    @State private var showDeleteConfirm = false

    private var aspectRatio: CGFloat { 5 / 6 }

    private var isTextPost: Bool { post.imageSrc == nil && post.mediaUrl == nil }
    private var isVideo: Bool { post.isVideoPost }
    private var videoURL: URL? {
        guard isVideo else { return nil }
        if let m = post.mediaUrl, let u = URL(string: m) { return u }
        if let i = post.imageSrc, let u = URL(string: i) { return u }
        return nil
    }
    private var likeCount: Int { post.likes?.count ?? 0 }
    private var commentCount: Int { post.comments?.count ?? 0 }

    var body: some View {
        // Each layer is a separate overlay so the base's size strictly bounds it.
        // Single-ZStack approach leaked media intrinsic size and pushed labels off-screen.
        cardBase
            .overlay(
                mediaContent
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .clipped()
            )
            .overlay(
                Group {
                    if !isTextPost {
                        LinearGradient(
                            stops: [
                                .init(color: .clear, location: 0.35),
                                .init(color: .black.opacity(0.3), location: 0.6),
                                .init(color: .black.opacity(0.65), location: 1.0),
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    }
                }
            )
            .overlay(alignment: .bottomLeading) { bottomInfo.allowsHitTesting(false) }
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .contentShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(alignment: .topTrailing) { menuButton }
    }

    private var cardBase: some View {
        Group {
            if let width {
                Color.clear.frame(width: width, height: width / aspectRatio)
            } else {
                Color.clear
                    .frame(maxWidth: .infinity)
                    .aspectRatio(aspectRatio, contentMode: .fit)
            }
        }
    }

    private var menuButton: some View {
        Menu {
            Button {
                toggleFavorite()
            } label: {
                Label(isLiked ? "Unfavorite" : "Favorite",
                      systemImage: isLiked ? "heart.slash" : "heart")
            }
            Button { sharePost() } label: {
                Label("Share", systemImage: "square.and.arrow.up")
            }
            if !isOwnPost {
                Button {
                    hidePost()
                } label: {
                    Label("Hide", systemImage: "eye.slash")
                }
            }
            if isOwnPost {
                Button(role: .destructive) {
                    showDeleteConfirm = true
                } label: {
                    Label("Delete", systemImage: "trash")
                }
            }
        } label: {
            HugeMoreHorizontal(size: 20, color: .white.opacity(0.85))
                .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                .frame(width: 36, height: 36)
                .contentShape(Rectangle())
        }
        .menuOrder(.fixed)
        .padding(ForMe.space4)
        .confirmationDialog("Delete this post?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Delete", role: .destructive) { deletePost() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This can't be undone.")
        }
    }

    private var isOwnPost: Bool {
        guard let me = authViewModel.currentUser?.id, let author = post.userId else { return false }
        return me == author
    }

    @ViewBuilder
    private var bottomInfo: some View {
        HStack(alignment: .bottom, spacing: 10) {
            if let user = post.user {
                AsyncImage(url: AssetURL.resolve(user.avatarURL)) { img in
                    img.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle().fill(ForMe.stone400)
                        .overlay(
                            Text(user.name?.prefix(1).uppercased() ?? "")
                                .font(ForMe.font(.bold, size: 13))
                                .foregroundColor(.white)
                        )
                }
                .frame(width: 30, height: 30)
                .clipShape(Circle())
                .overlay(Circle().stroke(.white.opacity(0.8), lineWidth: 1.5))
            }

            VStack(alignment: .leading, spacing: 2) {
                if let user = post.user {
                    Text(user.name ?? "")
                        .font(ForMe.font(.semibold, size: 13))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .truncationMode(.tail)
                        .shadow(color: .black.opacity(0.3), radius: 1, x: 0, y: 1)
                }

                if let content = post.content, !content.isEmpty, !isTextPost {
                    Text(content)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(.white.opacity(0.8))
                        .lineLimit(1)
                        .truncationMode(.tail)
                }
            }
        }
        .padding(ForMe.space4)
    }

    // MARK: - Media Content

    @ViewBuilder
    private var mediaContent: some View {
        if isTextPost {
            // Text post — dark background with quote
            ZStack {
                LinearGradient(
                    colors: [Color(hex: "1a1a1a"), Color(hex: "262626"), Color(hex: "1a1a1a")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                Text("\u{201C}")
                    .font(.system(size: 36, design: .serif))
                    .foregroundColor(.white.opacity(0.15))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.leading, 14)
                    .padding(.top, 10)

                Text(post.content ?? "")
                    .font(ForMe.font(.medium, size: 13))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .lineLimit(7)
                    .padding(20)
            }
        } else if let url = videoURL {
            // Extract first-frame thumbnail for videos on the discover feed
            VideoThumbnail(url: url)
        } else if let imageUrl = post.imageSrc ?? post.thumbnailUrl ?? post.mediaUrl {
            AsyncImage(url: AssetURL.resolve(imageUrl)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(ForMe.stone100)
                        .overlay(ProgressView().tint(ForMe.textTertiary))
                }
            }
        } else {
            Rectangle().fill(ForMe.stone100)
        }
    }

    // MARK: - Date Formatting

    private func formatDate(_ dateStr: String?) -> String {
        guard let dateStr = dateStr else { return "" }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = iso.date(from: dateStr) else { return "" }
        let days = Calendar.current.dateComponents([.day], from: date, to: Date()).day ?? 0

        if days == 0 { return "Today" }
        if days == 1 { return "1d" }
        if days < 7 { return "\(days)d" }
        if days < 30 { return "\(days / 7)w" }

        let f = DateFormatter()
        f.dateFormat = "MMM d"
        return f.string(from: date)
    }

    private func sharePost() {
        let text = post.content ?? ""
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }

    private func toggleFavorite() {
        Haptics.confirm()
        isLiked.toggle()
        Task {
            do {
                if isLiked {
                    try await APIService.shared.addFavorite(listingId: post.id)
                } else {
                    try await APIService.shared.removeFavorite(listingId: post.id)
                }
            } catch {
                isLiked.toggle()
            }
        }
    }

    private func hidePost() {
        Haptics.tap()
        onRemove?()
        Task {
            try? await APIService.shared.hidePost(id: post.id)
        }
    }

    private func deletePost() {
        Haptics.warning()
        onRemove?()
        Task {
            try? await APIService.shared.deletePost(id: post.id)
        }
    }
}

// MARK: - Previews

#Preview("Post Cards") {
    ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 2) {
            // Image post
            PostCard(post: Post(
                id: "1",
                content: "Fresh cut for the weekend",
                imageSrc: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400",
                likes: ["a", "b", "c"],
                comments: [Comment(id: "c1", content: "Fire")],
                user: CompactUser(id: "u1", name: "Marcus J.")
            ))

            // Text post
            PostCard(post: Post(
                id: "2",
                content: "Every artist was first an amateur. Keep pushing, keep growing, keep creating.",
                likes: ["a"],
                user: CompactUser(id: "u2", name: "Sarah C.")
            ))

            // Video post
            PostCard(post: Post(
                id: "3",
                content: "Tutorial dropping soon",
                imageSrc: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
                mediaType: "video",
                likes: ["a", "b"],
                comments: [Comment(id: "c2", content: "Nice"), Comment(id: "c3", content: "Wow")],
                user: CompactUser(id: "u3", name: "Angela W.")
            ))
        }
        .padding()
    }
    .background(ForMe.background)
}

#Preview("Text Post") {
    PostCard(
        post: Post(
            id: "4",
            content: "The best investment you can make is in yourself. Your skills, your knowledge, your craft.",
            user: CompactUser(id: "u4", name: "Tim D.")
        ),
        width: 200
    )
    .padding()
    .background(ForMe.background)
}
