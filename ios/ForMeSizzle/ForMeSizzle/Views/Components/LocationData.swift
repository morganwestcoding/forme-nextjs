import Foundation

// MARK: - Location data sources
//
// Shared between every create flow. Mirrors what the web LocationStep
// does — no keys required:
//   • US_STATES  — hardcoded 50-state list, same order as web.
//   • CitiesAPI  — POST to countriesnow.space/state/cities. Returns an
//     alphabetized list of city names for a given state.
//   • AddressAPI — Nominatim OSM street search. Debounced caller
//     handles the 300ms delay; this just wraps the fetch + dedupe.
//
// Why these services: web picked them because they're free & keyless.
// Keeping parity means iOS hits the same endpoints and renders the
// same suggestions users see on web.

enum LocationData {
    static let usStates: [String] = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming",
    ]
}

// MARK: - Cities (countriesnow)

struct CitiesAPI {
    struct Response: Decodable {
        let error: Bool?
        let data: [String]?
    }

    static func fetch(state: String) async throws -> [String] {
        let url = URL(string: "https://countriesnow.space/api/v0.1/countries/state/cities")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: String] = ["country": "United States", "state": state]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)
        let decoded = try JSONDecoder().decode(Response.self, from: data)
        if decoded.error == true { return [] }
        return (decoded.data ?? []).sorted(by: { $0.localizedCompare($1) == .orderedAscending })
    }
}

// MARK: - Addresses (Nominatim OSM)

struct AddressSuggestion: Identifiable, Hashable {
    let id = UUID()
    let display: String
    let zip: String
}

struct AddressAPI {
    // Matches web LocationStep exactly: street+city+state, dedupe by display,
    // min 3 chars (callers enforce debounce to stay friendly to OSM).
    static func fetch(query: String, city: String, state: String) async throws -> [AddressSuggestion] {
        guard query.count >= 3 else { return [] }

        var components = URLComponents(string: "https://nominatim.openstreetmap.org/search")!
        components.queryItems = [
            URLQueryItem(name: "street", value: query),
            URLQueryItem(name: "city", value: city),
            URLQueryItem(name: "state", value: state),
            URLQueryItem(name: "country", value: "US"),
            URLQueryItem(name: "format", value: "json"),
            URLQueryItem(name: "addressdetails", value: "1"),
            URLQueryItem(name: "limit", value: "6"),
        ]

        var request = URLRequest(url: components.url!)
        request.setValue("en", forHTTPHeaderField: "Accept-Language")
        // Nominatim asks all consumers to identify themselves.
        request.setValue("ForMeSizzle iOS (support@forme.com)", forHTTPHeaderField: "User-Agent")

        let (data, _) = try await URLSession.shared.data(for: request)
        let raw = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] ?? []

        var seen = Set<String>()
        var results: [AddressSuggestion] = []
        for item in raw {
            guard let address = item["address"] as? [String: Any],
                  let road = address["road"] as? String else { continue }
            let house = address["house_number"] as? String
            let display = [house, road].compactMap { $0 }.joined(separator: " ")
            guard !seen.contains(display) else { continue }
            seen.insert(display)
            let zip = (address["postcode"] as? String) ?? ""
            results.append(AddressSuggestion(display: display, zip: zip))
        }
        return results
    }
}
