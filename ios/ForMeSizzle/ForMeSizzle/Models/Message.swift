import Foundation

// MARK: - Conversation (matches web SafeConversation)

struct Conversation: Codable, Identifiable, Hashable {
    static func == (lhs: Conversation, rhs: Conversation) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    var userIds: [String]?
    var users: [User]?
    var messages: [Message]?
    var lastMessageAt: String?
    var otherUser: CompactUser?
    var lastMessage: LastMessage?

    struct LastMessage: Codable, Hashable {
        var content: String
        var createdAt: String
        var isRead: Bool
    }
}

// MARK: - Message (matches web SafeMessage)

struct Message: Codable, Identifiable, Hashable {
    let id: String
    var content: String
    var senderId: String
    var conversationId: String?
    var isRead: Bool?
    var createdAt: String?
    var sender: CompactUser?
}

struct SendMessageRequest: Codable {
    var conversationId: String?
    var recipientId: String?
    let content: String
}
