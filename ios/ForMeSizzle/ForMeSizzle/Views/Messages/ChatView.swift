import SwiftUI

struct ChatView: View {
    let conversation: Conversation
    @StateObject private var viewModel = ChatViewModel()
    @State private var messageText = ""
    @FocusState private var isInputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(viewModel.messages) { message in
                            MessageBubble(
                                message: message,
                                isCurrentUser: message.senderId != conversation.otherUser?.id
                            )
                            .id(message.id)
                        }
                    }
                    .padding()
                }
                .background(ForMe.background)
                .onChange(of: viewModel.messages.count) { _, _ in
                    if let lastMessage = viewModel.messages.last {
                        withAnimation {
                            proxy.scrollTo(lastMessage.id, anchor: .bottom)
                        }
                    }
                }
            }

            Divider()
                .foregroundColor(ForMe.border)

            // Input
            HStack(spacing: 12) {
                TextField("Message...", text: $messageText, axis: .vertical)
                    .lineLimit(1...4)
                    .padding(12)
                    .background(ForMe.inputBg)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
                    .cornerRadius(20)
                    .focused($isInputFocused)

                Button {
                    Task {
                        let text = messageText
                        messageText = ""
                        await viewModel.sendMessage(
                            conversationId: conversation.id,
                            content: text
                        )
                    }
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title)
                        .foregroundColor(messageText.isEmpty ? ForMe.textTertiary : ForMe.accent)
                }
                .disabled(messageText.isEmpty)
            }
            .padding()
            .background(ForMe.surface)
        }
        .navigationTitle(conversation.otherUser?.name ?? "Chat")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadMessages(conversationId: conversation.id)
        }
    }
}

struct MessageBubble: View {
    let message: Message
    let isCurrentUser: Bool

    var body: some View {
        HStack {
            if isCurrentUser { Spacer(minLength: 60) }

            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .font(.subheadline)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(isCurrentUser ? ForMe.chatSent : ForMe.chatReceived)
                    .foregroundColor(isCurrentUser ? .white : ForMe.textPrimary)
                    .clipShape(ChatBubbleShape(isCurrentUser: isCurrentUser))

                if let date = message.createdAt {
                    Text(date, style: .time)
                        .font(.caption2)
                        .foregroundColor(ForMe.textTertiary)
                }
            }

            if !isCurrentUser { Spacer(minLength: 60) }
        }
    }
}

// Custom chat bubble shape with flat corner
struct ChatBubbleShape: Shape {
    let isCurrentUser: Bool

    func path(in rect: CGRect) -> Path {
        let radius: CGFloat = 18
        let smallRadius: CGFloat = 4
        return Path { path in
            let tl = isCurrentUser ? radius : radius
            let tr = isCurrentUser ? radius : radius
            let bl = isCurrentUser ? radius : smallRadius
            let br = isCurrentUser ? smallRadius : radius

            path.move(to: CGPoint(x: rect.minX + tl, y: rect.minY))
            path.addLine(to: CGPoint(x: rect.maxX - tr, y: rect.minY))
            path.addArc(center: CGPoint(x: rect.maxX - tr, y: rect.minY + tr), radius: tr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - br))
            path.addArc(center: CGPoint(x: rect.maxX - br, y: rect.maxY - br), radius: br, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
            path.addLine(to: CGPoint(x: rect.minX + bl, y: rect.maxY))
            path.addArc(center: CGPoint(x: rect.minX + bl, y: rect.maxY - bl), radius: bl, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
            path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + tl))
            path.addArc(center: CGPoint(x: rect.minX + tl, y: rect.minY + tl), radius: tl, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        }
    }
}

#Preview {
    NavigationStack {
        ChatView(conversation: Conversation(
            id: "1",
            userIds: ["1", "2"]
        ))
    }
}
