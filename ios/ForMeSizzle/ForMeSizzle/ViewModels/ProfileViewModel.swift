import SwiftUI
import Combine

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var posts: [Post] = []
    @Published var listings: [Listing] = []
    @Published var services: [Service] = []
    @Published var reviews: [Review] = []
    @Published var reviewStats: ReviewStats?
    @Published var isFollowing = false
    @Published var isLoading = false

    private let api = APIService.shared

    // Single round-trip via /users/[userId]/profile so user, posts, listings,
    // services, and review aggregates all stay in sync — same source the web's
    // /profile/[userId] page uses.
    func loadProfile(userId: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let resp = try await api.getUserProfile(userId: userId)
            user = resp.user
            posts = resp.posts ?? []
            listings = resp.listings ?? []
            services = resp.services ?? []
            reviews = resp.reviews ?? []
            reviewStats = resp.reviewStats
        } catch {
            // Silent — view will fall back to authViewModel.currentUser when
            // viewing self, or render an empty state when viewing others.
        }
    }

    func toggleFollow() async {
        guard let userId = user?.id else { return }
        isFollowing.toggle()
        try? await api.toggleFollow(userId: userId)
    }
}
