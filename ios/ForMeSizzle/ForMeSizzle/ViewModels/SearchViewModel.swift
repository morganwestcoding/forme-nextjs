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
                // Search uses the global search endpoint now
                // For the dedicated search tab, just load listings by category
                let response = try await api.getListings(limit: 50)
                listings = response.listings
                workers = []
            } else {
                // Category-only browse
                let response = try await api.getListings(
                    category: selectedCategory,
                    limit: 50
                )
                listings = response.listings
                workers = []
            }
        } catch {
            self.error = error.localizedDescription
            listings = []
            workers = []
        }

        isLoading = false
    }
}
