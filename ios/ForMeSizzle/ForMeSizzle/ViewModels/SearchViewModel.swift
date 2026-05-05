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
    // Aggregated professionals: listing owners + listing employees + independent
    // providers. Same shape Discover uses so we can render with ProviderRow.
    @Published var workers: [Professional] = []
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

    // Workers filtered by free-text query, then ranked using the same sort
    // option that orders the listings — so the unified results list reads as
    // one cohesive ranking instead of two independently-ordered groups.
    var displayWorkers: [Professional] {
        var filtered = workers

        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        if !q.isEmpty {
            filtered = filtered.filter { p in
                if let name = p.user.name?.lowercased(), name.contains(q) { return true }
                if let job = p.jobTitle?.lowercased(), job.contains(q) { return true }
                if let listing = p.listing,
                   listing.title.lowercased().contains(q) || listing.category.lowercased().contains(q) {
                    return true
                }
                return false
            }
        }

        switch sortOption {
        case .relevance:
            return filtered
        case .highestRated:
            return filtered.sorted { lhs, rhs in
                if lhs.sortRating != rhs.sortRating { return lhs.sortRating > rhs.sortRating }
                return lhs.sortReviewCount > rhs.sortReviewCount
            }
        case .mostReviewed:
            return filtered.sorted { $0.sortReviewCount > $1.sortReviewCount }
        case .priceLowToHigh:
            return filtered.sorted { lhs, rhs in
                let lp = lhs.sortMinPrice ?? .greatestFiniteMagnitude
                let rp = rhs.sortMinPrice ?? .greatestFiniteMagnitude
                return lp < rp
            }
        }
    }

    func search() async {
        isLoading = true
        error = nil

        async let listingsTask = api.getListings(limit: 100)
        async let independentsTask = fetchIndependents()

        do {
            let response = try await listingsTask
            let independents = await independentsTask
            listings = response.listings
            workers = aggregateProfessionals(listings: response.listings, independents: independents)
        } catch {
            self.error = error.localizedDescription
            listings = []
            workers = []
        }

        isLoading = false
    }

    private func fetchIndependents() async -> [Employee] {
        (try? await api.getIndependentWorkers()) ?? []
    }

    // Same composition Discover uses (HomeViewModel.loadEmployees) — listing
    // owners first, then each listing's employees, then independents — with a
    // single seen-set so a person who's both an owner and an employee on the
    // same shop only appears once.
    private func aggregateProfessionals(listings: [Listing], independents: [Employee]) -> [Professional] {
        var seen = Set<String>()
        var out: [Professional] = []

        for listing in listings {
            if let owner = listing.user, seen.insert(owner.id).inserted {
                out.append(Professional(
                    id: owner.id, user: owner, listing: listing,
                    jobTitle: nil, priceRange: listing.priceRange
                ))
            }
            for employee in (listing.employees ?? []) {
                guard let employeeUser = employee.user,
                      seen.insert(employeeUser.id).inserted else { continue }
                let user = CompactUser(
                    id: employeeUser.id,
                    name: employee.fullName,
                    image: employeeUser.image ?? employeeUser.imageSrc
                )
                out.append(Professional(
                    id: employeeUser.id, user: user, listing: listing,
                    jobTitle: employee.jobTitle, priceRange: listing.priceRange
                ))
            }
        }

        for w in independents {
            guard let user = w.user, seen.insert(user.id).inserted else { continue }
            out.append(Professional(
                id: user.id, user: user, listing: nil,
                jobTitle: w.jobTitle, priceRange: w.priceRange
            ))
        }

        return out
    }
}
