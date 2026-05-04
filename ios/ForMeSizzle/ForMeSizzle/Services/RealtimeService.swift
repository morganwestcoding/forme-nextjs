import Foundation
import Combine

/// Server-Sent Events client mirroring the web's `/api/sse` consumer. The
/// stream emits five event types — see `RealtimeEventType`. The service is
/// a singleton; foreground clients subscribe to the appropriate publisher
/// and the connection auto-reconnects with exponential backoff on drops.
@MainActor
final class RealtimeService: ObservableObject {
    static let shared = RealtimeService()

    @Published private(set) var isConnected = false

    // Per-event publishers — ChatView/MessagesList/Notifications subscribe
    // to whichever match their concern. Using PassthroughSubject keeps
    // late-arriving subscribers from getting stale state.
    let messageCreated = PassthroughSubject<Message, Never>()
    let conversationUpdated = PassthroughSubject<ConversationUpdatePayload, Never>()
    let messagesRead = PassthroughSubject<String, Never>()        // conversationId
    let typing = PassthroughSubject<TypingPayload, Never>()
    let notificationCreated = PassthroughSubject<AppNotification, Never>()

    private var task: Task<Void, Never>?
    private var reconnectAttempts = 0

    #if DEBUG
    private let baseURL = "http://localhost:3000/api"
    #else
    private let baseURL = "https://yourproductiondomain.com/api"
    #endif

    private init() {}

    // MARK: - Lifecycle

    func start() {
        guard task == nil else { return }
        task = Task { [weak self] in
            await self?.runConnectionLoop()
        }
    }

    func stop() {
        task?.cancel()
        task = nil
        isConnected = false
        reconnectAttempts = 0
    }

    // MARK: - Connection loop

    private func runConnectionLoop() async {
        while !Task.isCancelled {
            do {
                try await connectOnce()
                // If the stream closed cleanly without throwing, treat it
                // like a transient disconnect and retry with backoff.
                reconnectAttempts += 1
            } catch is CancellationError {
                return
            } catch {
                reconnectAttempts += 1
            }
            isConnected = false
            let delay = backoffSeconds()
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
        }
    }

    private func backoffSeconds() -> Double {
        // 1s, 2s, 4s, … up to 30s; matches the web's default reconnect cadence.
        min(30, pow(2.0, Double(min(reconnectAttempts, 5))))
    }

    private func connectOnce() async throws {
        guard let url = URL(string: "\(baseURL)/sse"),
              let token = KeychainService.shared.getToken() else {
            throw URLError(.userAuthenticationRequired)
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("text/event-stream", forHTTPHeaderField: "Accept")
        request.timeoutInterval = .infinity

        let (bytes, response) = try await URLSession.shared.bytes(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }

        isConnected = true
        reconnectAttempts = 0

        var currentEvent: String?
        var dataLines: [String] = []

        for try await line in bytes.lines {
            if Task.isCancelled { break }

            // Server-Sent Events spec: blank line dispatches the buffered event.
            if line.isEmpty {
                if let type = currentEvent, !dataLines.isEmpty {
                    let payload = dataLines.joined(separator: "\n")
                    handle(eventType: type, payload: payload)
                }
                currentEvent = nil
                dataLines.removeAll()
                continue
            }

            // Comment lines (`: heartbeat`) — ignore.
            if line.hasPrefix(":") { continue }

            if let value = strip(prefix: "event:", from: line) {
                currentEvent = value
            } else if let value = strip(prefix: "data:", from: line) {
                dataLines.append(value)
            }
        }
    }

    private func strip(prefix: String, from line: String) -> String? {
        guard line.hasPrefix(prefix) else { return nil }
        let rest = line.dropFirst(prefix.count)
        return rest.first == " " ? String(rest.dropFirst()) : String(rest)
    }

    // MARK: - Event dispatch

    private func handle(eventType: String, payload: String) {
        guard let data = payload.data(using: .utf8) else { return }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        switch eventType {
        case "MESSAGE_CREATED":
            if let m = try? decoder.decode(Message.self, from: data) {
                messageCreated.send(m)
            }
        case "CONVERSATION_UPDATED":
            if let c = try? decoder.decode(ConversationUpdatePayload.self, from: data) {
                conversationUpdated.send(c)
            }
        case "MESSAGES_READ":
            if let p = try? decoder.decode(MessagesReadPayload.self, from: data) {
                messagesRead.send(p.conversationId)
            }
        case "TYPING":
            if let t = try? decoder.decode(TypingPayload.self, from: data) {
                typing.send(t)
            }
        case "NOTIFICATION_CREATED":
            // Web currently emits only { type, content } in the SSE payload;
            // synthesize a temporary local AppNotification so subscribers can
            // render it. The next /notifications fetch will replace it with
            // the persisted server record.
            if let full = try? decoder.decode(AppNotification.self, from: data) {
                notificationCreated.send(full)
            } else if let partial = try? decoder.decode(NotificationPartialPayload.self, from: data) {
                let synthesized = AppNotification(
                    id: "sse-\(UUID().uuidString)",
                    type: partial.type,
                    content: partial.content,
                    isRead: false,
                    createdAt: ISO8601DateFormatter().string(from: Date()),
                    userId: nil
                )
                notificationCreated.send(synthesized)
            }
        default:
            break
        }
    }
}

// MARK: - Event payloads

struct ConversationUpdatePayload: Decodable {
    let conversationId: String
    let lastMessage: LastMessageBlob?
    let lastMessageAt: String?

    struct LastMessageBlob: Decodable {
        let content: String
        let createdAt: String
        let isRead: Bool
    }
}

struct MessagesReadPayload: Decodable {
    let conversationId: String
}

struct TypingPayload: Decodable {
    let conversationId: String
    let userId: String
    let userName: String?
}

struct NotificationPartialPayload: Decodable {
    let type: String
    let content: String
}
