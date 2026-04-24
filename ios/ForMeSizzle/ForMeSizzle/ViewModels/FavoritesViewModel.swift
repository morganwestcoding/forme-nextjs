import SwiftUI
import Combine

@MainActor
class FavoritesViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var workers: [Professional] = []
    @Published var shops: [Shop] = []
    @Published var posts: [Post] = []
    @Published var isLoading = false

    private let api = APIService.shared

    func loadFavorites() async {
        isLoading = true
        do {
            let response = try await api.getFavorites()
            listings = response.listings
            posts = response.posts
            shops = response.shops ?? []

            workers = (response.workers ?? []).compactMap { employee -> Professional? in
                guard let employeeUser = employee.user, let listing = employee.listing else {
                    return nil
                }
                let compact = CompactUser(
                    id: employeeUser.id,
                    name: employee.fullName,
                    image: employeeUser.image ?? employeeUser.imageSrc
                )
                return Professional(id: employeeUser.id, user: compact, listing: listing)
            }
        } catch {
            // silent
        }
        isLoading = false
    }
}
