import SwiftUI

struct NotificationsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var notifications: [AppNotification] = []
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if notifications.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "bell.slash")
                            .font(.system(size: 40))
                            .foregroundColor(ForMe.stone300)
                        Text("No notifications yet")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(ForMe.textSecondary)
                        Text("You'll see updates here")
                            .font(.system(size: 13))
                            .foregroundColor(ForMe.textTertiary)
                    }
                    Spacer()
                } else {
                    ScrollView(showsIndicators: false) {
                        LazyVStack(spacing: 6) {
                            ForEach(notifications) { notification in
                                NotificationRow(notification: notification) {
                                    Task {
                                        await markRead(notification.id)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.top, ForMe.space3)
                    }
                }
            }
            .background(ForMe.background)
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !notifications.isEmpty && notifications.contains(where: { !$0.isRead }) {
                        Button("Read all") {
                            Task { await markAllRead() }
                        }
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
            .task {
                await loadNotifications()
            }
            .refreshable {
                await loadNotifications()
            }
        }
    }

    private func loadNotifications() async {
        isLoading = true
        do {
            notifications = try await APIService.shared.getNotifications()
        } catch {
            // silent
        }
        isLoading = false
    }

    private func markRead(_ id: String) async {
        if let idx = notifications.firstIndex(where: { $0.id == id }) {
            notifications[idx].isRead = true
        }
        try? await APIService.shared.markNotificationRead(id: id)
    }

    private func markAllRead() async {
        for i in notifications.indices {
            notifications[i].isRead = true
        }
        try? await APIService.shared.markAllNotificationsRead()
    }
}

// MARK: - Notification Row

struct NotificationRow: View {
    let notification: AppNotification
    let onTap: () -> Void

    private var iconName: String {
        switch notification.type {
        case "follow": return "person.fill"
        case "favorite_listing": return "mappin.circle.fill"
        case "favorite_post": return "heart.fill"
        case "RESERVATION_ACCEPTED", "RESERVATION_DECLINED", "reservation", "reservation_request":
            return "calendar"
        case "RESERVATION_CANCELLED_BY_BUSINESS", "RESERVATION_CANCELLED_BY_USER":
            return "calendar.badge.minus"
        default: return "bell.fill"
        }
    }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                // Icon
                Image(systemName: iconName)
                    .font(.system(size: 14))
                    .foregroundColor(ForMe.stone600)
                    .frame(width: 36, height: 36)
                    .background(ForMe.stone100)
                    .clipShape(Circle())

                // Content
                VStack(alignment: .leading, spacing: 4) {
                    Text(notification.content)
                        .font(.system(size: 13.5))
                        .foregroundColor(notification.isRead ? ForMe.stone500 : ForMe.textPrimary)
                        .fontWeight(notification.isRead ? .regular : .medium)
                        .multilineTextAlignment(.leading)
                        .lineSpacing(2)

                    Text(formatTimeAgo(notification.createdAt))
                        .font(.system(size: 11.5))
                        .foregroundColor(ForMe.stone400)
                }

                Spacer()

                if !notification.isRead {
                    Circle()
                        .fill(ForMe.stone900)
                        .frame(width: 6, height: 6)
                }
            }
            .padding(.horizontal, ForMe.space4)
            .padding(.vertical, ForMe.space3)
            .background(notification.isRead ? Color.clear : ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private func formatTimeAgo(_ dateStr: String?) -> String {
        guard let dateStr = dateStr else { return "" }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = iso.date(from: dateStr) else { return "" }
        let hours = Int(Date().timeIntervalSince(date) / 3600)
        if hours < 1 { return "Just now" }
        if hours < 24 { return "\(hours)h ago" }
        if hours < 48 { return "Yesterday" }
        return "\(hours / 24)d ago"
    }
}

#Preview {
    NotificationsView()
}
