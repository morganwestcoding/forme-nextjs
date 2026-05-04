import SwiftUI

/// Mirrors web ReviewCard.tsx — 250×280 card with avatar, comment, star
/// rating, and helpful-vote toggle. Helpful state is local + optimistic with
/// server sync.
struct ReviewCardView: View {
    let review: Review
    let currentUserId: String?

    @State private var helpfulCount: Int
    @State private var hasVoted: Bool
    @State private var isVoting = false

    init(review: Review, currentUserId: String?) {
        self.review = review
        self.currentUserId = currentUserId
        let votes = review.helpfulVotes ?? []
        _helpfulCount = State(initialValue: votes.count)
        _hasVoted = State(initialValue: currentUserId.map { votes.contains($0) } ?? false)
    }

    private var isOwnReview: Bool {
        guard let me = currentUserId, let author = review.userId else { return false }
        return me == author
    }

    private var canVote: Bool {
        currentUserId != nil && !isOwnReview && !isVoting
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            commentBlock
            starRow
            Divider()
                .background(ForMe.borderLight)
                .padding(.top, ForMe.space2)
            footer
        }
        .padding(ForMe.space4)
        .frame(width: 250, height: 280)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    private var header: some View {
        HStack(spacing: ForMe.space2) {
            DynamicAvatar(
                name: review.user?.name ?? "User",
                imageUrl: review.user?.image,
                size: .small
            )

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 5) {
                    Text(review.user?.name ?? "Anonymous")
                        .font(ForMe.font(.semibold, size: 13))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)
                }

                HStack(spacing: 6) {
                    if let createdAt = review.createdAt {
                        Text(relativeTime(createdAt))
                            .font(ForMe.font(.regular, size: 11))
                            .foregroundColor(ForMe.textTertiary)
                    }
                    if review.isVerifiedBooking == true {
                        Text("·")
                            .font(ForMe.font(.regular, size: 11))
                            .foregroundColor(ForMe.stone200)
                        HStack(spacing: 3) {
                            Image(systemName: "checkmark")
                                .font(.system(size: 9, weight: .bold))
                            Text("Verified")
                                .font(ForMe.font(.medium, size: 11))
                        }
                        .foregroundColor(ForMe.statusConfirmed)
                    }
                }
            }
            Spacer(minLength: 0)
        }
    }

    private var commentBlock: some View {
        Group {
            if let comment = review.comment, !comment.isEmpty {
                Text(comment)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.textSecondary)
                    .lineLimit(5)
                    .multilineTextAlignment(.leading)
            } else {
                Text("No comment")
                    .font(ForMe.font(.regular, size: 13))
                    .italic()
                    .foregroundColor(ForMe.textTertiary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, ForMe.space3)
        .padding(.bottom, ForMe.space2)
        .layoutPriority(1)
    }

    private var starRow: some View {
        HStack(spacing: 2) {
            ForEach(1...5, id: \.self) { star in
                Image(systemName: Double(star) <= review.rating ? "star.fill" : "star")
                    .font(.system(size: 13))
                    .foregroundColor(Double(star) <= review.rating ? Color(hex: "FBBF24") : ForMe.stone200)
            }
        }
        .frame(maxWidth: .infinity, alignment: .center)
        .padding(.top, ForMe.space2)
    }

    private var footer: some View {
        HStack {
            Button {
                Task { await toggleHelpful() }
            } label: {
                HStack(spacing: 5) {
                    Image(systemName: hasVoted ? "hand.thumbsup.fill" : "hand.thumbsup")
                        .font(.system(size: 12))
                    Text(helpfulCount > 0 ? "Helpful (\(helpfulCount))" : "Helpful")
                        .font(ForMe.font(.medium, size: 11))
                }
                .foregroundColor(hasVoted ? ForMe.textSecondary : ForMe.textTertiary)
            }
            .buttonStyle(.plain)
            .disabled(!canVote)

            Spacer()
        }
        .padding(.top, ForMe.space2)
    }

    private func toggleHelpful() async {
        guard canVote, let id = review.id as String? else { return }
        Haptics.tap()
        let wasVoted = hasVoted
        // Optimistic
        hasVoted = !wasVoted
        helpfulCount += wasVoted ? -1 : 1
        isVoting = true
        do {
            let response = try await APIService.shared.toggleReviewHelpful(reviewId: id)
            // Reconcile with server truth in case of races
            hasVoted = response.hasVoted
            helpfulCount = response.helpfulVotes.count
        } catch {
            // Revert on error
            hasVoted = wasVoted
            helpfulCount += wasVoted ? 1 : -1
        }
        isVoting = false
    }

    private func relativeTime(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let date = formatter.date(from: iso) ?? {
            let basic = ISO8601DateFormatter()
            basic.formatOptions = [.withInternetDateTime]
            return basic.date(from: iso)
        }()
        guard let date else { return "" }
        let diff = Date().timeIntervalSince(date)
        if diff < 60 { return "Just now" }
        if diff < 3600 { return "\(Int(diff / 60))m ago" }
        if diff < 86400 { return "\(Int(diff / 3600))h ago" }
        if diff < 604800 { return "\(Int(diff / 86400))d ago" }
        if diff < 2592000 { return "\(Int(diff / 604800))w ago" }
        let display = DateFormatter()
        display.dateFormat = "MMM d, yyyy"
        return display.string(from: date)
    }
}
