import Foundation

struct AppNotification: Codable, Identifiable {
    let id: String
    var type: String
    var content: String
    var isRead: Bool
    var createdAt: String?
    var userId: String?
}
