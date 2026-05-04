import SwiftUI

struct ChatView: View {
    let conversation: Conversation
    @StateObject private var viewModel = ChatViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var messageText = ""
    @State private var typingUserName: String?
    @State private var typingClearTask: Task<Void, Never>?
    @State private var lastTypingPingAt: Date = .distantPast
    @FocusState private var isInputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView(showsIndicators: false) {
                    LazyVStack(spacing: 4) {
                        ForEach(viewModel.messages) { message in
                            let isMe = message.senderId == authViewModel.currentUser?.id
                            MessageBubble(
                                message: message,
                                isCurrentUser: isMe,
                                otherUser: conversation.otherUser
                            )
                            .id(message.id)
                        }

                        if let name = typingUserName {
                            TypingBubble(name: name, otherUser: conversation.otherUser)
                                .id("typing-indicator")
                                .transition(.opacity.combined(with: .move(edge: .bottom)))
                        }
                    }
                    .padding(.horizontal, ForMe.space3)
                    .padding(.vertical, ForMe.space4)
                }
                .background(ForMe.background)
                .onChange(of: viewModel.messages.count) { _, _ in
                    if let last = viewModel.messages.last {
                        withAnimation(.easeOut(duration: 0.2)) {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
                .onChange(of: typingUserName) { _, newValue in
                    if newValue != nil {
                        withAnimation(.easeOut(duration: 0.2)) {
                            proxy.scrollTo("typing-indicator", anchor: .bottom)
                        }
                    }
                }
                .onTapGesture {
                    isInputFocused = false
                }
            }

            // Input bar
            VStack(spacing: 0) {
                Divider()
                HStack(spacing: 10) {
                    TextField("Message...", text: $messageText, axis: .vertical)
                        .lineLimit(1...4)
                        .font(ForMe.font(.regular, size: 15))
                        .focused($isInputFocused)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(ForMe.stone100)
                        .clipShape(Capsule())
                        .overlay(
                            Capsule().stroke(ForMe.borderLight, lineWidth: 1)
                        )

                    Button {
                        sendMessage()
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 32))
                            .foregroundColor(messageText.trimmingCharacters(in: .whitespaces).isEmpty ? ForMe.stone300 : ForMe.stone900)
                    }
                    .disabled(messageText.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding(.horizontal, ForMe.space3)
                .padding(.vertical, ForMe.space2)
            }
            .background(ForMe.surface)
        }
        .toolbar {
            ToolbarItem(placement: .principal) {
                HStack(spacing: 10) {
                    DynamicAvatar(
                        name: conversation.otherUser?.name ?? "User",
                        imageUrl: conversation.otherUser?.image,
                        size: .small
                    )
                    Text(conversation.otherUser?.name ?? "Chat")
                        .font(ForMe.font(.semibold, size: 16))
                        .foregroundColor(ForMe.textPrimary)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadMessages(conversationId: conversation.id)
            try? await APIService.shared.markConversationRead(conversationId: conversation.id)
        }
        .onChange(of: messageText) { _, newValue in
            handleTypingChange(text: newValue)
        }
        .onReceive(RealtimeService.shared.messageCreated) { incoming in
            guard incoming.conversationId == conversation.id else { return }
            // Skip our own optimistic add — it's already in the list.
            guard incoming.senderId != authViewModel.currentUser?.id else { return }
            guard !viewModel.messages.contains(where: { $0.id == incoming.id }) else { return }
            viewModel.messages.append(incoming)
            Task { try? await APIService.shared.markConversationRead(conversationId: conversation.id) }
        }
        .onReceive(RealtimeService.shared.messagesRead) { conversationId in
            guard conversationId == conversation.id else { return }
            for index in viewModel.messages.indices where viewModel.messages[index].senderId == authViewModel.currentUser?.id {
                viewModel.messages[index].isRead = true
            }
        }
        .onReceive(RealtimeService.shared.typing) { event in
            guard event.conversationId == conversation.id else { return }
            guard event.userId != authViewModel.currentUser?.id else { return }
            withAnimation(.easeOut(duration: 0.2)) {
                typingUserName = event.userName ?? conversation.otherUser?.name ?? "Someone"
            }
            typingClearTask?.cancel()
            typingClearTask = Task {
                try? await Task.sleep(nanoseconds: 3_000_000_000)
                if !Task.isCancelled {
                    withAnimation(.easeOut(duration: 0.2)) {
                        typingUserName = nil
                    }
                }
            }
        }
    }

    /// Send a typing ping at most once every 3s while the user is composing,
    /// matching web's debounced behavior.
    private func handleTypingChange(text: String) {
        guard !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        let now = Date()
        guard now.timeIntervalSince(lastTypingPingAt) > 3 else { return }
        lastTypingPingAt = now
        Task {
            try? await APIService.shared.sendTypingPing(conversationId: conversation.id)
        }
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        messageText = ""

        // Optimistic local add
        let localMsg = Message(
            id: UUID().uuidString,
            content: text,
            senderId: authViewModel.currentUser?.id ?? "",
            conversationId: conversation.id,
            isRead: false,
            createdAt: ISO8601DateFormatter().string(from: Date()),
            sender: CompactUser(
                id: authViewModel.currentUser?.id ?? "",
                name: authViewModel.currentUser?.name,
                image: authViewModel.currentUser?.image
            )
        )
        viewModel.messages.append(localMsg)

        Task {
            await viewModel.sendMessage(conversationId: conversation.id, content: text)
        }
    }
}

// MARK: - Typing Bubble

struct TypingBubble: View {
    let name: String
    var otherUser: CompactUser?

    @State private var phase: Int = 0

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            DynamicAvatar(
                name: otherUser?.name ?? name,
                imageUrl: otherUser?.image,
                size: .tiny
            )
            .padding(.bottom, 2)

            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { dot in
                    Circle()
                        .fill(ForMe.stone400)
                        .frame(width: 6, height: 6)
                        .scaleEffect(phase == dot ? 1.0 : 0.6)
                        .opacity(phase == dot ? 1.0 : 0.5)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(ForMe.stone100)
            .clipShape(ChatBubbleShape(isCurrentUser: false))

            Spacer(minLength: 50)
        }
        .padding(.vertical, 2)
        .onAppear {
            withAnimation(.easeInOut(duration: 0.6).repeatForever(autoreverses: false)) {
                phase = (phase + 1) % 3
            }
            // The above only animates one transition; drive a timer for the
            // chained dots so each dot rises in sequence.
            Task {
                while !Task.isCancelled {
                    try? await Task.sleep(nanoseconds: 350_000_000)
                    withAnimation(.easeInOut(duration: 0.3)) {
                        phase = (phase + 1) % 3
                    }
                }
            }
        }
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {
    let message: Message
    let isCurrentUser: Bool
    var otherUser: CompactUser? = nil

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if isCurrentUser { Spacer(minLength: 50) }

            if !isCurrentUser {
                DynamicAvatar(
                    name: otherUser?.name ?? "User",
                    imageUrl: otherUser?.image,
                    size: .tiny
                )
                .padding(.bottom, 2)
            }

            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 3) {
                Text(message.content)
                    .font(ForMe.font(.regular, size: 15))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(isCurrentUser ? ForMe.stone900 : ForMe.stone100)
                    .foregroundColor(isCurrentUser ? .white : ForMe.textPrimary)
                    .clipShape(ChatBubbleShape(isCurrentUser: isCurrentUser))

                if let dateStr = message.createdAt {
                    Text(formatTime(dateStr))
                        .font(ForMe.font(.regular, size: 10))
                        .foregroundColor(ForMe.stone400)
                        .padding(.horizontal, 4)
                }
            }

            if !isCurrentUser { Spacer(minLength: 50) }
        }
        .padding(.vertical, 2)
    }

    private func formatTime(_ dateStr: String) -> String {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = iso.date(from: dateStr) else { return "" }
        let f = DateFormatter()
        f.dateFormat = "h:mm a"
        return f.string(from: date)
    }
}

// MARK: - Chat Bubble Shape

struct ChatBubbleShape: Shape {
    let isCurrentUser: Bool

    func path(in rect: CGRect) -> Path {
        let r: CGFloat = 18
        let sr: CGFloat = 4
        return Path { p in
            let tl = r, tr = r
            let bl: CGFloat = isCurrentUser ? r : sr
            let br: CGFloat = isCurrentUser ? sr : r

            p.move(to: CGPoint(x: rect.minX + tl, y: rect.minY))
            p.addLine(to: CGPoint(x: rect.maxX - tr, y: rect.minY))
            p.addArc(center: CGPoint(x: rect.maxX - tr, y: rect.minY + tr), radius: tr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - br))
            p.addArc(center: CGPoint(x: rect.maxX - br, y: rect.maxY - br), radius: br, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
            p.addLine(to: CGPoint(x: rect.minX + bl, y: rect.maxY))
            p.addArc(center: CGPoint(x: rect.minX + bl, y: rect.maxY - bl), radius: bl, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
            p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + tl))
            p.addArc(center: CGPoint(x: rect.minX + tl, y: rect.minY + tl), radius: tl, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        }
    }
}

#Preview {
    NavigationStack {
        ChatView(conversation: Conversation(id: "1", otherUser: CompactUser(id: "2", name: "Sarah Chen")))
            .environmentObject(AuthViewModel())
    }
}
