import SwiftUI

/// Paginated user search with suspend/unsuspend per row. Server enforces:
/// can't suspend yourself, can't suspend a master.
struct AdminUsersView: View {
    @State private var users: [AdminUserSummary] = []
    @State private var total: Int = 0
    @State private var page: Int = 1
    @State private var pageSize: Int = 50
    @State private var query: String = ""
    @State private var isLoading = false
    @State private var error: String?
    @State private var actingId: String?

    /// Debounce search so we don't hit the server on every keystroke.
    @State private var searchDebounceTask: Task<Void, Never>?

    private var totalPages: Int { max(1, Int(ceil(Double(total) / Double(pageSize)))) }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space3) {
                ForMeSearchBar(text: $query, placeholder: "Search by name or email")
                    .padding(.horizontal, ForMe.space5)
                    .onChange(of: query) { _ in
                        searchDebounceTask?.cancel()
                        searchDebounceTask = Task {
                            try? await Task.sleep(nanoseconds: 350_000_000)
                            if !Task.isCancelled {
                                page = 1
                                await load()
                            }
                        }
                    }

                if let error {
                    Text(error)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.statusCancelled)
                        .padding(.horizontal, ForMe.space5)
                }

                if isLoading && users.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else if users.isEmpty {
                    Text("No users match.")
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone400)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else {
                    Text("\(total.formatted()) total")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.stone400)
                        .padding(.horizontal, ForMe.space5)

                    VStack(spacing: 8) {
                        ForEach(users) { user in
                            row(user)
                        }
                    }
                    .padding(.horizontal, ForMe.space5)

                    if totalPages > 1 {
                        pagination
                            .padding(.horizontal, ForMe.space5)
                            .padding(.top, ForMe.space3)
                    }
                }
            }
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space10)
        }
        .background(ForMe.background)
        .navigationTitle("Users")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .refreshable { await load() }
    }

    private func row(_ user: AdminUserSummary) -> some View {
        HStack(spacing: 12) {
            DynamicAvatar(name: user.name ?? "?", imageUrl: user.image, size: .medium)
            VStack(alignment: .leading, spacing: 3) {
                Text(user.name ?? "—")
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                if let email = user.email {
                    Text(email)
                        .font(ForMe.font(.regular, size: 11))
                        .foregroundColor(ForMe.stone400)
                        .lineLimit(1)
                }
                HStack(spacing: 6) {
                    rolePill(user.role)
                    if user.isSubscribed, let tier = user.subscriptionTier {
                        Text(tier.capitalized)
                            .font(ForMe.font(.medium, size: 10))
                            .foregroundColor(ForMe.statusCompleted)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(ForMe.statusCompleted.opacity(0.12))
                            .clipShape(Capsule())
                    }
                    if let status = user.verificationStatus, status == "verified" {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 10))
                            .foregroundColor(ForMe.statusConfirmed)
                    }
                }
            }
            Spacer()
            Menu {
                if user.role == "suspended" {
                    Button {
                        Haptics.tap()
                        Task {
                            let ok = await suspendAction(user, action: "unsuspend")
                            if ok { Haptics.success() }
                        }
                    } label: {
                        Label("Unsuspend", systemImage: "checkmark.circle")
                    }
                } else if user.role != "master" {
                    Button(role: .destructive) {
                        Haptics.tap()
                        Task {
                            let ok = await suspendAction(user, action: "suspend")
                            if ok { Haptics.warning() }
                        }
                    } label: {
                        Label("Suspend", systemImage: "nosign")
                    }
                }
            } label: {
                if actingId == user.id {
                    ProgressView()
                        .frame(width: 32, height: 32)
                } else {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(ForMe.stone500)
                        .frame(width: 32, height: 32)
                        .contentShape(Rectangle())
                }
            }
            .disabled(actingId != nil || user.role == "master")
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    private func rolePill(_ role: String) -> some View {
        let (label, color): (String, Color) = {
            switch role {
            case "master":     return ("Master",     ForMe.statusCompleted)
            case "admin":      return ("Admin",      ForMe.statusCompleted)
            case "suspended":  return ("Suspended",  ForMe.statusCancelled)
            default:           return (role.capitalized, ForMe.stone500)
            }
        }()
        return Text(label)
            .font(ForMe.font(.medium, size: 10))
            .foregroundColor(color)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    private var pagination: some View {
        HStack {
            Button {
                guard page > 1 else { return }
                page -= 1
                Task { await load() }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(page > 1 ? ForMe.textPrimary : ForMe.stone300)
                    .frame(width: 36, height: 36)
                    .background(ForMe.surface)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(ForMe.borderLight, lineWidth: 1))
            }
            .buttonStyle(.plain)
            .disabled(page <= 1 || isLoading)

            Spacer()
            Text("Page \(page) of \(totalPages)")
                .font(ForMe.font(.medium, size: 12))
                .foregroundColor(ForMe.textSecondary)
            Spacer()

            Button {
                guard page < totalPages else { return }
                page += 1
                Task { await load() }
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(page < totalPages ? ForMe.textPrimary : ForMe.stone300)
                    .frame(width: 36, height: 36)
                    .background(ForMe.surface)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(ForMe.borderLight, lineWidth: 1))
            }
            .buttonStyle(.plain)
            .disabled(page >= totalPages || isLoading)
        }
    }

    // MARK: - Actions

    private func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            let response = try await APIService.shared.getAdminUsers(query: query, page: page, pageSize: pageSize)
            users = response.users
            total = response.total
            page = response.page
            pageSize = response.pageSize
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func suspendAction(_ user: AdminUserSummary, action: String) async -> Bool {
        actingId = user.id
        defer { actingId = nil }
        do {
            let response = try await APIService.shared.suspendUser(userId: user.id, action: action)
            if let idx = users.firstIndex(where: { $0.id == user.id }) {
                let u = users[idx]
                users[idx] = AdminUserSummary(
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    image: u.image,
                    role: response.role,
                    subscriptionTier: u.subscriptionTier,
                    isSubscribed: u.isSubscribed,
                    verificationStatus: u.verificationStatus,
                    createdAt: u.createdAt
                )
            }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}
