import SwiftUI
import Combine

// Bundle a professional with the listing they're tied to so the UI
// always has the data it needs (location, rating, price) without re-matching.
struct Professional: Identifiable, Hashable {
    let id: String
    let user: CompactUser
    let listing: Listing
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

        async let postsTask: () = loadPosts()
        async let listingsTask: () = loadListings()

        await postsTask
        await listingsTask

        isLoading = false
    }

    private func loadPosts() async {
        do {
            posts = try await api.getFeed()
        } catch {
            // Non-critical
        }
    }

    private func loadListings() async {
        do {
            let response = try await api.getListings(limit: 100)
            listings = response.listings

            // Aggregate every unique professional with their associated listing:
            //   1. Listing owners (the business's primary user) → that listing
            //   2. Every employee under each listing → that listing
            var seen = Set<String>()
            var aggregated: [Professional] = []

            for listing in response.listings {
                if let owner = listing.user, seen.insert(owner.id).inserted {
                    // Owner: use their image, fall back to the listing's hero image
                    let ownerWithImage = CompactUser(
                        id: owner.id,
                        name: owner.name,
                        image: owner.image ?? listing.imageSrc
                    )
                    aggregated.append(Professional(id: owner.id, user: ownerWithImage, listing: listing))
                }
                for employee in (listing.employees ?? []) {
                    let userId = employee.userId ?? employee.id
                    guard seen.insert(userId).inserted else { continue }
                    // Employee: use their image, fall back to the business's listing image
                    let user = CompactUser(
                        id: userId,
                        name: employee.fullName,
                        image: employee.imageSrc ?? listing.imageSrc
                    )
                    aggregated.append(Professional(id: userId, user: user, listing: listing))
                }
            }

            employees = aggregated
        } catch {
            self.error = error.localizedDescription
        }
    }
}
