import Foundation

struct Post: Codable, Identifiable {
    let id: String
    var content: String?
    var imageSrc: String?
    var beforeImageSrc: String?
    var mediaUrl: String?
    var mediaType: MediaType?

    var category: String?
    var tag: String?
    var location: String?

    var likeIds: [String]?
    var bookmarkIds: [String]?
    var comments: [Comment]?

    var userId: String
    var user: User?

    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, content, imageSrc, beforeImageSrc
        case mediaUrl, mediaType
        case category, tag, location
        case likeIds, bookmarkIds, comments
        case userId, user, createdAt
    }

    var isLiked: Bool {
        guard let likes = likeIds else { return false }
        // Would check against current user ID
        return false
    }

    var likeCount: Int {
        return likeIds?.count ?? 0
    }

    var commentCount: Int {
        return comments?.count ?? 0
    }
}

enum MediaType: String, Codable {
    case image, video, reel
}

struct Comment: Codable, Identifiable {
    let id: String
    var content: String
    var userId: String
    var user: User?
    var createdAt: Date?
}

struct PostsResponse: Codable {
    let posts: [Post]
    let hasMore: Bool?
}
