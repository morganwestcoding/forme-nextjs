import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case notFound
    case serverError(String)
    case decodingError(Error)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid response from server"
        case .unauthorized: return "Please log in again"
        case .notFound: return "Not found"
        case .serverError(let message): return message
        case .decodingError(let error): return "Data error: \(error.localizedDescription)"
        case .networkError(let error): return "Network error: \(error.localizedDescription)"
        }
    }
}

@MainActor
class APIService {
    static let shared = APIService()

    #if DEBUG
    private let baseURL = "http://localhost:3000/api"
    #else
    private let baseURL = "https://yourproductiondomain.com/api"
    #endif

    private var authToken: String? {
        get { KeychainService.shared.getToken() }
        set {
            if let token = newValue {
                KeychainService.shared.saveToken(token)
            } else {
                KeychainService.shared.deleteToken()
            }
        }
    }

    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let string = try container.decode(String.self)
            let isoFractional = ISO8601DateFormatter()
            isoFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            let isoBasic = ISO8601DateFormatter()
            isoBasic.formatOptions = [.withInternetDateTime]
            if let date = isoFractional.date(from: string) { return date }
            if let date = isoBasic.date(from: string) { return date }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date: \(string)")
        }
        return decoder
    }()

    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    private init() {}

    // MARK: - Request Building

    private func buildRequest(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        queryItems: [URLQueryItem]? = nil
    ) throws -> URLRequest {
        var components = URLComponents(string: "\(baseURL)\(endpoint)")
        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = body
        return request
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }

            switch httpResponse.statusCode {
            case 200...299:
                do {
                    return try decoder.decode(T.self, from: data)
                } catch {
                    throw APIError.decodingError(error)
                }
            case 401:
                authToken = nil
                throw APIError.unauthorized
            case 404:
                throw APIError.notFound
            default:
                let message = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw APIError.serverError(message)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }

    // MARK: - Auth

    func login(email: String, password: String) async throws -> AuthResponse {
        let body = try encoder.encode(LoginRequest(email: email, password: password))
        let request = try buildRequest(endpoint: "/auth/login", method: "POST", body: body)
        let response: AuthResponse = try await perform(request)
        authToken = response.token
        return response
    }

    func register(_ registerRequest: RegisterRequest) async throws -> AuthResponse {
        let body = try encoder.encode(registerRequest)
        let request = try buildRequest(endpoint: "/register", method: "POST", body: body)
        let response: AuthResponse = try await perform(request)
        authToken = response.token
        return response
    }

    func checkEmailExists(email: String) async throws -> Bool {
        let queryItems = [URLQueryItem(name: "email", value: email)]
        let request = try buildRequest(endpoint: "/check-email", queryItems: queryItems)
        let response: CheckEmailResponse = try await perform(request)
        return response.exists
    }

    // MARK: - Academies

    func getAcademies() async throws -> [Academy] {
        let request = try buildRequest(endpoint: "/academies")
        return try await perform(request)
    }

    func getCurrentUser() async throws -> User {
        let request = try buildRequest(endpoint: "/profile")
        return try await perform(request)
    }

    func logout() {
        authToken = nil
    }

    var isAuthenticated: Bool {
        authToken != nil
    }

    // MARK: - Listings

    func getListings(
        category: ServiceCategory? = nil,
        location: String? = nil,
        page: Int = 1,
        limit: Int = 20
    ) async throws -> ListingsResponse {
        var queryItems = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        if let category = category {
            queryItems.append(URLQueryItem(name: "category", value: category.rawValue))
        }
        if let location = location {
            queryItems.append(URLQueryItem(name: "location", value: location))
        }

        let request = try buildRequest(endpoint: "/listings", queryItems: queryItems)
        return try await perform(request)
    }

    func getListing(id: String) async throws -> Listing {
        let request = try buildRequest(endpoint: "/listings/\(id)")
        return try await perform(request)
    }

    func getListingServices(listingId: String) async throws -> [Service] {
        let request = try buildRequest(endpoint: "/listings/\(listingId)/services")
        return try await perform(request)
    }

    func deleteListing(id: String) async throws {
        let request = try buildRequest(endpoint: "/listings/\(id)", method: "DELETE")
        let _: EmptyResponse = try await perform(request)
    }

    func createListing(_ listing: CreateListingRequest) async throws -> Listing {
        let body = try encoder.encode(listing)
        let request = try buildRequest(endpoint: "/listings", method: "POST", body: body)
        return try await perform(request)
    }

    // MARK: - Reservations

    func getReservations() async throws -> [Reservation] {
        // Server returns { outgoing, incoming } — a reservation you made
        // (outgoing) can also be on a listing you own (incoming), so
        // dedupe by id when flattening for the bookings list.
        struct ReservationsResponse: Codable {
            let outgoing: [Reservation]
            let incoming: [Reservation]
        }
        let request = try buildRequest(endpoint: "/reservations")
        let response: ReservationsResponse = try await perform(request)
        var seen = Set<String>()
        var combined: [Reservation] = []
        for r in response.outgoing + response.incoming where !seen.contains(r.id) {
            seen.insert(r.id)
            combined.append(r)
        }
        return combined
    }

    func createReservation(_ reservation: CreateReservationRequest) async throws -> Reservation {
        let body = try encoder.encode(reservation)
        let request = try buildRequest(endpoint: "/reservations", method: "POST", body: body)
        return try await perform(request)
    }

    // MARK: - Checkout

    func createCheckoutSession(_ checkout: CheckoutRequest) async throws -> CheckoutResponse {
        let body = try encoder.encode(checkout)
        let request = try buildRequest(endpoint: "/checkout", method: "POST", body: body)
        return try await perform(request)
    }

    func updateReservationStatus(id: String, status: String) async throws {
        let body = try encoder.encode(["status": status])
        let request = try buildRequest(endpoint: "/reservations/\(id)", method: "POST", body: body)
        let _: EmptyResponse = try await perform(request)
    }

    func cancelReservation(id: String) async throws {
        let request = try buildRequest(endpoint: "/reservations/\(id)", method: "DELETE")
        let _: EmptyResponse = try await perform(request)
    }

    // MARK: - Messages

    func startConversation(userId: String) async throws -> Conversation {
        let body = try encoder.encode(["userId": userId])
        let request = try buildRequest(endpoint: "/conversations", method: "POST", body: body)
        return try await perform(request)
    }

    func getConversations() async throws -> [Conversation] {
        let request = try buildRequest(endpoint: "/conversations")
        return try await perform(request)
    }

    func getMessages(conversationId: String) async throws -> [Message] {
        let request = try buildRequest(endpoint: "/messages/\(conversationId)")
        return try await perform(request)
    }

    func sendMessage(conversationId: String?, recipientId: String?, content: String) async throws -> Message {
        let body = try encoder.encode(SendMessageRequest(
            conversationId: conversationId,
            recipientId: recipientId,
            content: content
        ))
        let request = try buildRequest(endpoint: "/messages", method: "POST", body: body)
        return try await perform(request)
    }

    // MARK: - Search

    func search(query: String) async throws -> SearchResponse {
        let queryItems = [URLQueryItem(name: "q", value: query)]
        let request = try buildRequest(endpoint: "/search", queryItems: queryItems)
        let (data, response) = try await URLSession.shared.data(for: request)
        let http = response as? HTTPURLResponse
        let statusCode = http?.statusCode ?? -1
        let raw = String(data: data, encoding: .utf8) ?? "nil"
        print("[API Search] status=\(statusCode) raw=\(raw.prefix(500))")
        guard (200...299).contains(statusCode) else {
            throw APIError.serverError("Search failed with status \(statusCode): \(raw.prefix(200))")
        }
        return try decoder.decode(SearchResponse.self, from: data)
    }

    // MARK: - Analytics

    func getAnalytics(start: Date, end: Date) async throws -> AnalyticsData {
        // Send date-only "YYYY-MM-DD" in the user's local calendar. Pass
        // via `queryItems` rather than embedding in the endpoint string —
        // `buildRequest` assigns `components.queryItems = queryItems`,
        // which will WIPE any inline query string when the argument is
        // nil. (That was the silent bug behind the stale chart: the
        // server saw bare `/analytics` and fell through to the default.)
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        df.calendar = Calendar.current
        df.timeZone = .current
        let items = [
            URLQueryItem(name: "start", value: df.string(from: start)),
            URLQueryItem(name: "end",   value: df.string(from: end)),
        ]
        let request = try buildRequest(endpoint: "/analytics", queryItems: items)
        return try await perform(request)
    }

    // MARK: - Favorites

    func getFavorites() async throws -> FavoritesResponse {
        let request = try buildRequest(endpoint: "/favorites")
        return try await perform(request)
    }

    func addFavorite(listingId: String) async throws {
        let request = try buildRequest(endpoint: "/favorites/\(listingId)", method: "POST")
        let _: EmptyResponse = try await perform(request)
    }

    func removeFavorite(listingId: String) async throws {
        let request = try buildRequest(endpoint: "/favorites/\(listingId)", method: "DELETE")
        let _: EmptyResponse = try await perform(request)
    }

    // MARK: - Profile

    func updateProfile(_ update: ProfileUpdateRequest) async throws -> User {
        let body = try encoder.encode(update)
        let request = try buildRequest(endpoint: "/profile", method: "POST", body: body)
        return try await perform(request)
    }

    // MARK: - Users

    func getUser(id: String) async throws -> User {
        let request = try buildRequest(endpoint: "/users/\(id)")
        return try await perform(request)
    }

    // Mirrors the web's /profile/[userId] data fetch — returns the full
    // bundle the page renders (user, posts, listings, services they perform
    // as an employee/owner, reviews, and aggregate review stats) in one round
    // trip so the iOS profile screen has everything to draw the new layout.
    func getUserProfile(userId: String) async throws -> UserProfileResponse {
        let request = try buildRequest(endpoint: "/users/\(userId)/profile")
        return try await perform(request)
    }

    func toggleFollow(userId: String) async throws {
        let request = try buildRequest(endpoint: "/follow/\(userId)", method: "POST")
        let _: EmptyResponse = try await perform(request)
    }

    // MARK: - Notifications

    func getNotifications() async throws -> [AppNotification] {
        let request = try buildRequest(endpoint: "/notifications")
        return try await perform(request)
    }

    func markNotificationRead(id: String) async throws {
        let request = try buildRequest(endpoint: "/notifications/\(id)/read", method: "PATCH")
        let _: EmptyResponse = try await perform(request)
    }

    func markAllNotificationsRead() async throws {
        let request = try buildRequest(endpoint: "/notifications/read-all", method: "PATCH")
        let _: EmptyResponse = try await perform(request)
    }

    // MARK: - Feed

    func getFeed(page: Int = 1) async throws -> [Post] {
        let queryItems = [URLQueryItem(name: "page", value: "\(page)")]
        let request = try buildRequest(endpoint: "/post", queryItems: queryItems)
        return try await perform(request)
    }

    func getUserPosts(userId: String) async throws -> [Post] {
        let queryItems = [URLQueryItem(name: "userId", value: userId)]
        let request = try buildRequest(endpoint: "/post", queryItems: queryItems)
        return try await perform(request)
    }

    func getUserListings(userId: String) async throws -> [Listing] {
        let queryItems = [URLQueryItem(name: "userId", value: userId)]
        let request = try buildRequest(endpoint: "/listings", queryItems: queryItems)
        let response: ListingsResponse = try await perform(request)
        return response.listings
    }

    func createPost(_ post: CreatePostRequest) async throws -> Post {
        let body = try encoder.encode(post)
        let request = try buildRequest(endpoint: "/post", method: "POST", body: body)
        return try await perform(request)
    }

    func likePost(postId: String) async throws -> LikeResponse {
        let request = try buildRequest(endpoint: "/postActions/\(postId)/like", method: "POST")
        return try await perform(request)
    }

    func bookmarkPost(postId: String) async throws {
        let request = try buildRequest(endpoint: "/postActions/\(postId)/bookmark", method: "POST")
        let _: EmptyResponse = try await perform(request)
    }

    func commentOnPost(postId: String, content: String) async throws -> Comment {
        let body = try encoder.encode(["content": content])
        let request = try buildRequest(endpoint: "/postActions/\(postId)/comment", method: "POST", body: body)
        return try await perform(request)
    }
}

struct LikeResponse: Codable {
    let likes: [String]?
}

struct FavoritesResponse: Codable {
    let listings: [Listing]
    let posts: [Post]
}

// MARK: - Request/Response Types

struct EmptyResponse: Codable {}

struct CreateListingRequest: Codable {
    var title: String
    var description: String
    var category: String
    var location: String
    var address: String
    var zipCode: String
    var imageSrc: String?
}

struct CreatePostRequest: Codable {
    var content: String?
    var imageSrc: String?
    var mediaUrl: String?
    var mediaType: String?
    var beforeImageSrc: String?
    var category: String?
    var location: String?
    var postType: String? // "text" | "ad" | "reel"
}

struct CheckoutRequest: Codable {
    let totalPrice: Double
    let date: String
    let time: String
    let listingId: String
    let serviceId: String
    let serviceName: String
    let employeeId: String
    let employeeName: String?
    let note: String?
    let businessName: String?
    let platform: String // "ios"
}

struct CheckoutResponse: Codable {
    let sessionId: String
    let url: String?
}

struct CreateReservationRequest: Codable {
    let listingId: String
    let serviceId: String
    let serviceName: String
    let employeeId: String
    let date: String
    let time: String
    let totalPrice: Double
    let note: String?
}

struct SearchResponse: Codable {
    let results: [SearchResultItem]?
}

// MARK: - Unified Profile Response

// Mirrors GET /users/[userId]/profile on the web. `services` are the
// ProviderService rows the web returns (every service this user can
// perform, whether owner or assigned employee) — we accept them as plain
// `Service` since iOS Service has all the same fields plus listingId.
struct UserProfileResponse: Decodable {
    let user: User
    let listings: [Listing]?
    let posts: [Post]?
    let services: [Service]?
    let reviews: [Review]?
    let reviewStats: ReviewStats?
}

struct ReviewStats: Decodable, Hashable {
    let totalCount: Int
    let averageRating: Double
}

struct SearchResultItem: Codable, Identifiable, Hashable {
    let id: String
    let type: String
    let title: String?
    let subtitle: String?
    let image: String?
    let href: String?

    var displayTitle: String { title ?? "" }

    static func == (lhs: SearchResultItem, rhs: SearchResultItem) -> Bool {
        lhs.id == rhs.id && lhs.type == rhs.type
    }
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
        hasher.combine(type)
    }

    var typeLabel: String {
        switch type {
        case "user": return "Users"
        case "listing": return "Businesses"
        case "post": return "Posts"
        case "shop": return "Shops"
        case "product": return "Products"
        case "employee": return "Professionals"
        case "service": return "Services"
        default: return type.capitalized
        }
    }
}


