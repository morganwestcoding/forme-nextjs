import SwiftUI
import Combine

@MainActor
class HomeViewModel: ObservableObject {
    // Sections matching web DiscoverClient
    @Published var posts: [Post] = []
    @Published var listings: [Listing] = []
    @Published var employees: [CompactUser] = []
    @Published var shops: [Shop] = []
    @Published var selectedCategory: String?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func loadData() async {
        isLoading = true
        error = nil

        async let postsTask: () = loadPosts()
        async let listingsTask: () = loadListings()

        await postsTask
        await listingsTask

        isLoading = false
    }

    private func loadPosts() async {
        do {
            posts = try await api.getFeed()
        } catch {
            // Non-critical
        }
    }

    private func loadListings() async {
        do {
            let response = try await api.getListings(limit: 20)
            listings = response.listings
            // Extract unique providers from listing owners
            var seen = Set<String>()
            employees = response.listings.compactMap { $0.user }.filter { seen.insert($0.id).inserted }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
