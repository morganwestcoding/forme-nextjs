import SwiftUI
import Combine

@MainActor
class AnalyticsViewModel: ObservableObject {
    @Published var data: AnalyticsData?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            data = try await api.getAnalytics()
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Derived stats (mirror web's Overview tab growth calcs)

    var reservationGrowth: Double {
        guard let data = data, data.monthlyData.count >= 2 else { return 0 }
        let cur = data.monthlyData.last!.reservations
        let prev = data.monthlyData[data.monthlyData.count - 2].reservations
        guard prev > 0 else { return 0 }
        return (Double(cur - prev) / Double(prev)) * 100
    }

    var revenueGrowth: Double {
        guard let data = data, data.monthlyData.count >= 2 else { return 0 }
        let cur = data.monthlyData.last!.revenue
        let prev = data.monthlyData[data.monthlyData.count - 2].revenue
        guard prev > 0 else { return 0 }
        return ((cur - prev) / prev) * 100
    }

    // Reviews needed to reach target rating — matches web's
    // calculateReviewsNeeded. Assumes all new reviews are 5-star.
    func reviewsNeeded(to target: Double) -> Int {
        guard let reviews = data?.reviews, reviews.totalReviews > 0 else { return 0 }
        if reviews.averageRating >= target { return 0 }
        let currentSum = reviews.ratingDistribution.reduce(0.0) {
            $0 + Double($1.rating * $1.count)
        }
        let denom = 5 - target
        guard denom > 0 else { return 0 }
        let needed = ceil((target * Double(reviews.totalReviews) - currentSum) / denom)
        return max(Int(needed), 0)
    }
}
