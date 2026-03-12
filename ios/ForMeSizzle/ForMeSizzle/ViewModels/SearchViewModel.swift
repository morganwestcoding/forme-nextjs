import SwiftUI
import Combine

@MainActor
class SearchViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var workers: [User] = []
    @Published var query = ""
    @Published var selectedCategory: ServiceCategory?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func search() async {
        isLoading = true
        error = nil

        do {
            if !query.trimmingCharacters(in: .whitespaces).isEmpty {
                // Use full search endpoint — returns users, listings, services
                let response = try await api.search(query: query)
                listings = response.listings ?? []
                workers = response.users ?? []

                // Apply local category filter if selected
                if let category = selectedCategory {
                    listings = listings.filter { $0.category == category }
                }
            } else {
                // Category-only browse
                let response = try await api.getListings(
                    category: selectedCategory,
                    limit: 50
                )
                listings = response.listings

                // Extract unique workers from listing owners
                var seen = Set<String>()
                workers = response.listings.compactMap { $0.user }.filter { seen.insert($0.id).inserted }
            }
        } catch {
            self.error = error.localizedDescription
            listings = []
            workers = []
        }

        isLoading = false
    }
}
