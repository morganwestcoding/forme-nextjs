import Foundation

struct StoreHours: Codable, Identifiable {
    let id: String
    var dayOfWeek: String
    var openTime: String?
    var closeTime: String?
    var isClosed: Bool

    enum CodingKeys: String, CodingKey {
        case id, dayOfWeek, openTime, closeTime, isClosed
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        // Handle both string ("Monday") and int (1) formats
        if let str = try? container.decode(String.self, forKey: .dayOfWeek) {
            dayOfWeek = str
        } else if let num = try? container.decode(Int.self, forKey: .dayOfWeek) {
            let names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            dayOfWeek = (num >= 0 && num < names.count) ? names[num] : "Unknown"
        } else {
            dayOfWeek = "Unknown"
        }
        openTime = try container.decodeIfPresent(String.self, forKey: .openTime)
        closeTime = try container.decodeIfPresent(String.self, forKey: .closeTime)
        isClosed = (try? container.decode(Bool.self, forKey: .isClosed)) ?? false
    }

    var dayName: String { dayOfWeek }
    var shortName: String { String(dayOfWeek.prefix(3)) }
}

extension Array where Element == StoreHours {
    func hours(for dayName: String) -> StoreHours? {
        return first { $0.dayOfWeek.lowercased() == dayName.lowercased() }
    }

    var todayHours: StoreHours? {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        let todayName = formatter.string(from: Date())
        return hours(for: todayName)
    }
}
