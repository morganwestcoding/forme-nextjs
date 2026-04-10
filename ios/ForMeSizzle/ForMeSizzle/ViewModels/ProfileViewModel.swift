import SwiftUI
import Combine

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var posts: [Post] = []
    @Published var listings: [Listing] = []
    @Published var reviews: [Review] = []
    @Published var isFollowing = false
    @Published var isLoading = false

    private let api = APIService.shared

    func loadProfile(userId: String) async {
        isLoading = true

        async let userTask: () = loadUser(userId: userId)
        async let postsTask: () = loadPosts(userId: userId)
        async let listingsTask: () = loadListings(userId: userId)

        await userTask
        await postsTask
        await listingsTask

        isLoading = false
    }

    private func loadUser(userId: String) async {
        do {
            user = try await api.getUser(id: userId)
        } catch {
            // silent
        }
    }

    private func loadPosts(userId: String) async {
        do {
            posts = try await api.getUserPosts(userId: userId)
        } catch {
            // silent
        }
    }

    private func loadListings(userId: String) async {
        do {
            listings = try await api.getUserListings(userId: userId)
        } catch {
            // silent
        }
    }

    func toggleFollow() async {
        guard let userId = user?.id else { return }
        isFollowing.toggle()
        try? await api.toggleFollow(userId: userId)
    }
}
