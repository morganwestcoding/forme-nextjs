import SwiftUI
import Combine

@MainActor
class BrandsViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var isLoading = false
    @Published var selectedCategory: ServiceCategory?

    private let api = APIService.shared

    func loadListings() async {
        isLoading = true
        do {
            let response = try await api.getListings(category: selectedCategory, limit: 50)
            listings = response.listings
        } catch {
            // silently fail
        }
        isLoading = false
    }
}
