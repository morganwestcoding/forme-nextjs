import SwiftUI
import Combine

@MainActor
class PropertiesViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var isLoading = false

    private let api = APIService.shared

    func loadListings() async {
        guard let userId = await currentUserId() else { return }
        isLoading = true
        do {
            listings = try await api.getUserListings(userId: userId)
        } catch {
            // silent
        }
        isLoading = false
    }

    func deleteListing(id: String) async {
        listings.removeAll { $0.id == id }
        try? await api.deleteListing(id: id)
    }

    private func currentUserId() async -> String? {
        // Read from AuthViewModel via main actor
        // We expect the caller to know the user — but easier: use the API
        do {
            let user = try await api.getCurrentUser()
            return user.id
        } catch {
            return nil
        }
    }
}
