import SwiftUI

struct PostCard: View {
    let post: Post
    var width: CGFloat = 180

    private var isTextPost: Bool { post.imageSrc == nil && post.mediaUrl == nil }
    private var isVideo: Bool { post.mediaType == "video" }
    private var likeCount: Int { post.likes?.count ?? 0 }
    private var commentCount: Int { post.comments?.count ?? 0 }

    var body: some View {
        ZStack {
            // Media fills entire card
            mediaContent
                .frame(width: width, height: width * 6 / 5)
                .clipped()

            // Bottom gradient for text readability
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

            // Heart + Share — top right, vertical (matches web)
            VStack(spacing: 10) {
                Button {
                    // TODO: toggle like
                } label: {
                    Image(systemName: "heart")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.white.opacity(0.85))
                        .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                }
                Button {
                    // TODO: share
                } label: {
                    Image(systemName: "arrow.up.right")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
            .padding(ForMe.space4)

            // Video badge — top left
            if isVideo {
                Image(systemName: "play.fill")
                    .font(.system(size: 8))
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(.black.opacity(0.5))
                    .clipShape(Capsule())
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(ForMe.space4)
            }

            // Bottom info — avatar + name + content + stats (matches web)
            HStack(alignment: .bottom, spacing: 6) {
                // Avatar — small circle with white ring
                if let user = post.user {
                    AsyncImage(url: URL(string: user.image ?? "")) { img in
                        img.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle().fill(ForMe.stone400)
                            .overlay(
                                Text(user.name?.prefix(1).uppercased() ?? "")
                                    .font(.system(size: 8, weight: .bold))
                                    .foregroundColor(.white)
                            )
                    }
                    .frame(width: 22, height: 22)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(.white.opacity(0.8), lineWidth: 1.5))
                }

                VStack(alignment: .leading, spacing: 2) {
                    if let user = post.user {
                        Text(user.name ?? "")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                            .shadow(color: .black.opacity(0.3), radius: 1, x: 0, y: 1)
                    }

                    if let content = post.content, !content.isEmpty, !isTextPost {
                        Text(content)
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.7))
                            .lineLimit(1)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
            .padding(ForMe.space4)
        }
        .frame(width: width, height: width * 6 / 5)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
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
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .lineLimit(7)
                    .padding(20)
            }
        } else if let imageUrl = post.imageSrc ?? post.mediaUrl ?? post.thumbnailUrl {
            AsyncImage(url: URL(string: imageUrl)) { phase in
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
