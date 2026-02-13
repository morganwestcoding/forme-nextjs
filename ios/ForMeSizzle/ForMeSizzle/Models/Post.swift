import Foundation

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
        case likeIds = "likes"
        case bookmarkIds = "bookmarks"
        case comments
        case userId, user, createdAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        content = try container.decodeIfPresent(String.self, forKey: .content)
        imageSrc = try container.decodeIfPresent(String.self, forKey: .imageSrc)
        beforeImageSrc = try container.decodeIfPresent(String.self, forKey: .beforeImageSrc)
        mediaUrl = try container.decodeIfPresent(String.self, forKey: .mediaUrl)
        mediaType = try container.decodeIfPresent(String.self, forKey: .mediaType)
        category = try container.decodeIfPresent(String.self, forKey: .category)
        tag = try container.decodeIfPresent(String.self, forKey: .tag)
        location = try container.decodeIfPresent(String.self, forKey: .location)
        likeIds = try container.decodeIfPresent([String].self, forKey: .likeIds)
        bookmarkIds = try container.decodeIfPresent([String].self, forKey: .bookmarkIds)
        comments = try? container.decodeIfPresent([Comment].self, forKey: .comments)
        userId = try container.decode(String.self, forKey: .userId)
        user = try? container.decodeIfPresent(User.self, forKey: .user)
        createdAt = try? container.decodeIfPresent(Date.self, forKey: .createdAt)
    }

    var likeCount: Int {
        return likeIds?.count ?? 0
    }

    var commentCount: Int {
        return comments?.count ?? 0
    }
}

struct Comment: Codable, Identifiable {
    let id: String
    var content: String
    var userId: String
    var user: User?
    var createdAt: Date?

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        content = try container.decode(String.self, forKey: .content)
        userId = try container.decode(String.self, forKey: .userId)
        user = try? container.decodeIfPresent(User.self, forKey: .user)
        createdAt = try? container.decodeIfPresent(Date.self, forKey: .createdAt)
    }
}

struct PostsResponse: Codable {
    let posts: [Post]
    let hasMore: Bool?
}
