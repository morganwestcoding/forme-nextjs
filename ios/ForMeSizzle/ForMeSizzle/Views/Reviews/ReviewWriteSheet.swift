import SwiftUI

/// Mirrors web's review-write modal. Used for both listing and user targets —
/// pass exactly one of `targetListingId` or `targetUserId` (server validates).
struct ReviewWriteSheet: View {
    let title: String
    let targetListingId: String?
    let targetUserId: String?
    let reservationId: String?
    let onComplete: (Review) -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var rating: Int = 0
    @State private var comment: String = ""
    @State private var isSubmitting = false
    @State private var error: String?
    @FocusState private var commentFocused: Bool

    private var canSubmit: Bool {
        rating >= 1 && rating <= 5 && !isSubmitting
    }

    private var charCount: Int { comment.count }
    private let charLimit = 1000

    init(
        title: String,
        targetListingId: String? = nil,
        targetUserId: String? = nil,
        reservationId: String? = nil,
        onComplete: @escaping (Review) -> Void = { _ in }
    ) {
        self.title = title
        self.targetListingId = targetListingId
        self.targetUserId = targetUserId
        self.reservationId = reservationId
        self.onComplete = onComplete
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: ForMe.space5) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Rate \(title)")
                            .font(ForMe.font(.bold, size: 18))
                            .foregroundColor(ForMe.textPrimary)
                        Text("Your review helps the community decide.")
                            .font(ForMe.font(.regular, size: 13))
                            .foregroundColor(ForMe.textTertiary)
                    }

                    starPicker

                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Comment")
                                .font(ForMe.font(.semibold, size: 12))
                                .foregroundColor(ForMe.textSecondary)
                            Spacer()
                            Text("\(charCount)/\(charLimit)")
                                .font(ForMe.font(.regular, size: 11))
                                .foregroundColor(charCount > charLimit ? Color(hex: "F43F5E") : ForMe.textTertiary)
                                .monospacedDigit()
                        }

                        TextEditor(text: $comment)
                            .font(ForMe.font(.regular, size: 15))
                            .scrollContentBackground(.hidden)
                            .focused($commentFocused)
                            .frame(minHeight: 140)
                            .padding(ForMe.space3)
                            .background(ForMe.surface)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                    .stroke(commentFocused ? ForMe.borderHover : ForMe.borderLight, lineWidth: 1)
                            )
                    }

                    if let error = error {
                        Text(error)
                            .font(ForMe.font(.medium, size: 12))
                            .foregroundColor(Color(hex: "F43F5E"))
                            .multilineTextAlignment(.leading)
                    }

                    Spacer().frame(height: ForMe.space2)
                }
                .padding(.horizontal, ForMe.space5)
                .padding(.top, ForMe.space5)
            }
            .background(ForMe.background)
            .navigationTitle("Write a Review")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(ForMe.textSecondary)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await submit() }
                    } label: {
                        if isSubmitting {
                            ProgressView().tint(ForMe.textPrimary)
                        } else {
                            Text("Post")
                                .font(ForMe.font(.semibold, size: 14))
                                .foregroundColor(canSubmit ? ForMe.textPrimary : ForMe.textTertiary)
                        }
                    }
                    .disabled(!canSubmit || charCount > charLimit)
                }
            }
        }
    }

    private var starPicker: some View {
        HStack(spacing: 10) {
            ForEach(1...5, id: \.self) { star in
                Button {
                    Haptics.selection()
                    withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
                        rating = star
                    }
                } label: {
                    Image(systemName: star <= rating ? "star.fill" : "star")
                        .font(.system(size: 32))
                        .foregroundColor(star <= rating ? Color(hex: "FBBF24") : ForMe.stone300)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .frame(maxWidth: .infinity, alignment: .center)
    }

    private func submit() async {
        guard canSubmit, charCount <= charLimit else { return }
        commentFocused = false
        isSubmitting = true
        error = nil
        do {
            let trimmed = comment.trimmingCharacters(in: .whitespacesAndNewlines)
            let targetType = targetListingId != nil ? "listing" : "user"
            let review = try await APIService.shared.submitReview(
                rating: rating,
                comment: trimmed.isEmpty ? nil : trimmed,
                targetType: targetType,
                targetUserId: targetUserId,
                targetListingId: targetListingId,
                reservationId: reservationId
            )
            onComplete(review)
            isSubmitting = false
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

#Preview {
    ReviewWriteSheet(title: "Sample Salon", targetListingId: "1")
}
