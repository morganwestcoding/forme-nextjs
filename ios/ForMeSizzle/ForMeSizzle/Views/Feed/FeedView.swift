import SwiftUI
import AVKit

// MARK: - Full-screen TikTok-style Feed

struct FeedView: View {
    let posts: [Post]
    var startIndex: Int = 0
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var currentIndex: Int? = 0
    @State private var selectedTab = 0
    @State private var likedPosts: Set<String> = []
    @State private var bookmarkedPosts: Set<String> = []
    @State private var showComments = false
    @State private var commentText = ""
    @State private var activeComments: [Comment] = []
    @State private var activePostId: String?
    @State private var likeCounts: [String: Int] = [:]
    @State private var commentCounts: [String: Int] = [:]
    @State private var bookmarkCounts: [String: Int] = [:]
    @State private var removedPostIds: Set<String> = []
    @State private var pendingDeletePostId: String?
    @State private var viewedPostIds: Set<String> = []

    private let screen = UIScreen.main.bounds

    private var visiblePosts: [Post] {
        posts.filter { !removedPostIds.contains($0.id) }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView(.vertical, showsIndicators: false) {
                LazyVStack(spacing: 0) {
                    ForEach(Array(visiblePosts.enumerated()), id: \.element.id) { index, post in
                        ZStack {
                            FeedCard(post: post, screenSize: screen.size, isActive: currentIndex == index)

                            // Per-card actions — centered on the right edge
                            HStack {
                                Spacer()
                                VStack(spacing: 22) {
                                    Button { dismiss() } label: {
                                        Image(systemName: "xmark")
                                            .font(.system(size: 22, weight: .semibold))
                                            .foregroundColor(.white)
                                            .frame(width: 26, height: 40)
                                            .shadow(color: .black.opacity(0.4), radius: 3, x: 0, y: 1)
                                    }
                                    ActionButton(
                                        icon: .heart,
                                        label: "\(likeCounts[post.id] ?? post.likeCount)",
                                        isActive: likedPosts.contains(post.id)
                                    ) {
                                        toggleLike(post)
                                    }
                                    ActionButton(icon: .comment, label: "\(commentCounts[post.id] ?? post.commentCount)") {
                                        activePostId = post.id
                                        activeComments = post.comments ?? []
                                        showComments = true
                                    }
                                    ActionButton(
                                        icon: .bookmark,
                                        label: "\(bookmarkCounts[post.id] ?? post.bookmarkCount)",
                                        isActive: bookmarkedPosts.contains(post.id)
                                    ) {
                                        toggleBookmark(post)
                                    }
                                    ActionButton(icon: .share, label: "Share") {
                                        sharePost(post)
                                    }

                                    Menu {
                                        if isOwnPost(post) {
                                            Button(role: .destructive) {
                                                pendingDeletePostId = post.id
                                            } label: {
                                                Label("Delete", systemImage: "trash")
                                            }
                                        } else {
                                            Button {
                                                hidePost(post)
                                            } label: {
                                                Label("Hide", systemImage: "eye.slash")
                                            }
                                        }
                                    } label: {
                                        Image(systemName: "ellipsis")
                                            .font(.system(size: 22, weight: .semibold))
                                            .foregroundColor(.white)
                                            .frame(width: 26, height: 40)
                                            .shadow(color: .black.opacity(0.4), radius: 3, x: 0, y: 1)
                                    }
                                    .menuOrder(.fixed)
                                }
                            }
                            .padding(.horizontal, ForMe.space5)
                        }
                        .frame(width: screen.width, height: screen.height)
                        .id(index)
                        .onAppear {
                            markViewed(post)
                        }
                    }
                }
                .scrollTargetLayout()
            }
            .scrollTargetBehavior(.paging)
            .scrollPosition(id: $currentIndex)
            .ignoresSafeArea()

            // Fixed top bar (doesn't scroll)
            VStack {
                FeedTabs(selectedTab: $selectedTab)
                    .padding(.horizontal, ForMe.space4)
                Spacer()
            }
            .padding(.top, 10)

            // Tab bar at bottom
            FeedTabBar(onClose: { dismiss() })
        }
        .background(.black)
        .onAppear {
            currentIndex = startIndex
            // Initialize liked/bookmarked state from current user
            let userId = authViewModel.currentUser?.id ?? ""
            for post in posts {
                if post.likes?.contains(userId) == true { likedPosts.insert(post.id) }
                if post.bookmarks?.contains(userId) == true { bookmarkedPosts.insert(post.id) }
            }
        }
        .statusBarHidden()
        .confirmationDialog(
            "Delete this post?",
            isPresented: .init(
                get: { pendingDeletePostId != nil },
                set: { if !$0 { pendingDeletePostId = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button("Delete", role: .destructive) {
                if let id = pendingDeletePostId, let post = posts.first(where: { $0.id == id }) {
                    deletePost(post)
                }
                pendingDeletePostId = nil
            }
            Button("Cancel", role: .cancel) { pendingDeletePostId = nil }
        } message: {
            Text("This can't be undone.")
        }
        .sheet(isPresented: $showComments) {
            CommentsSheet(
                postId: activePostId ?? "",
                currentUser: authViewModel.currentUser,
                onCommentAdded: {
                    if let id = activePostId {
                        let current = commentCounts[id] ?? (posts.first { $0.id == id }?.commentCount ?? 0)
                        commentCounts[id] = current + 1
                    }
                },
                comments: $activeComments,
                commentText: $commentText
            )
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
        }
    }

    // MARK: - Actions

    private func toggleLike(_ post: Post) {
        Haptics.confirm()
        let id = post.id
        let current = likeCounts[id] ?? post.likeCount
        if likedPosts.contains(id) {
            likedPosts.remove(id)
            likeCounts[id] = max(0, current - 1)
        } else {
            likedPosts.insert(id)
            likeCounts[id] = current + 1
        }
        Task {
            do {
                if likedPosts.contains(id) {
                    try await APIService.shared.addFavorite(listingId: id)
                } else {
                    try await APIService.shared.removeFavorite(listingId: id)
                }
            } catch {}
        }
    }

    private func toggleBookmark(_ post: Post) {
        Haptics.confirm()
        let id = post.id
        let current = bookmarkCounts[id] ?? post.bookmarkCount
        if bookmarkedPosts.contains(id) {
            bookmarkedPosts.remove(id)
            bookmarkCounts[id] = max(0, current - 1)
        } else {
            bookmarkedPosts.insert(id)
            bookmarkCounts[id] = current + 1
        }
        Task {
            try? await APIService.shared.bookmarkPost(postId: id)
        }
    }

    private func sharePost(_ post: Post) {
        let text = post.content ?? ""
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = windowScene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }

    private func hidePost(_ post: Post) {
        Haptics.tap()
        withAnimation(.easeOut(duration: 0.25)) {
            removedPostIds.insert(post.id)
        }
        Task { try? await APIService.shared.hidePost(id: post.id) }
    }

    private func deletePost(_ post: Post) {
        Haptics.warning()
        withAnimation(.easeOut(duration: 0.25)) {
            removedPostIds.insert(post.id)
        }
        Task { try? await APIService.shared.deletePost(id: post.id) }
    }

    private func isOwnPost(_ post: Post) -> Bool {
        guard let me = authViewModel.currentUser?.id, let author = post.userId else { return false }
        return me == author
    }

    /// Fire a single view-track call per post per session. Server is also
    /// idempotent, but skipping the request when the local flag is set saves
    /// network on the inevitable scrub-up-and-down behavior.
    private func markViewed(_ post: Post) {
        guard !viewedPostIds.contains(post.id) else { return }
        viewedPostIds.insert(post.id)
        Task { try? await APIService.shared.markPostView(id: post.id) }
    }
}

// MARK: - Comments Sheet

struct CommentsSheet: View {
    let postId: String
    let currentUser: User?
    var onCommentAdded: (() -> Void)? = nil
    @Binding var comments: [Comment]
    @Binding var commentText: String
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Comments list
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: ForMe.space4) {
                        if comments.isEmpty {
                            Text("No comments yet")
                                .font(ForMe.font(.regular, size: 14))
                                .foregroundColor(ForMe.textTertiary)
                                .frame(maxWidth: .infinity)
                                .padding(.top, 40)
                        } else {
                            ForEach(comments) { comment in
                                HStack(alignment: .top, spacing: 10) {
                                    DynamicAvatar(
                                        name: comment.user?.name ?? "User",
                                        imageUrl: comment.user?.image,
                                        size: .small
                                    )
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(comment.user?.name ?? "User")
                                            .font(ForMe.font(.semibold, size: 13))
                                            .foregroundColor(ForMe.textPrimary)
                                        Text(comment.content)
                                            .font(ForMe.font(.regular, size: 14))
                                            .foregroundColor(ForMe.textSecondary)
                                            .lineSpacing(2)
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                }

                // Input bar
                Divider()
                HStack(spacing: 10) {
                    TextField("Add a comment...", text: $commentText)
                        .font(ForMe.font(.regular, size: 14))
                        .focused($isFocused)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(ForMe.stone100)
                        .clipShape(Capsule())

                    Button {
                        submitComment()
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(commentText.isEmpty ? ForMe.stone300 : ForMe.stone900)
                    }
                    .disabled(commentText.isEmpty)
                }
                .padding(.horizontal)
                .padding(.vertical, 10)
            }
            .navigationTitle("Comments")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func submitComment() {
        let text = commentText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        commentText = ""

        // Optimistic: add comment locally with current user info
        let localComment = Comment(
            id: UUID().uuidString,
            content: text,
            createdAt: nil,
            userId: currentUser?.id,
            postId: postId,
            user: CompactUser(
                id: currentUser?.id ?? "",
                name: currentUser?.name,
                image: currentUser?.image
            )
        )
        comments.append(localComment)
        onCommentAdded?()

        Task {
            _ = try? await APIService.shared.commentOnPost(postId: postId, content: text)
        }
    }
}

// MARK: - Feed Tabs (For You / Recommended)

private struct FeedTabs: View {
    @Binding var selectedTab: Int
    @Namespace private var ns

    private let tabs = ["For You", "Recommended"]

    var body: some View {
        HStack(spacing: 20) {
            ForEach(Array(tabs.enumerated()), id: \.offset) { index, title in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = index
                    }
                } label: {
                    VStack(spacing: 6) {
                        Text(title)
                            .font(ForMe.font(selectedTab == index ? .bold : .medium, size: 15))
                            .foregroundColor(selectedTab == index ? .white : .white.opacity(0.5))
                            .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)

                        // Underline indicator
                        if selectedTab == index {
                            Capsule()
                                .fill(.white)
                                .frame(width: 24, height: 2.5)
                                .matchedGeometryEffect(id: "feedTab", in: ns)
                        } else {
                            Capsule()
                                .fill(.clear)
                                .frame(width: 24, height: 2.5)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Feed Tab Bar (dark style for full-screen feed)

private struct FeedTabBar: View {
    let onClose: () -> Void

    private let tabs = [
        ("TabDiscover", "Discover"),
        ("TabSearch", "Search"),
        ("TabMaps", "Maps"),
        ("TabBooking", "Bookings"),
        ("TabVendors", "Shops"),
    ]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(tabs, id: \.1) { icon, label in
                Button {
                    onClose()
                } label: {
                    VStack(spacing: 4) {
                        Image(icon)
                            .renderingMode(.template)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 22, height: 22)
                        Text(label)
                            .font(ForMe.font(.medium, size: 10))
                    }
                    .foregroundColor(.white.opacity(0.6))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
            }
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .fill(.ultraThinMaterial.opacity(0.3))
                .shadow(color: .black.opacity(0.3), radius: 16, x: 0, y: 4)
        )
        .padding(.horizontal, ForMe.space4)
        .padding(.bottom, ForMe.space2)
    }
}

// MARK: - Side Action Button (uses custom icons matching web)

private struct ActionButton: View {
    let icon: FeedIcon
    let label: String
    var isActive: Bool = false
    let action: () -> Void

    enum FeedIcon {
        case heart, comment, bookmark, share
    }

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                iconView
                    .frame(width: 26, height: 26)
                    .shadow(color: .black.opacity(0.4), radius: 3, x: 0, y: 1)

                Text(label)
                    .font(ForMe.font(.regular, size: 11))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.4), radius: 2, x: 0, y: 1)
            }
        }
    }

    @ViewBuilder
    private var iconView: some View {
        switch icon {
        case .heart:
            if isActive {
                Image(systemName: "heart.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.red)
            } else {
                HugeIcon(paths: ["M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"])
            }
        case .comment:
            HugeIcon(paths: [
                "M8 13.5H16M8 8.5H12",
                "M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19"
            ])
        case .bookmark:
            if isActive {
                Image(systemName: "bookmark.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.white)
            } else {
                HugeIcon(paths: ["M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z"])
            }
        case .share:
            HugeIcon(paths: [
                "M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963",
                "M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13"
            ])
        }
    }
}

// MARK: - SVG Path Parser (legacy location — CGPath extension now in HugeIcon.swift)

#if false
extension CGPath {
    static func from(svgPath: String) -> CGPath? {
        let path = CGMutablePath()
        let scanner = Scanner(string: svgPath)
        scanner.charactersToBeSkipped = CharacterSet.whitespaces.union(.init(charactersIn: ","))

        var currentPoint = CGPoint.zero
        var lastCommand: Character = "M"

        while !scanner.isAtEnd {
            var cmd: NSString?
            let cmdChars = CharacterSet(charactersIn: "MmLlHhVvCcSsQqTtAaZz")
            if scanner.scanCharacters(from: cmdChars, into: &cmd), let c = cmd as String?, let first = c.first {
                lastCommand = first
            }

            switch lastCommand {
            case "M":
                if let x = scanner.scanDouble(), let y = scanner.scanDouble() {
                    path.move(to: CGPoint(x: x, y: y))
                    currentPoint = CGPoint(x: x, y: y)
                    lastCommand = "L"
                }
            case "m":
                if let dx = scanner.scanDouble(), let dy = scanner.scanDouble() {
                    let p = CGPoint(x: currentPoint.x + dx, y: currentPoint.y + dy)
                    path.move(to: p)
                    currentPoint = p
                    lastCommand = "l"
                }
            case "L":
                if let x = scanner.scanDouble(), let y = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: x, y: y))
                    currentPoint = CGPoint(x: x, y: y)
                }
            case "l":
                if let dx = scanner.scanDouble(), let dy = scanner.scanDouble() {
                    let p = CGPoint(x: currentPoint.x + dx, y: currentPoint.y + dy)
                    path.addLine(to: p)
                    currentPoint = p
                }
            case "H":
                if let x = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: x, y: currentPoint.y))
                    currentPoint.x = x
                }
            case "h":
                if let dx = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: currentPoint.x + dx, y: currentPoint.y))
                    currentPoint.x += dx
                }
            case "V":
                if let y = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: currentPoint.x, y: y))
                    currentPoint.y = y
                }
            case "v":
                if let dy = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: currentPoint.x, y: currentPoint.y + dy))
                    currentPoint.y += dy
                }
            case "C":
                if let x1 = scanner.scanDouble(), let y1 = scanner.scanDouble(),
                   let x2 = scanner.scanDouble(), let y2 = scanner.scanDouble(),
                   let x = scanner.scanDouble(), let y = scanner.scanDouble() {
                    path.addCurve(to: CGPoint(x: x, y: y), control1: CGPoint(x: x1, y: y1), control2: CGPoint(x: x2, y: y2))
                    currentPoint = CGPoint(x: x, y: y)
                }
            case "c":
                if let dx1 = scanner.scanDouble(), let dy1 = scanner.scanDouble(),
                   let dx2 = scanner.scanDouble(), let dy2 = scanner.scanDouble(),
                   let dx = scanner.scanDouble(), let dy = scanner.scanDouble() {
                    let p = CGPoint(x: currentPoint.x + dx, y: currentPoint.y + dy)
                    path.addCurve(to: p,
                                  control1: CGPoint(x: currentPoint.x + dx1, y: currentPoint.y + dy1),
                                  control2: CGPoint(x: currentPoint.x + dx2, y: currentPoint.y + dy2))
                    currentPoint = p
                }
            case "Z", "z":
                path.closeSubpath()
            default:
                break
            }
        }
        return path
    }
}
#endif

// MARK: - Individual Feed Card (full screen)

struct FeedCard: View {
    let post: Post
    let screenSize: CGSize
    var isActive: Bool = true

    private var isTextPost: Bool { post.imageSrc == nil && post.mediaUrl == nil }
    private var isVideo: Bool { post.isVideoPost }
    private var videoURL: URL? {
        guard isVideo else { return nil }
        if let m = post.mediaUrl, let u = URL(string: m) { return u }
        if let i = post.imageSrc, let u = URL(string: i) { return u }
        return nil
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black
            mediaContent
                .frame(width: screenSize.width, height: screenSize.height)
                .contentShape(Rectangle())
                .clipped()

            // Bottom gradient
            if !isTextPost {
                LinearGradient(
                    stops: [
                        .init(color: .clear, location: 0.4),
                        .init(color: .black.opacity(0.4), location: 0.7),
                        .init(color: .black.opacity(0.8), location: 1.0),
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: screenSize.height * 0.5)
                .frame(maxHeight: .infinity, alignment: .bottom)
            }

            // Bottom info
            VStack(alignment: .leading, spacing: 10) {
                if let user = post.user {
                    HStack(spacing: 10) {
                        DynamicAvatar(name: user.name ?? "User", imageUrl: user.image, size: .smallMedium)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(user.name ?? "Anonymous")
                                .font(ForMe.font(.semibold, size: 15))
                                .foregroundColor(.white)
                            Text(formatDate(post.createdAt))
                                .font(ForMe.font(.regular, size: 12))
                                .foregroundColor(.white.opacity(0.7))
                        }
                    }
                }
                if let content = post.content, !content.isEmpty {
                    Text(content)
                        .font(ForMe.font(.regular, size: 14))
                        .foregroundColor(.white.opacity(0.9))
                        .lineLimit(3)
                        .lineSpacing(3)
                }
            }
            .padding(.horizontal, ForMe.space4)
            .padding(.bottom, 130)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(width: screenSize.width, height: screenSize.height)
        .clipped()
    }

    @ViewBuilder
    private var mediaContent: some View {
        if isTextPost {
            ZStack {
                LinearGradient(
                    colors: [Color(hex: "1a1a1a"), Color(hex: "262626"), Color(hex: "1a1a1a")],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                )
                Text("\u{201C}")
                    .font(.system(size: 60, design: .serif))
                    .foregroundColor(.white.opacity(0.1))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.leading, 24).padding(.top, 80)
                Text(post.content ?? "")
                    .font(ForMe.font(.medium, size: 22))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .lineSpacing(6).padding(40)
            }
        } else if let url = videoURL {
            // Thumbnail behind the player so a slow-loading or failed video
            // shows a still frame instead of a silent black rectangle.
            ZStack {
                VideoThumbnail(url: url)
                FeedVideoPlayer(url: url, isActive: isActive)
            }
        } else if let imageUrl = post.imageSrc ?? post.mediaUrl ?? post.thumbnailUrl {
            AsyncImage(url: URL(string: imageUrl)) { phase in
                switch phase {
                case .success(let image): image.resizable().aspectRatio(contentMode: .fill)
                default: Rectangle().fill(Color(hex: "1a1a1a")).overlay(ProgressView().tint(.white.opacity(0.5)))
                }
            }
        } else {
            Rectangle().fill(Color(hex: "1a1a1a"))
        }
    }

    private func formatDate(_ dateStr: String?) -> String {
        guard let dateStr = dateStr else { return "" }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = iso.date(from: dateStr) else { return "" }
        let days = Calendar.current.dateComponents([.day], from: date, to: Date()).day ?? 0
        if days == 0 { return "Today" }
        if days == 1 { return "1d ago" }
        if days < 7 { return "\(days)d ago" }
        if days < 30 { return "\(days / 7)w ago" }
        let f = DateFormatter()
        f.dateFormat = "MMM d"
        return f.string(from: date)
    }
}

// MARK: - Video Player (looping, muted, auto-play)
//
// Uses AVPlayerLayer directly so there's no AVPlayerViewController UI
// that can show its own play/pause overlay.

final class FeedVideoPlayerView: UIView {
    override class var layerClass: AnyClass { AVPlayerLayer.self }
    var playerLayer: AVPlayerLayer { layer as! AVPlayerLayer }

    var shouldPlayWhenVisible: Bool = true

    var player: AVPlayer? {
        get { playerLayer.player }
        set {
            playerLayer.player = newValue
            playerLayer.videoGravity = .resizeAspectFill
        }
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        // Kick off playback once the view is actually in the hierarchy.
        // AVPlayer will silently ignore play() calls made before attachment on
        // the first card, leaving it paused until user interaction.
        if window != nil, shouldPlayWhenVisible, let player, player.rate == 0 {
            player.play()
        }
    }
}

struct FeedVideoPlayer: UIViewRepresentable {
    let url: URL
    let isActive: Bool

    init(url: URL, isActive: Bool = true) {
        self.url = url
        self.isActive = isActive
    }

    func makeUIView(context: Context) -> FeedVideoPlayerView {
        try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .moviePlayback, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true)

        // Cloudinary stores videos in their uploaded format (often WebM/VP9
        // from browsers). AVPlayer can't decode those, so force H.264/MP4.
        let playbackURL = avPlayerCompatibleURL(from: url)
        let item = AVPlayerItem(url: playbackURL)
        let player = AVQueuePlayer(playerItem: item)
        player.isMuted = true
        // Default automaticallyWaitsToMinimizeStalling = true — let AVPlayer
        // wait for the buffer to fill then start. Setting this to false would
        // cause play() to be silently ignored when the buffer is empty,
        // which happens on the first card before anything has been buffered.
        player.actionAtItemEnd = .none

        context.coordinator.looper = AVPlayerLooper(player: player, templateItem: item)
        context.coordinator.player = player
        context.coordinator.shouldPlayProvider = { isActive }
        context.coordinator.startObserving()

        let view = FeedVideoPlayerView()
        view.backgroundColor = .black
        view.player = player
        view.shouldPlayWhenVisible = isActive
        if isActive { player.play() }
        return view
    }

    func updateUIView(_ view: FeedVideoPlayerView, context: Context) {
        guard let player = context.coordinator.player else { return }
        view.shouldPlayWhenVisible = isActive
        context.coordinator.shouldPlayProvider = { isActive }
        if isActive {
            player.play()
        } else {
            player.pause()
            player.seek(to: .zero)
        }
    }

    static func dismantleUIView(_ view: FeedVideoPlayerView, coordinator: Coordinator) {
        coordinator.teardown()
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator {
        var player: AVQueuePlayer?
        var looper: AVPlayerLooper?
        var shouldPlayProvider: () -> Bool = { true }
        private var itemObservation: NSKeyValueObservation?
        private var statusObservation: NSKeyValueObservation?
        private var rateObservation: NSKeyValueObservation?

        func startObserving() {
            guard let player else { return }

            // When AVPlayerLooper swaps the current item, re-bind the status
            // observer to the new item.
            itemObservation = player.observe(\.currentItem, options: [.initial, .new]) { [weak self] _, _ in
                self?.bindStatusObserver()
            }

            // If timeControlStatus goes to .waitingToPlay or .paused while we
            // want to be playing, retry play() — unless the current item is
            // in a failed state (would spin forever).
            rateObservation = player.observe(\.timeControlStatus, options: [.new]) { [weak self] player, _ in
                guard let self, self.shouldPlayProvider() else { return }
                if player.currentItem?.status == .failed { return }
                if player.timeControlStatus != .playing {
                    DispatchQueue.main.async { player.play() }
                }
            }
        }

        private func bindStatusObserver() {
            statusObservation?.invalidate()
            guard let item = player?.currentItem else { return }
            statusObservation = item.observe(\.status, options: [.initial, .new]) { [weak self] item, _ in
                guard let self else { return }
                if item.status == .failed, let err = item.error {
                    print("[FeedVideoPlayer] item failed: \(err.localizedDescription) — url: \(((item.asset as? AVURLAsset)?.url.absoluteString ?? "?"))")
                    return
                }
                guard item.status == .readyToPlay else { return }
                DispatchQueue.main.async {
                    if self.shouldPlayProvider(), let player = self.player {
                        player.play()
                    }
                }
            }
        }

        func teardown() {
            itemObservation?.invalidate()
            statusObservation?.invalidate()
            rateObservation?.invalidate()
            itemObservation = nil
            statusObservation = nil
            rateObservation = nil
            player?.pause()
            player = nil
            looper = nil
        }
    }
}

// MARK: - Previews

#Preview("Feed") {
    FeedView(posts: [
        Post(id: "1", content: "Fresh cut vibes", imageSrc: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800", likes: ["a", "b", "c"], comments: [Comment(id: "c1", content: "Fire")], user: CompactUser(id: "u1", name: "Marcus J.")),
        Post(id: "2", content: "Every artist was first an amateur. Keep pushing, keep growing, keep creating.", likes: ["a"], user: CompactUser(id: "u2", name: "Sarah C.")),
        Post(id: "3", content: "New setup at the studio", imageSrc: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800", likes: ["a", "b"], comments: [Comment(id: "c2", content: "Nice"), Comment(id: "c3", content: "Wow")], user: CompactUser(id: "u3", name: "Angela W.")),
    ])
    .environmentObject(AuthViewModel())
}
