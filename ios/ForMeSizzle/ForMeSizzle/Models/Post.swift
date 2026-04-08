import Foundation

// MARK: - Post (matches web SafePost)

struct Post: Codable, Identifiable {
    let id: String
    var content: String?
    var imageSrc: String?
    var beforeImageSrc: String?
    var mediaUrl: String?
    var mediaType: String?
    var category: String?
    var tag: String?
    var location: String?
    var thumbnailUrl: String?
    var postType: String?  // "ad" | "text" | "reel"
    var likes: [String]?
    var bookmarks: [String]?
    var hiddenBy: [String]?
    var viewedBy: [String]?
    var comments: [Comment]?
    var userId: String?
    var user: CompactUser?
    var listing: Listing?
    var shop: Shop?
    var createdAt: String?

    // CodingKeys to handle API field name differences
    enum CodingKeys: String, CodingKey {
        case id, content, imageSrc, beforeImageSrc, mediaUrl, mediaType
        case category, tag, location, thumbnailUrl, postType
        case likes, bookmarks, hiddenBy, viewedBy, comments
        case userId, user, listing, shop, createdAt
    }

    // MARK: Computed
    var likeCount: Int { likes?.count ?? 0 }
    var commentCount: Int { comments?.count ?? 0 }
    var bookmarkCount: Int { bookmarks?.count ?? 0 }
}

// MARK: - Comment (matches web SafeComment)

struct Comment: Codable, Identifiable {
    let id: String
    var content: String
    var createdAt: String?
    var userId: String?
    var postId: String?
    var user: CompactUser?
}

struct PostsResponse: Codable {
    let posts: [Post]
    let hasMore: Bool?
}
