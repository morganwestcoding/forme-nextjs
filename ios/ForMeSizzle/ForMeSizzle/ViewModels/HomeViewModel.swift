import SwiftUI
import Combine

@MainActor
class HomeViewModel: ObservableObject {
    @Published var featuredListings: [Listing] = []
    @Published var recentListings: [Listing] = []
    @Published var topProviders: [User] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var selectedCategory: ServiceCategory?

    private let api = APIService.shared

    func loadData() async {
        isLoading = true
        error = nil

        async let featured: () = loadFeatured()
        async let recent: () = loadRecent()

        await featured
        await recent

        isLoading = false
    }

    private func loadFeatured() async {
        do {
            let response = try await api.getListings(limit: 10)
            featuredListings = response.listings
            // Extract providers from listing owners
            var seen = Set<String>()
            topProviders = response.listings.compactMap { $0.user }.filter { seen.insert($0.id).inserted }
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func loadRecent() async {
        do {
            let response = try await api.getListings(limit: 5)
            recentListings = response.listings
        } catch {
            // Featured already sets error if needed
        }
    }
}
