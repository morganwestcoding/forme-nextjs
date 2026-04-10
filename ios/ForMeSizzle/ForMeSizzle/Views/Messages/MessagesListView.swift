import SwiftUI

struct MessagesListView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var userResults: [SearchResultItem] = []
    @State private var isSearchingUsers = false
    @State private var searchTask: Task<Void, Never>?
    @State private var navigateTo: Conversation?

    var filteredConversations: [Conversation] {
        if searchText.isEmpty { return viewModel.conversations }
        return viewModel.conversations.filter {
            $0.otherUser?.name?.localizedCaseInsensitiveContains(searchText) == true
        }
    }

    var showingUserSearch: Bool {
        searchText.count >= 2 && !userResults.isEmpty
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack(alignment: .center) {
                Text("Messages")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(ForMe.textPrimary)

                Spacer()

                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.textSecondary)
                        .frame(width: 34, height: 34)
                        .background(ForMe.stone100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(ForMe.border, lineWidth: 1))
                }
            }
            .padding(.horizontal)
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space3)

            // Search
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 14))
                    .foregroundColor(ForMe.textTertiary)
                TextField("Search people or conversations", text: $searchText)
                    .font(.system(size: 14))
                    .foregroundColor(ForMe.textPrimary)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                if !searchText.isEmpty {
                    Button {
                        searchText = ""
                        userResults = []
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 14))
                            .foregroundColor(ForMe.stone400)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(ForMe.stone100)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
            .padding(.horizontal)
            .padding(.bottom, ForMe.space3)

            Divider()

            // User search results (for starting new conversation)
            if !userResults.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    Text("People")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(ForMe.textTertiary)
                        .textCase(.uppercase)
                        .tracking(0.6)
                        .padding(.horizontal)
                        .padding(.top, ForMe.space3)
                        .padding(.bottom, 4)

                    ForEach(userResults) { user in
                        Button {
                            startConversation(with: user)
                        } label: {
                            HStack(spacing: 14) {
                                DynamicAvatar(name: user.displayTitle, imageUrl: user.image, size: .medium)
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(user.displayTitle)
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(ForMe.textPrimary)
                                    if let subtitle = user.subtitle, !subtitle.isEmpty {
                                        Text(subtitle)
                                            .font(.system(size: 12))
                                            .foregroundColor(ForMe.textTertiary)
                                    }
                                }
                                Spacer()
                                Image(systemName: "plus.message")
                                    .font(.system(size: 16))
                                    .foregroundColor(ForMe.stone400)
                            }
                            .padding(.horizontal, ForMe.space4)
                            .padding(.vertical, ForMe.space3)
                        }
                        .buttonStyle(.plain)
                    }
                }
                Divider()
            }

            // Conversations
            if viewModel.isLoading {
                Spacer()
                ProgressView()
                Spacer()
            } else if filteredConversations.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 40))
                        .foregroundColor(ForMe.stone300)
                    Text(searchText.isEmpty ? "No messages yet" : "No results")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(ForMe.textSecondary)
                    Text("Start a conversation from someone's profile")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.textTertiary)
                }
                Spacer()
            } else {
                ScrollView(showsIndicators: false) {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(filteredConversations.enumerated()), id: \.element.id) { index, conversation in
                            NavigationLink(value: conversation) {
                                ConversationRow(
                                    conversation: conversation,
                                    isUnread: conversation.lastMessage?.isRead == false
                                )
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index)

                            if index < filteredConversations.count - 1 {
                                Divider().padding(.leading, 76)
                            }
                        }
                    }
                }
            }
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
        .navigationDestination(for: Conversation.self) { conversation in
            ChatView(conversation: conversation)
        }
        .navigationDestination(item: $navigateTo) { conversation in
            ChatView(conversation: conversation)
        }
        .refreshable {
            await viewModel.loadConversations()
        }
        .task {
            await viewModel.loadConversations()
        }
        .onChange(of: searchText) { _, newValue in
            searchTask?.cancel()
            let trimmed = newValue.trimmingCharacters(in: .whitespaces)
            guard trimmed.count >= 2 else {
                userResults = []
                return
            }
            searchTask = Task {
                try? await Task.sleep(nanoseconds: 200_000_000)
                guard !Task.isCancelled else { return }
                do {
                    let response = try await APIService.shared.search(query: trimmed)
                    let users = (response.results ?? []).filter { $0.type == "user" }
                    if !Task.isCancelled { userResults = users }
                } catch {
                    if !Task.isCancelled { userResults = [] }
                }
            }
        }
    }

    private func startConversation(with user: SearchResultItem) {
        Task {
            do {
                let conversation = try await APIService.shared.startConversation(userId: user.id)
                searchText = ""
                userResults = []
                // Reload list and navigate
                await viewModel.loadConversations()
                navigateTo = conversation
            } catch {
                // silent
            }
        }
    }
}

// MARK: - Conversation Row

struct ConversationRow: View {
    let conversation: Conversation
    var isUnread: Bool = false

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
                        .font(.system(size: 15, weight: isUnread ? .bold : .semibold))
                        .foregroundColor(ForMe.textPrimary)

                    Spacer()

                    if let dateStr = conversation.lastMessageAt {
                        Text(formatRelativeDate(dateStr))
                            .font(.system(size: 12))
                            .foregroundColor(isUnread ? ForMe.textPrimary : ForMe.textTertiary)
                    }
                }

                HStack(spacing: 6) {
                    if let lastMessage = conversation.lastMessage {
                        Text(lastMessage.content)
                            .font(.system(size: 13))
                            .foregroundColor(isUnread ? ForMe.textPrimary : ForMe.stone400)
                            .lineLimit(1)
                    }

                    Spacer()

                    if isUnread {
                        Circle()
                            .fill(ForMe.accent)
                            .frame(width: 8, height: 8)
                    }
                }
            }
        }
        .padding(.horizontal, ForMe.space4)
        .padding(.vertical, ForMe.space3)
    }

    private func formatRelativeDate(_ dateStr: String) -> String {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = iso.date(from: dateStr) else { return "" }
        let mins = Int(Date().timeIntervalSince(date) / 60)
        if mins < 1 { return "now" }
        if mins < 60 { return "\(mins)m" }
        let hours = mins / 60
        if hours < 24 { return "\(hours)h" }
        let days = hours / 24
        if days < 7 { return "\(days)d" }
        let f = DateFormatter()
        f.dateFormat = "MMM d"
        return f.string(from: date)
    }
}

#Preview {
    NavigationStack {
        MessagesListView()
            .environmentObject(AuthViewModel())
    }
}
