import SwiftUI
import Combine

// Bundle a professional with the listing they're tied to so the UI
// always has the data it needs (location, rating, price) without re-matching.
// `listing` is nil for independents — they have a hidden shell listing
// server-side that must never reach the UI; surface the worker instead.
struct Professional: Identifiable, Hashable {
    let id: String
    let user: CompactUser
    let listing: Listing?
    let jobTitle: String?
}

@MainActor
class HomeViewModel: ObservableObject {
    // Sections matching web DiscoverClient
    @Published var posts: [Post] = []
    @Published var listings: [Listing] = []
    @Published var employees: [Professional] = []
    @Published var shops: [Shop] = []
    @Published var selectedCategory: String?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func loadData() async {
        isLoading = true
        error = nil

        // Listings + independents both feed the `employees` array, so the two
        // merges have to happen as one atomic write — earlier these ran via
        // `async let` in parallel and whichever finished last clobbered the
        // other (independents would vanish when listings finished second).
        async let postsTask: () = loadPosts()
        async let employeesTask = loadEmployees()

        await postsTask
        let (listings, employees) = await employeesTask
        self.listings = listings
        self.employees = employees

        isLoading = false
    }

    private func loadPosts() async {
        do {
            posts = try await api.getFeed()
        } catch {
            // Non-critical
        }
    }

    // Fetch listings + independents in parallel, then compose both into the
    // single employees array (listing owners + listing employees + independents).
    // Returns the values so the caller assigns them in one main-actor write.
    private func loadEmployees() async -> (listings: [Listing], employees: [Professional]) {
        async let listingsTask = fetchListings()
        async let independentsTask = fetchIndependents()
        let listings = await listingsTask
        let independents = await independentsTask

        var seen = Set<String>()
        var aggregated: [Professional] = []

        for listing in listings {
            if let owner = listing.user, seen.insert(owner.id).inserted {
                aggregated.append(Professional(
                    id: owner.id,
                    user: owner,
                    listing: listing,
                    jobTitle: nil
                ))
            }
            for employee in (listing.employees ?? []) {
                // The API returns the employee's profile image nested under employee.user.image
                // (or .imageSrc). Employee.imageSrc on the root object is not populated.
                guard let employeeUser = employee.user else { continue }
                let userId = employeeUser.id
                guard seen.insert(userId).inserted else { continue }
                let user = CompactUser(
                    id: userId,
                    name: employee.fullName,
                    image: employeeUser.image ?? employeeUser.imageSrc
                )
                aggregated.append(Professional(
                    id: userId,
                    user: user,
                    listing: listing,
                    jobTitle: employee.jobTitle
                ))
            }
        }

        // Independents — never embed inside a shell listing; surface as their
        // own Professional with listing: nil. (See feedback memo on shells.)
        for w in independents {
            guard let user = w.user, seen.insert(user.id).inserted else { continue }
            aggregated.append(Professional(
                id: user.id,
                user: user,
                listing: nil,
                jobTitle: w.jobTitle
            ))
        }

        return (listings, aggregated)
    }

    private func fetchListings() async -> [Listing] {
        do {
            let response = try await api.getListings(limit: 100)
            return response.listings
        } catch {
            self.error = error.localizedDescription
            return []
        }
    }

    private func fetchIndependents() async -> [Employee] {
        do {
            return try await api.getIndependentWorkers()
        } catch {
            // Non-critical — independents are additive.
            return []
        }
    }
}
