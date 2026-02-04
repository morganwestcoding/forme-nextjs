import Foundation

struct StoreHours: Codable, Identifiable {
    let id: String
    var dayOfWeek: DayOfWeek
    var openTime: String?
    var closeTime: String?
    var isClosed: Bool

    enum CodingKeys: String, CodingKey {
        case id, dayOfWeek, openTime, closeTime, isClosed
    }
}

enum DayOfWeek: Int, Codable, CaseIterable {
    case sunday = 0
    case monday = 1
    case tuesday = 2
    case wednesday = 3
    case thursday = 4
    case friday = 5
    case saturday = 6

    var name: String {
        switch self {
        case .sunday: return "Sunday"
        case .monday: return "Monday"
        case .tuesday: return "Tuesday"
        case .wednesday: return "Wednesday"
        case .thursday: return "Thursday"
        case .friday: return "Friday"
        case .saturday: return "Saturday"
        }
    }

    var shortName: String {
        return String(name.prefix(3))
    }
}

extension Array where Element == StoreHours {
    func hours(for day: DayOfWeek) -> StoreHours? {
        return first { $0.dayOfWeek == day }
    }

    var todayHours: StoreHours? {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let day = DayOfWeek(rawValue: weekday - 1) ?? .sunday
        return hours(for: day)
    }
}
