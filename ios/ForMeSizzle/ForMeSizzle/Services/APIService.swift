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

    /// Listings owned by a specific user. Used by the create menu's Worker
    /// permission gate — iOS matches web's `/api/listings?userId=X&limit=1`
    /// check before letting the user add a team member.
    func getListingsForUser(userId: String, limit: Int = 20) async throws -> [Listing] {
        let queryItems = [
            URLQueryItem(name: "userId", value: userId),
            URLQueryItem(name: "limit", value: "\(limit)"),
        ]
        let request = try buildRequest(endpoint: "/listings", queryItems: queryItems)
        let response: ListingsResponse = try await perform(request)
        return response.listings
    }

    // MARK: - Shops

    /// Shops owned by a specific user. Backs Product permission gate.
    func getShopsForUser(userId: String, limit: Int = 20) async throws -> [Shop] {
        let queryItems = [
            URLQueryItem(name: "userId", value: userId),
            URLQueryItem(name: "limit", value: "\(limit)"),
        ]
        let request = try buildRequest(endpoint: "/shops", queryItems: queryItems)
        return try await perform(request)
    }

    func createShop(_ shop: CreateShopRequest) async throws -> Shop {
        let body = try encoder.encode(shop)
        let request = try buildRequest(endpoint: "/shops", method: "POST", body: body)
        return try await perform(request)
    }

    // MARK: - Products

    func createProduct(_ product: CreateProductRequest) async throws -> ProductCreateResponse {
        let body = try encoder.encode(product)
        let request = try buildRequest(endpoint: "/products", method: "POST", body: body)
        return try await perform(request)
    }

    // MARK: - Listing employees
    //
    // The web's /api/listings/[id] PUT is a full-replacement endpoint:
    // you send services + employees + hours and it re-writes them. To
    // append a single employee we fetch the current listing and echo
    // back everything, adding the new row. Matches the web ListingFlow
    // edit-save path.
    func addEmployeeToListing(
        listingId: String,
        userId: String,
        jobTitle: String?,
        serviceIds: [String]
    ) async throws -> Listing {
        let listing = try await getListing(id: listingId)

        let existingEmployees: [[String: Any]] = (listing.employees ?? []).map { e in
            var dict: [String: Any] = [
                "userId": e.userId ?? "",
                "serviceIds": e.serviceIds ?? [],
            ]
            if let jt = e.jobTitle { dict["jobTitle"] = jt }
            return dict
        }

        var newEmployee: [String: Any] = [
            "userId": userId,
            "serviceIds": serviceIds,
        ]
        if let jobTitle = jobTitle, !jobTitle.isEmpty {
            newEmployee["jobTitle"] = jobTitle
        }

        let services: [[String: Any]] = (listing.services ?? []).map { s in
            var dict: [String: Any] = [
                "id": s.id,
                "serviceName": s.serviceName,
                "price": s.price,
            ]
            if let dur = s.duration { dict["duration"] = dur }
            if let cat = s.category { dict["category"] = cat }
            return dict
        }

        let hours: [[String: Any]] = (listing.storeHours ?? []).map { h in
            [
                "dayOfWeek": h.dayOfWeek,
                "openTime": h.openTime ?? "",
                "closeTime": h.closeTime ?? "",
                "isClosed": h.isClosed,
            ]
        }

        let payload: [String: Any] = [
            "title": listing.title,
            "description": listing.description ?? "",
            "category": listing.category,
            "location": listing.location ?? "",
            "address": listing.address ?? "",
            "zipCode": listing.zipCode ?? "",
            "imageSrc": listing.imageSrc ?? "",
            "galleryImages": listing.galleryImages ?? [],
            "services": services,
            "employees": existingEmployees + [newEmployee],
            "storeHours": hours,
        ]

        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try buildRequest(endpoint: "/listings/\(listingId)", method: "PUT", body: body)
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

    // MARK: - User search (for Worker flow employee picker)

    func searchUsers(term: String) async throws -> [CompactUser] {
        struct Wrapped: Codable { let users: [CompactUser] }
        let queryItems = [URLQueryItem(name: "term", value: term)]
        let request = try buildRequest(endpoint: "/search/users", queryItems: queryItems)
        let response: Wrapped = try await perform(request)
        return response.users
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

    // MARK: - Subscription
    //
    // Mirrors web /api/subscription/*:
    //   select    → switch to Bronze (free) locally, no Stripe
    //   checkout  → Stripe Checkout session for Gold / Platinum (paid tiers)
    //   cancel    → schedule cancellation at period end
    //   change    → switch paid plans (Stripe proration)
    //   portal    → billing portal URL for invoices / payment method edits
    // The `platform: "ios"` flag on checkout tells the server to use the
    // ios-return bounce so Stripe's HTTPS success_url ends up sending the
    // user back to the app via the formesizzle:// scheme.

    func selectBronzePlan(interval: String) async throws -> User {
        let body = try encoder.encode(SubscriptionSelectRequest(plan: "Bronze", interval: interval))
        let request = try buildRequest(endpoint: "/subscription/select", method: "POST", body: body)
        return try await perform(request)
    }

    func subscriptionCheckout(planId: String, interval: String, isOnboarding: Bool) async throws -> SubscriptionCheckoutResponse {
        let body = try encoder.encode(SubscriptionCheckoutRequest(
            planId: planId,
            interval: interval,
            platform: "ios",
            metadata: SubscriptionCheckoutMetadata(isOnboarding: isOnboarding ? "true" : "false")
        ))
        let request = try buildRequest(endpoint: "/subscription/checkout", method: "POST", body: body)
        return try await perform(request)
    }

    func cancelSubscription() async throws -> SubscriptionCancelResponse {
        let request = try buildRequest(endpoint: "/subscription/cancel", method: "POST")
        return try await perform(request)
    }

    func changeSubscription(planId: String, interval: String) async throws -> SubscriptionChangeResponse {
        let body = try encoder.encode(SubscriptionChangeRequest(planId: planId, interval: interval))
        let request = try buildRequest(endpoint: "/subscription/change", method: "POST", body: body)
        return try await perform(request)
    }

    func openBillingPortal() async throws -> SubscriptionPortalResponse {
        let request = try buildRequest(endpoint: "/subscription/portal", method: "POST")
        return try await perform(request)
    }

    /// Server-side confirmation of a completed Stripe Checkout session.
    /// Returns the Stripe subscription metadata; we mostly call this just
    /// to give the webhook time to catch up, then re-fetch the user.
    func verifySubscription(sessionId: String) async throws -> SubscriptionVerifyResponse {
        let queryItems = [URLQueryItem(name: "session_id", value: sessionId)]
        let request = try buildRequest(endpoint: "/subscription/verify", queryItems: queryItems)
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

    /// Team view: listings the user OWNS or is an EMPLOYEE of.
    /// Matches the web Team page's listing set.
    func getTeamListings(userId: String) async throws -> [Listing] {
        let queryItems = [
            URLQueryItem(name: "userId", value: userId),
            URLQueryItem(name: "includeEmployed", value: "true"),
        ]
        let request = try buildRequest(endpoint: "/listings", queryItems: queryItems)
        let response: ListingsResponse = try await perform(request)
        return response.listings
    }

    /// Full team data: members with availability and pay agreements, stats,
    /// and today / upcoming bookings. Mirrors the web Team page.
    func getTeamData() async throws -> TeamData {
        let request = try buildRequest(endpoint: "/team/data")
        return try await perform(request)
    }

    /// Bulk update one employee's weekly schedule.
    /// Allowed for the listing owner OR the employee themselves (server-enforced).
    func updateAvailability(employeeId: String, schedule: [TeamAvailability]) async throws {
        let body = try encoder.encode(AvailabilityUpdateRequest(employeeId: employeeId, schedule: schedule))
        let request = try buildRequest(endpoint: "/team/availability", method: "PUT", body: body)
        let _: EmptyResponse = try await perform(request)
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
    let workers: [Employee]?
    let shops: [Shop]?
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

struct CreateShopRequest: Codable {
    var name: String
    var description: String
    var category: String?
    var logo: String
    var coverImage: String?
    var location: String?
    var address: String?
    var zipCode: String?
    var isOnlineOnly: Bool
    var storeUrl: String?
    var galleryImages: [String]
    var shopEnabled: Bool
    var listingId: String?
}

struct CreateProductRequest: Codable {
    var name: String
    var description: String
    var price: Double
    var category: String?
    var image: String
    var images: [String]
    var sizes: [String]
    var shopId: String
}

struct ProductCreateResponse: Codable {
    let id: String?
    let name: String?
    let mainImage: String?
}

// MARK: - Subscription request/response types

struct SubscriptionSelectRequest: Codable {
    let plan: String
    let interval: String
}

struct SubscriptionCheckoutRequest: Codable {
    let planId: String
    let interval: String
    let platform: String
    let metadata: SubscriptionCheckoutMetadata
}

struct SubscriptionCheckoutMetadata: Codable {
    let isOnboarding: String
}

struct SubscriptionCheckoutResponse: Codable {
    let sessionId: String
    let url: String?
}

struct SubscriptionCancelResponse: Codable {
    let ok: Bool?
    let cancelAt: String?
    let currentPeriodEnd: String?
}

struct SubscriptionChangeRequest: Codable {
    let planId: String
    let interval: String
}

struct SubscriptionChangeResponse: Codable {
    let ok: Bool?
    let plan: String?
    let interval: String?
}

struct SubscriptionPortalResponse: Codable {
    let url: String?
}

struct SubscriptionVerifyResponse: Codable {
    let success: Bool?
    let subscription: VerifiedSubscription?

    struct VerifiedSubscription: Codable {
        let id: String?
        let status: String?
        let priceId: String?
        let interval: String?
        let planDisplayName: String?
    }
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


