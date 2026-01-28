import SwiftUI

@MainActor
class MessagesViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func loadConversations() async {
        isLoading = true
        do {
            conversations = try await api.getConversations()
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func loadMessages(conversationId: String) async {
        isLoading = true
        do {
            messages = try await api.getMessages(conversationId: conversationId)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func sendMessage(conversationId: String, content: String) async {
        guard !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        do {
            let message = try await api.sendMessage(
                conversationId: conversationId,
                recipientId: nil,
                content: content
            )
            messages.append(message)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
