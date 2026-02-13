import SwiftUI

struct MessagesListView: View {
    @StateObject private var viewModel = MessagesViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ForMeLoader(size: .medium)
            } else if viewModel.conversations.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 40))
                        .foregroundColor(ForMe.textTertiary)
                    Text("No messages yet")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(ForMe.textSecondary)
                    Text("Your conversations will appear here")
                        .font(.caption)
                        .foregroundColor(ForMe.textTertiary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                ScrollView {
                    LazyVStack(spacing: 2) {
                        ForEach(Array(viewModel.conversations.enumerated()), id: \.element.id) { index, conversation in
                            NavigationLink(value: conversation) {
                                ConversationRow(conversation: conversation)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index)
                        }
                    }
                }
            }
        }
        .background(ForMe.background)
        .navigationTitle("Messages")
        .navigationDestination(for: Conversation.self) { conversation in
            ChatView(conversation: conversation)
        }
        .refreshable {
            await viewModel.loadConversations()
        }
        .task {
            await viewModel.loadConversations()
        }
    }
}

struct ConversationRow: View {
    let conversation: Conversation

    var body: some View {
        HStack(spacing: 14) {
            DynamicAvatar(
                name: conversation.otherUser?.name ?? "User",
                imageUrl: conversation.otherUser?.image,
                size: .medium
            )

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.otherUser?.name ?? "User")
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(ForMe.textPrimary)

                    Spacer()

                    if let date = conversation.lastMessageAt {
                        Text(date, style: .relative)
                            .font(.caption)
                            .foregroundColor(ForMe.textTertiary)
                    }
                }

                if let lastMessage = conversation.lastMessage {
                    Text(lastMessage.content)
                        .font(.subheadline)
                        .foregroundColor(ForMe.textSecondary)
                        .lineLimit(1)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

#Preview {
    MessagesListView()
}
