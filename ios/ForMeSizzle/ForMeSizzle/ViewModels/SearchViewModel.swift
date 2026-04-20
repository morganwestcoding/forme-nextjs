import SwiftUI
import Combine

// Sort options drive the core Search-vs-Discover distinction: Discover is curated,
// Search lets the user rank results by an explicit criterion. "Nearest" is absent
// until we plumb CoreLocation in — adding it without real coordinates would just
// reshuffle randomly.
enum SearchSortOption: String, CaseIterable, Identifiable {
    case relevance
    case highestRated
    case mostReviewed
    case priceLowToHigh

    var id: String { rawValue }

    var label: String {
        switch self {
        case .relevance: return "Relevance"
        case .highestRated: return "Top Rated"
        case .mostReviewed: return "Most Reviewed"
        case .priceLowToHigh: return "Price: Low to High"
        }
    }
}

@MainActor
class SearchViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var workers: [User] = []
    @Published var query = ""
    @Published var sortOption: SearchSortOption = .relevance
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    // Filter by free-text query, then rank. Sort is the Search-only control;
    // Discover never re-orders, so this pipeline is what distinguishes the two
    // pages. Query filtering is client-side against the full loaded set —
    // no 5-result server cap — so typing narrows instantly without a network
    // round-trip. Category filtering lives on Discover, not here.
    var displayListings: [Listing] {
        var filtered = listings

        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        if !q.isEmpty {
            filtered = filtered.filter { listing in
                if listing.title.lowercased().contains(q) { return true }
                if listing.category.lowercased().contains(q) { return true }
                if let loc = listing.location?.lowercased(), loc.contains(q) { return true }
                if let city = listing.city?.lowercased(), city.contains(q) { return true }
                if let desc = listing.description?.lowercased(), desc.contains(q) { return true }
                if let services = listing.services, services.contains(where: { $0.serviceName.lowercased().contains(q) }) { return true }
                return false
            }
        }

        switch sortOption {
        case .relevance:
            return filtered
        case .highestRated:
            return filtered.sorted { lhs, rhs in
                let lr = lhs.rating ?? 0
                let rr = rhs.rating ?? 0
                if lr != rr { return lr > rr }
                return (lhs.ratingCount ?? 0) > (rhs.ratingCount ?? 0)
            }
        case .mostReviewed:
            return filtered.sorted { ($0.ratingCount ?? 0) > ($1.ratingCount ?? 0) }
        case .priceLowToHigh:
            return filtered.sorted { lhs, rhs in
                let lp = Self.minPrice(lhs) ?? .greatestFiniteMagnitude
                let rp = Self.minPrice(rhs) ?? .greatestFiniteMagnitude
                return lp < rp
            }
        }
    }

    private static func minPrice(_ listing: Listing) -> Double? {
        listing.services?.map(\.price).filter { $0 > 0 }.min()
    }

    func search() async {
        isLoading = true
        error = nil

        do {
            let response = try await api.getListings(limit: 100)
            listings = response.listings
            workers = []
        } catch {
            self.error = error.localizedDescription
            listings = []
            workers = []
        }

        isLoading = false
    }
}
