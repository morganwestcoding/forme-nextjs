import SwiftUI

@MainActor
class HomeViewModel: ObservableObject {
    @Published var featuredListings: [Listing] = []
    @Published var recentListings: [Listing] = []
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

            let (featuredResponse, recentResponse) = try await (featured, recent)
            featuredListings = featuredResponse.listings
            recentListings = recentResponse.listings
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
