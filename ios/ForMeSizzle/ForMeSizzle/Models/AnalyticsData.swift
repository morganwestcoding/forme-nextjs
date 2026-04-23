import Foundation

// Mirrors web's AnalyticsData (web/src/app/actions/getAnalyticsData.ts).
// Single round trip backs every analytics tab — overview stats, monthly
// timeseries, top services, recent activity, listings table, and review
// aggregates all come from /api/analytics.
struct AnalyticsData: Codable {
    let period: Period
    let overview: Overview
    let reviews: ReviewStatsBlock
    let recentActivity: RecentActivity
    let monthlyData: [MonthlyPoint]
    let topServices: [ServiceStat]
    let listings: [ListingStat]

    struct Period: Codable {
        let start: String
        let end: String
        let label: String
        let days: Int
        let granularity: String   // "day" | "week" | "month"
    }

    struct Overview: Codable {
        let totalListings: Int
        let totalReservations: Int
        let totalRevenue: Double
        let totalPosts: Int
        let totalFollowers: Int
        let totalFollowing: Int
    }

    struct ReviewStatsBlock: Codable {
        let totalReviews: Int
        let averageRating: Double
        let ratingDistribution: [RatingCount]

        struct RatingCount: Codable, Identifiable {
            var id: Int { rating }
            let rating: Int
            let count: Int
        }
    }

    struct RecentActivity: Codable {
        let reservations: [ReservationSummary]
        let posts: [PostSummary]

        struct ReservationSummary: Codable, Identifiable {
            let id: String
            let serviceName: String
            let date: String
            let totalPrice: Double
            let status: String
            let user: MiniUser
            let listing: MiniListing

            struct MiniUser: Codable {
                let name: String?
                let image: String?
            }
            struct MiniListing: Codable {
                let title: String
            }
        }

        struct PostSummary: Codable, Identifiable {
            let id: String
            let content: String
            let createdAt: String
            let likes: [String]
            let comments: Int
        }
    }

    struct MonthlyPoint: Codable, Identifiable {
        var id: String { month }
        let month: String
        let reservations: Int
        let revenue: Double
        let posts: Int
    }

    struct ServiceStat: Codable, Identifiable {
        var id: String { "\(serviceName)-\(category)" }
        let serviceName: String
        let category: String
        let bookings: Int
        let revenue: Double
    }

    struct ListingStat: Codable, Identifiable {
        let id: String
        let title: String
        let category: String
        let reservations: Int
        let revenue: Double
        let createdAt: String
    }
}
