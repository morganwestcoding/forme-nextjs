import SwiftUI
import Combine

@MainActor
class FavoritesViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var workers: [User] = []
    @Published var shops: [Shop] = []
    @Published var posts: [Post] = []
    @Published var isLoading = false

    private let api = APIService.shared

    func loadFavorites() async {
        isLoading = true
        do {
            let response = try await api.getFavorites()
            listings = response.listings
            posts = response.posts
        } catch {
            // silent
        }
        isLoading = false
    }
}
