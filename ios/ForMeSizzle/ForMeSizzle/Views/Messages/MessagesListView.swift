import SwiftUI

struct MessagesListView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Messages")
                            .font(.largeTitle.bold())
                            .foregroundColor(ForMe.textPrimary)

                        Text("Your conversations")
                            .font(.subheadline)
                            .foregroundColor(ForMe.textSecondary)
                    }

                    Spacer()

                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textSecondary)
                            .frame(width: 38, height: 38)
                            .background(.white)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(ForMe.border, lineWidth: 1.5))
                    }
                }
                .padding(.horizontal)

                if viewModel.isLoading {
                    ProgressView()
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
                    .padding(.top, 60)
                } else {
                    LazyVStack(spacing: 0) {
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
            .padding(.vertical)
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
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

                    if let dateStr = conversation.lastMessageAt {
                        Text(dateStr)
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
