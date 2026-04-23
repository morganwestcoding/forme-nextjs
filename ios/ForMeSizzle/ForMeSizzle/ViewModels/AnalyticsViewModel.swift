import SwiftUI
import Combine

@MainActor
class AnalyticsViewModel: ObservableObject {
    // Presets shown in the date-range picker sidebar. "Customised" isn't
    // a preset per se — it just means `selectedPreset == nil` (the user
    // typed in custom dates or nudged the range away from a preset).
    enum Preset: String, CaseIterable, Identifiable {
        case today, last3Days, last7Days, last30Days, last3Months, last6Months, last1Year
        var id: String { rawValue }

        var title: String {
            switch self {
            case .today:        return "Today"
            case .last3Days:    return "Last 3 Days"
            case .last7Days:    return "Last 7 Days"
            case .last30Days:   return "Last 30 Days"
            case .last3Months:  return "Last 3 Months"
            case .last6Months:  return "Last 6 Months"
            case .last1Year:    return "Last 1 Year"
            }
        }

        var dayCount: Int {
            switch self {
            case .today:        return 1
            case .last3Days:    return 3
            case .last7Days:    return 7
            case .last30Days:   return 30
            case .last3Months:  return 90
            case .last6Months:  return 180
            case .last1Year:    return 365
            }
        }

        // Return a (startOfDay, endOfToday) pair expressed as whole calendar
        // days. The server's half-open windowing makes `end` inclusive, so
        // `Last 3 Days` means today + the two prior days (3 days total).
        func range(relativeTo now: Date = Date()) -> (start: Date, end: Date) {
            let cal = Calendar.current
            let endDay = cal.startOfDay(for: now)
            let startDay = cal.date(byAdding: .day, value: -(dayCount - 1), to: endDay) ?? endDay
            return (startDay, endDay)
        }
    }

    @Published var data: AnalyticsData?
    @Published var isLoading = false
    @Published var error: String?

    // Currently-loaded window. Initialised to "Last 1 Year" so the first
    // render matches what the old duration menu defaulted to.
    @Published var rangeStart: Date
    @Published var rangeEnd: Date
    @Published var selectedPreset: Preset? = .last1Year

    private let api = APIService.shared

    init() {
        let initial = Preset.last1Year.range()
        self.rangeStart = initial.start
        self.rangeEnd = initial.end
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            data = try await api.getAnalytics(start: rangeStart, end: rangeEnd)
        } catch {
            self.error = error.localizedDescription
        }
    }

    func applyPreset(_ preset: Preset) async {
        let r = preset.range()
        rangeStart = r.start
        rangeEnd = r.end
        selectedPreset = preset
        await load()
    }

    func applyCustomRange(start: Date, end: Date) async {
        // A custom range can still coincide with a preset — e.g. the user
        // opens the sheet and hits Apply without changing anything. Check
        // if so, we keep the preset highlighted instead of dropping to
        // "Customised".
        let cal = Calendar.current
        let newStart = cal.startOfDay(for: start)
        let newEnd = cal.startOfDay(for: end)
        rangeStart = newStart
        rangeEnd = newEnd
        selectedPreset = Preset.allCases.first { preset in
            let r = preset.range()
            return cal.isDate(r.start, inSameDayAs: newStart)
                && cal.isDate(r.end,   inSameDayAs: newEnd)
        }
        await load()
    }

    // MARK: - Derived

    // Growth % compares the last bucket vs the previous one. That's only
    // meaningful at monthly granularity — a day-over-day delta plotted as
    // month-over-month would be a lie.
    var showsGrowth: Bool { data?.period.granularity == "month" }

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
