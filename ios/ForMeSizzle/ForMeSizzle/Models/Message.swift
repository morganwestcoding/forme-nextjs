import Foundation

struct Conversation: Codable, Identifiable, Hashable {
    let id: String
    var userIds: [String]
    var users: [User]?
    var messages: [Message]?
    var lastMessageAt: Date?

    var lastMessage: Message? {
        return messages?.last
    }

    var otherUser: User? {
        return users?.first
    }

    func otherUser(currentUserId: String) -> User? {
        return users?.first { $0.id != currentUserId }
    }

    static func == (lhs: Conversation, rhs: Conversation) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

struct Message: Codable, Identifiable {
    let id: String
    var content: String
    var senderId: String
    var conversationId: String
    var isRead: Bool?
    var createdAt: Date?

    var sender: User?

    enum CodingKeys: String, CodingKey {
        case id, content, senderId, conversationId, isRead, createdAt, sender
    }
}

struct SendMessageRequest: Codable {
    let conversationId: String?
    let recipientId: String?
    let content: String
}
