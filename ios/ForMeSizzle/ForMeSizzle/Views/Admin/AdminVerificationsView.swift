import SwiftUI

/// Admin verification queue. Each row shows the applicant + their licensing
/// image, with Approve/Reject actions. Tap a row to see the licensing image
/// at full size and (optionally) reject with a reason.
struct AdminVerificationsView: View {
    @State private var users: [AdminVerification] = []
    @State private var isLoading = false
    @State private var error: String?
    @State private var rejecting: AdminVerification?
    @State private var actingId: String?

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space3) {
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
                    Text("No pending verifications.")
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone400)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else {
                    Text("\(users.count) pending submission\(users.count == 1 ? "" : "s")")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.stone400)
                        .padding(.horizontal, ForMe.space5)

                    VStack(spacing: 12) {
                        ForEach(users) { user in
                            row(user)
                        }
                    }
                    .padding(.horizontal, ForMe.space5)
                }
            }
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space10)
        }
        .background(ForMe.background)
        .navigationTitle("Verifications")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .refreshable { await load() }
        .sheet(item: $rejecting) { user in
            RejectVerificationSheet(user: user) { reason in
                Task {
                    let ok = await decide(user, action: "reject", reason: reason)
                    if ok { rejecting = nil }
                }
            }
        }
    }

    private func row(_ user: AdminVerification) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                DynamicAvatar(name: user.name ?? "?", imageUrl: user.image, size: .medium)
                VStack(alignment: .leading, spacing: 2) {
                    Text(user.name ?? "—")
                        .font(ForMe.font(.semibold, size: 15))
                        .foregroundColor(ForMe.textPrimary)
                    if let email = user.email {
                        Text(email)
                            .font(ForMe.font(.regular, size: 12))
                            .foregroundColor(ForMe.stone400)
                    }
                    HStack(spacing: 6) {
                        if let userType = user.userType, !userType.isEmpty {
                            Text(userType.capitalized)
                                .font(ForMe.font(.medium, size: 10))
                                .foregroundColor(ForMe.textSecondary)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(ForMe.stone100)
                                .clipShape(Capsule())
                        }
                        if let location = user.location, !location.isEmpty {
                            Text(location)
                                .font(ForMe.font(.regular, size: 11))
                                .foregroundColor(ForMe.stone400)
                        }
                    }
                }
                Spacer()
                Text(relativeTime(user.createdAt))
                    .font(ForMe.font(.regular, size: 11))
                    .foregroundColor(ForMe.stone400)
            }

            if let licensing = user.licensingImage, let url = URL(string: licensing) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().aspectRatio(contentMode: .fit)
                    default:
                        Rectangle().fill(ForMe.stone100)
                            .aspectRatio(4 / 3, contentMode: .fit)
                            .overlay(ProgressView())
                    }
                }
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            } else {
                Text("No licensing image submitted.")
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 24)
                    .background(ForMe.stone100)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }

            HStack(spacing: 8) {
                Button {
                    Haptics.tap()
                    Task {
                        let ok = await decide(user, action: "approve", reason: nil)
                        if ok { Haptics.success() }
                    }
                } label: {
                    Text(actingId == user.id ? "Approving…" : "Approve")
                }
                .buttonStyle(ForMeAccentButtonStyle())
                .disabled(actingId != nil)

                Button {
                    Haptics.tap()
                    rejecting = user
                } label: {
                    Text("Reject")
                }
                .buttonStyle(ForMeSecondaryButtonStyle())
                .disabled(actingId != nil)
            }
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    // MARK: - Actions

    private func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            users = try await APIService.shared.getAdminVerifications()
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func decide(_ user: AdminVerification, action: String, reason: String?) async -> Bool {
        actingId = user.id
        defer { actingId = nil }
        do {
            _ = try await APIService.shared.decideVerification(userId: user.id, action: action, reason: reason)
            users.removeAll { $0.id == user.id }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    private func relativeTime(_ date: Date) -> String {
        let f = RelativeDateTimeFormatter()
        f.unitsStyle = .short
        return f.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Reject sheet

private struct RejectVerificationSheet: View {
    let user: AdminVerification
    let onReject: (String?) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var reason: String = ""

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: ForMe.space4) {
                Text("Reject \(user.name ?? "this submission")?")
                    .font(ForMe.font(.semibold, size: 16))
                    .foregroundColor(ForMe.textPrimary)
                Text("The applicant gets a notification + email. A reason makes the rejection actionable.")
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.textSecondary)
                TextField("Reason (optional)", text: $reason, axis: .vertical)
                    .font(ForMe.font(.regular, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(3...6)
                    .forMeInput()
                Spacer()
            }
            .padding()
            .background(ForMe.background)
            .navigationTitle("Reject")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Reject", role: .destructive) {
                        let trimmed = reason.trimmingCharacters(in: .whitespaces)
                        onReject(trimmed.isEmpty ? nil : trimmed)
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }
}
