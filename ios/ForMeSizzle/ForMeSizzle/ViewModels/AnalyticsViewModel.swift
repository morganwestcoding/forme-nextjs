import SwiftUI
import Combine

@MainActor
class AnalyticsViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var listingsCount = 0
    @Published var reservationsCount = 0
    @Published var totalRevenue = 0
    @Published var thisMonthRevenue = 0
    @Published var postsCount = 0
    @Published var followersCount = 0
    @Published var followingCount = 0
    @Published var avgRating = 0.0
    @Published var totalReviews = 0
    @Published var ratingDistribution: [Int: Int] = [5: 60, 4: 25, 3: 10, 2: 3, 1: 2]
    @Published var revenueData: [RevenueDataPoint] = []

    private let api = APIService.shared

    func load() async {
        do {
            let user = try await api.getCurrentUser()
            listings = try await api.getUserListings(userId: user.id)
            listingsCount = listings.count
            followersCount = user.followers?.count ?? 0
            followingCount = user.following?.count ?? 0

            let reservations = (try? await api.getReservations()) ?? []
            reservationsCount = reservations.count
            totalRevenue = reservations.compactMap { $0.totalPrice.map { Int($0) } }.reduce(0, +)
            thisMonthRevenue = totalRevenue / 3 // rough estimate

            // Mock revenue data for chart
            revenueData = [
                .init(month: "Jan", revenue: 1200),
                .init(month: "Feb", revenue: 1800),
                .init(month: "Mar", revenue: 1500),
                .init(month: "Apr", revenue: 2400),
                .init(month: "May", revenue: 2100),
                .init(month: "Jun", revenue: 2800),
                .init(month: "Jul", revenue: 3200),
            ]

            avgRating = listings.compactMap { $0.rating }.reduce(0, +) / Double(max(listings.count, 1))
            totalReviews = listings.compactMap { $0.ratingCount }.reduce(0, +)
        } catch {
            // silent
        }
    }
}

struct RevenueDataPoint: Identifiable {
    let id = UUID()
    let month: String
    let revenue: Int
}
