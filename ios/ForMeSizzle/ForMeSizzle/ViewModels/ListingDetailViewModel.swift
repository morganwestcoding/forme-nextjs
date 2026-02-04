import SwiftUI
import Combine

@MainActor
class ListingDetailViewModel: ObservableObject {
    @Published var services: [Service] = []
    @Published var selectedService: Service?
    @Published var isFavorite = false
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func loadServices(for listingId: String) async {
        isLoading = true
        do {
            services = try await api.getListingServices(listingId: listingId)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func toggleFavorite(listingId: String) async {
        do {
            if isFavorite {
                try await api.removeFavorite(listingId: listingId)
            } else {
                try await api.addFavorite(listingId: listingId)
            }
            isFavorite.toggle()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
