import Foundation

struct Conversation: Codable, Identifiable {
    let id: String
    var userIds: [String]
    var users: [User]?
    var messages: [Message]?
    var lastMessageAt: Date?

    var lastMessage: Message? {
        return messages?.last
    }

    func otherUser(currentUserId: String) -> User? {
        return users?.first { $0.id != currentUserId }
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
