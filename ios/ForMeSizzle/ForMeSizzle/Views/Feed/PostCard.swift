import SwiftUI

struct PostCard: View {
    let post: Post

    private let cardWidth: CGFloat = 200

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Media container - 5:6 aspect ratio like web
            ZStack(alignment: .topTrailing) {
                mediaContent
                    .frame(width: cardWidth, height: cardWidth * 6 / 5)
                    .clipped()

                // Heart button overlay
                Button {
                    // TODO: toggle favorite
                } label: {
                    Image(systemName: "heart")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                        .frame(width: 32, height: 32)
                        .background(.ultraThinMaterial.opacity(0.6))
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
                .padding(10)

                // Video indicator
                if post.mediaType == "video" {
                    HStack(spacing: 3) {
                        Image(systemName: "play.fill")
                            .font(.system(size: 8))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(.black.opacity(0.5))
                    .clipShape(Capsule())
                    .padding(10)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                }

                // Profile pic - bottom left corner
                if let user = post.user {
                    AsyncImage(url: URL(string: user.image ?? "")) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle()
                            .fill(Color(hex: "E5E7EB"))
                            .overlay(
                                Text(user.name?.prefix(1).uppercased() ?? "?")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(ForMe.textTertiary)
                            )
                    }
                    .frame(width: 28, height: 28)
                    .clipShape(Circle())
                    .overlay(
                        Circle()
                            .stroke(Color.white, lineWidth: 2)
                    )
                    .shadow(color: .black.opacity(0.15), radius: 3, x: 0, y: 1)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
                    .padding(10)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .shadow(color: .black.opacity(0.11), radius: 5, x: 0, y: 4)

            // Info section below image
            VStack(alignment: .leading, spacing: 6) {
                // User name
                if let user = post.user {
                    Text(user.name ?? "")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)
                }

                // Content/description
                Text(post.content?.isEmpty == false ? post.content! : "This is a description.")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.textSecondary)
                    .lineLimit(1)

                // Stats row
                HStack(spacing: 0) {
                    Text(formatDate(post.createdAt))
                        .foregroundColor(ForMe.textTertiary)

                    dividerDot

                    Text("\(post.likeCount) \(post.likeCount == 1 ? "like" : "likes")")
                        .foregroundColor(ForMe.textTertiary)

                    dividerDot

                    Text("\(post.commentCount) \(post.commentCount == 1 ? "comment" : "comments")")
                        .foregroundColor(ForMe.textTertiary)
                }
                .font(.system(size: 11))
                .padding(.top, 6)
            }
            .padding(.top, 14)
        }
        .frame(width: cardWidth)
    }

    // MARK: - Media Content

    @ViewBuilder
    private var mediaContent: some View {
        let isTextPost = post.imageSrc == nil && post.mediaUrl == nil
        let isVideo = post.mediaType == "video"

        if isTextPost {
            // Text post - dark gradient with quote
            ZStack {
                LinearGradient(
                    colors: [Color(hex: "1a1a1a"), Color(hex: "262626"), Color(hex: "1a1a1a")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                Text("\u{201C}")
                    .font(.system(size: 40, design: .serif))
                    .foregroundColor(.white.opacity(0.2))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.leading, 16)
                    .padding(.top, 12)

                Text(post.content ?? "")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .lineLimit(8)
                    .padding(24)
            }
        } else if isVideo, let thumbnailUrl = post.imageSrc ?? post.mediaUrl {
            // Video post - show thumbnail
            AsyncImage(url: URL(string: thumbnailUrl)) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                mediaSkeleton
            }
        } else if let imageUrl = post.mediaUrl ?? post.imageSrc {
            // Image post
            AsyncImage(url: URL(string: imageUrl)) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                mediaSkeleton
            }
        } else {
            mediaSkeleton
        }
    }

    private var mediaSkeleton: some View {
        Rectangle()
            .fill(Color(hex: "F3F4F6"))
            .overlay(
                ProgressView()
                    .tint(ForMe.textTertiary)
            )
    }

    private var dividerDot: some View {
        RoundedRectangle(cornerRadius: 0.5)
            .fill(ForMe.border)
            .frame(width: 1, height: 10)
            .padding(.horizontal, 5)
    }

    // MARK: - Date Formatting

    private func formatDate(_ date: Date?) -> String {
        guard let date = date else { return "" }
        let now = Date()
        let diff = Calendar.current.dateComponents([.day], from: date, to: now)
        let days = diff.day ?? 0

        if days == 0 { return "Today" }
        if days == 1 { return "1d ago" }
        if days < 7 { return "\(days)d ago" }
        if days < 30 { return "\(days / 7)w ago" }

        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: date)
    }
}
