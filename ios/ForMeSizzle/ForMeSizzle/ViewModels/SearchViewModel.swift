import SwiftUI
import Combine

@MainActor
class SearchViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var query = ""
    @Published var selectedCategory: ServiceCategory?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func search() async {
        isLoading = true
        error = nil

        do {
            let response = try await api.getListings(
                category: selectedCategory,
                limit: 50
            )
            listings = response.listings
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
