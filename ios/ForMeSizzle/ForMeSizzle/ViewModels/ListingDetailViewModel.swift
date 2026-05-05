import SwiftUI
import Combine

@MainActor
class ListingDetailViewModel: ObservableObject {
    @Published var services: [Service] = []
    @Published var selectedService: Service?
    @Published var isFavorite = false
    @Published var isLoading = false
    @Published var error: String?
    @Published var reviews: [Review] = []

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

    func loadReviews(for listingId: String) async {
        do {
            reviews = try await api.getListingReviews(listingId: listingId)
        } catch {
            // Reviews are non-critical for the page render, surface only via
            // log; the section just stays empty if the call fails.
        }
    }

    /// Prepend a freshly-submitted review so the listing detail reviews
    /// strip updates instantly without a refetch.
    func insert(review: Review) {
        reviews.insert(review, at: 0)
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
