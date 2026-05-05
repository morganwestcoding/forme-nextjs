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
    @Published var isLoading = false

    private let api = APIService.shared

    // Single round-trip via /users/[userId]/profile so user, posts, listings,
    // services, and review aggregates all stay in sync — same source the web's
    // /profile/[userId] page uses.
    //
    // Follow state is now owned by FollowStore so toggles propagate to every
    // counter/button across the app instantly. We seed the store with both
    // currentUser.following (for "am I following this person?") and the
    // profile user's followers list (handled by the view, since the count is
    // a delta-on-base computation).
    func loadProfile(userId: String, currentUser: User?) async {
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
            FollowStore.shared.hydrateFromCurrentUser(currentUser)
            FollowStore.shared.registerUserProfile(id: userId)
        } catch {
            // Silent — view will fall back to authViewModel.currentUser when
            // viewing self, or render an empty state when viewing others.
        }
    }
}
