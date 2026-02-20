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

        do {
            async let featured = api.getListings(limit: 10)
            async let recent = api.getListings(limit: 5)
            async let providers = api.getProviders(limit: 8)

            let (featuredResponse, recentResponse, providersResponse) = try await (featured, recent, providers)
            featuredListings = featuredResponse.listings
            recentListings = recentResponse.listings
            topProviders = providersResponse
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
