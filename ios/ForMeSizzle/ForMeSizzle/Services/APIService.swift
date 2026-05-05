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

    /// Request a password-reset email. Always succeeds from the client's view —
    /// the server intentionally returns the same message regardless of whether
    /// the email exists, to prevent account enumeration.
    func requestPasswordReset(email: String) async throws {
        let body = try encoder.encode(["email": email])
        let request = try buildRequest(endpoint: "/auth/forgot-password", method: "POST", body: body)
        let _: PasswordResetResponse = try await perform(request)
    }

    /// Submit a new password using the token from the reset email. Used when
    /// iOS handles the deep-link reset flow itself.
    func resetPassword(token: String, newPassword: String) async throws {
        let body = try encoder.encode(["token": token, "newPassword": newPassword])
        let request = try buildRequest(endpoint: "/auth/reset-password", method: "POST", body: body)
        let _: PasswordResetResponse = try await perform(request)
    }

    // MARK: - Academies

    func getAcademies() async throws -> [Academy] {
        let request = try buildRequest(endpoint: "/academies")
        return try await perform(request)
    }

    // MARK: - Academy management (admin-only)
    //
    // Mirrors /api/academies/[academyId]/services (CRUD) and
    // /api/academies/[academyId]/stripe-connect/{status,onboard}. All endpoints
    // require master/admin role server-side; the iOS surface should gate the
    // entry point, but the server is the source of truth either way.

    func getAcademyServices(academyId: String) async throws -> [Service] {
        let request = try buildRequest(endpoint: "/academies/\(academyId)/services")
        return try await perform(request)
    }

    func createAcademyService(
        academyId: String,
        serviceName: String,
        price: Double,
        category: String
    ) async throws -> Service {
        let body = try encoder.encode(AcademyServiceRequest(
            serviceName: serviceName,
            price: price,
            category: category
        ))
        let request = try buildRequest(endpoint: "/academies/\(academyId)/services", method: "POST", body: body)
        return try await perform(request)
    }

    /// Partial update — only fields that change need to be passed. Server
    /// trims strings and re-rounds price.
    func updateAcademyService(
        academyId: String,
        serviceId: String,
        serviceName: String? = nil,
        price: Double? = nil,
        category: String? = nil
    ) async throws -> Service {
        var payload: [String: Any] = [:]
        if let serviceName { payload["serviceName"] = serviceName }
        if let price { payload["price"] = price }
        if let category { payload["category"] = category }
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try buildRequest(
            endpoint: "/academies/\(academyId)/services/\(serviceId)",
            method: "PATCH",
            body: body
        )
        return try await perform(request)
    }

    func deleteAcademyService(academyId: String, serviceId: String) async throws {
        let request = try buildRequest(
            endpoint: "/academies/\(academyId)/services/\(serviceId)",
            method: "DELETE"
        )
        let _: EmptyResponse = try await perform(request)
    }

    /// Stripe Connect status for an academy. Same shape as the per-user
    /// status endpoint, so we reuse `StripeConnectStatus`.
    func getAcademyStripeConnectStatus(academyId: String) async throws -> StripeConnectStatus {
        let request = try buildRequest(endpoint: "/academies/\(academyId)/stripe-connect/status")
        return try await perform(request)
    }

    /// Returns a Stripe-hosted onboarding URL for an academy. The web's return
    /// URL points at `/admin/academies/{id}?stripe_connect=success`; the
    /// WebView intercepts the redirect on the `stripe_connect=` query so the
    /// return path doesn't need to be iOS-aware.
    func createAcademyStripeConnectOnboarding(academyId: String) async throws -> StripeURLResponse {
        let request = try buildRequest(
            endpoint: "/academies/\(academyId)/stripe-connect/onboard",
            method: "POST"
        )
        return try await perform(request)
    }

    // MARK: - Admin (master/admin only)
    //
    // Mirrors /api/admin/{stats,verifications,disputes,users} GETs and the two
    // mutation routes (verification approve/reject, user suspend/unsuspend).
    // All endpoints role-gate server-side via `requireAdmin`.

    func getAdminStats() async throws -> AdminStats {
        let request = try buildRequest(endpoint: "/admin/stats")
        return try await perform(request)
    }

    func getAdminVerifications() async throws -> [AdminVerification] {
        let request = try buildRequest(endpoint: "/admin/verifications")
        let response: AdminVerificationsResponse = try await perform(request)
        return response.users
    }

    func decideVerification(userId: String, action: String, reason: String? = nil) async throws -> VerificationDecisionResponse {
        var payload: [String: Any] = ["action": action]
        if let reason, !reason.isEmpty { payload["reason"] = reason }
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try buildRequest(endpoint: "/admin/verifications/\(userId)", method: "POST", body: body)
        return try await perform(request)
    }

    func getAdminDisputes() async throws -> [AdminDispute] {
        let request = try buildRequest(endpoint: "/admin/disputes")
        let response: AdminDisputesResponse = try await perform(request)
        return response.disputes
    }

    func getAdminUsers(query: String = "", page: Int = 1, pageSize: Int = 50) async throws -> AdminUsersResponse {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "pageSize", value: "\(pageSize)"),
        ]
        let trimmed = query.trimmingCharacters(in: .whitespaces)
        if !trimmed.isEmpty {
            queryItems.append(URLQueryItem(name: "q", value: trimmed))
        }
        let request = try buildRequest(endpoint: "/admin/users", queryItems: queryItems)
        return try await perform(request)
    }

    /// Suspend or unsuspend a user. `action` must be "suspend" or "unsuspend".
    /// Server rejects suspending yourself or a master admin.
    func suspendUser(userId: String, action: String) async throws -> UserSuspendResponse {
        let body = try encoder.encode(["action": action])
        let request = try buildRequest(endpoint: "/admin/users/\(userId)/suspend", method: "POST", body: body)
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

    // Slim feed for the /maps page — returns listings (storefronts) + workers
    // (independents) with geocoded coordinates only. Mirrors web's
    // /api/listings/map: filters with no lat/lng are excluded server-side.
    func getMapItems(bbox: String? = nil) async throws -> MapItemsResponse {
        var queryItems: [URLQueryItem] = []
        if let bbox = bbox {
            queryItems.append(URLQueryItem(name: "bbox", value: bbox))
        }
        let request = try buildRequest(
            endpoint: "/listings/map",
            queryItems: queryItems.isEmpty ? nil : queryItems
        )
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

    func getReservations() async throws -> ReservationBuckets {
        // Server returns { outgoing, incoming } — a reservation you made
        // (outgoing) can also land in incoming when it's at your own business,
        // and *incoming* covers two routes server-side: listing-owner and
        // assigned-employee. The iOS UI uses the same split so the
        // Upcoming/Past tabs only show your own bookings and the Incoming
        // tab only shows requests from your customers.
        struct ReservationsResponse: Codable {
            let outgoing: [Reservation]
            let incoming: [Reservation]
        }
        let request = try buildRequest(endpoint: "/reservations")
        let response: ReservationsResponse = try await perform(request)
        return ReservationBuckets(
            outgoing: response.outgoing,
            incoming: response.incoming
        )
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

    /// Issue / request a refund. The server distinguishes role internally:
    /// owner+admin process the Stripe refund immediately; customers mark it
    /// "requested" and the owner approves it later. The mobile UI doesn't
    /// need to know which path it took — the caller just refreshes after.
    func refundReservation(id: String, reason: String? = nil) async throws -> RefundResponse {
        let body: Data
        if let reason {
            body = try encoder.encode(["reason": reason])
        } else {
            body = Data("{}".utf8)
        }
        let request = try buildRequest(endpoint: "/reservations/\(id)/refund", method: "POST", body: body)
        return try await perform(request)
    }

    func cancelReservation(id: String) async throws {
        let request = try buildRequest(endpoint: "/reservations/\(id)", method: "DELETE")
        let _: EmptyResponse = try await perform(request)
    }

    // MARK: - Messages

    /// Tell the server the current user is typing. Server emits a TYPING SSE
    /// event to the conversation's other participants; iOS receives that on
    /// the RealtimeService stream.
    func sendTypingPing(conversationId: String) async throws {
        let body = try encoder.encode(["conversationId": conversationId])
        let request = try buildRequest(endpoint: "/sse/typing", method: "POST", body: body)
        let _: EmptyResponse = try await perform(request)
    }

    /// Mark a conversation's incoming messages as read. Server flips
    /// `isRead` and emits MESSAGES_READ to the senders.
    func markConversationRead(conversationId: String) async throws {
        let body = try encoder.encode(["conversationId": conversationId])
        let request = try buildRequest(endpoint: "/messages/read", method: "POST", body: body)
        let _: EmptyResponse = try await perform(request)
    }

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

    // MARK: - Stripe Connect (vendor payouts)

    /// Whether the user has a connected Stripe Express account and the
    /// onboarding/charges/payouts flags. The server hits Stripe live, so
    /// callers should refetch after the user returns from onboarding.
    func getStripeConnectStatus() async throws -> StripeConnectStatus {
        let request = try buildRequest(endpoint: "/stripe-connect/status")
        return try await perform(request)
    }

    /// Returns a Stripe-hosted onboarding URL; iOS opens it in a WebView and
    /// listens for the return-URL redirect to know onboarding finished.
    func createStripeConnectOnboarding() async throws -> StripeURLResponse {
        let request = try buildRequest(endpoint: "/stripe-connect/onboard", method: "POST")
        return try await perform(request)
    }

    /// Returns a Stripe Express dashboard login URL (one-time use). Vendor
    /// uses this to view payouts, balance, payment history.
    func openStripeConnectDashboard() async throws -> StripeURLResponse {
        let request = try buildRequest(endpoint: "/stripe-connect/dashboard", method: "POST")
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

    // Independent providers don't appear in /listings (their shell listings are
    // filtered out — see web getListings.ts). Fetch them separately so Discover
    // can merge them into Trending Professionals.
    func getIndependentWorkers() async throws -> [Employee] {
        let request = try buildRequest(endpoint: "/independent-workers")
        let response: IndependentWorkersResponse = try await perform(request)
        return response.workers
    }

    // Mirrors the web's /profile/[userId] data fetch — returns the full
    // bundle the page renders (user, posts, listings, services they perform
    // as an employee/owner, reviews, and aggregate review stats) in one round
    // trip so the iOS profile screen has everything to draw the new layout.
    func getUserProfile(userId: String) async throws -> UserProfileResponse {
        let request = try buildRequest(endpoint: "/users/\(userId)/profile")
        return try await perform(request)
    }

    // Web POST /api/follow/[id] accepts a `?type=user|listing|shop` query
    // param (defaults to "user"). Pass nil for user follows; "listing"/"shop"
    // for the corresponding entity types.
    func toggleFollow(id: String, type: String? = nil) async throws {
        let queryItems = type.map { [URLQueryItem(name: "type", value: $0)] }
        let request = try buildRequest(endpoint: "/follow/\(id)", method: "POST", queryItems: queryItems)
        let _: EmptyResponse = try await perform(request)
    }

    // MARK: - Reviews

    /// Web POST /api/reviews. `targetType` is "user" or "listing"; pass the
    /// matching id. `reservationId` enables the verified-booking badge when
    /// reviewing a user.
    func submitReview(
        rating: Int,
        comment: String?,
        targetType: String,
        targetUserId: String? = nil,
        targetListingId: String? = nil,
        reservationId: String? = nil
    ) async throws -> Review {
        let body = try encoder.encode(SubmitReviewRequest(
            rating: rating,
            comment: comment,
            targetType: targetType,
            targetUserId: targetUserId,
            targetListingId: targetListingId,
            reservationId: reservationId
        ))
        let request = try buildRequest(endpoint: "/reviews", method: "POST", body: body)
        return try await perform(request)
    }

    func getListingReviews(listingId: String, limit: Int = 20, offset: Int = 0) async throws -> [Review] {
        let items = [
            URLQueryItem(name: "targetType", value: "listing"),
            URLQueryItem(name: "targetListingId", value: listingId),
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "offset", value: "\(offset)"),
        ]
        let request = try buildRequest(endpoint: "/reviews", queryItems: items)
        return try await perform(request)
    }

    func getUserReviews(userId: String, limit: Int = 20, offset: Int = 0) async throws -> [Review] {
        let items = [
            URLQueryItem(name: "targetType", value: "user"),
            URLQueryItem(name: "targetUserId", value: userId),
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "offset", value: "\(offset)"),
        ]
        let request = try buildRequest(endpoint: "/reviews", queryItems: items)
        return try await perform(request)
    }

    /// Toggles the current user's helpful vote on a review.
    func toggleReviewHelpful(reviewId: String) async throws -> ReviewHelpfulResponse {
        let request = try buildRequest(endpoint: "/reviews/\(reviewId)/helpful", method: "POST")
        return try await perform(request)
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

    // MARK: - Team Pay
    //
    // Mirrors /api/team/pay/{agreement,balance,periods,payout}. All endpoints
    // are scoped per-employee. The server enforces role:
    //   • agreement PUT, period POST/PATCH, payout PATCH → owner only
    //   • payout POST → employee only
    //   • balance GET, periods GET, payout GET, agreement GET → owner OR self

    /// The employee's pay agreement, or nil when none has been set up yet.
    func getPayAgreement(employeeId: String) async throws -> TeamPayAgreement? {
        let queryItems = [URLQueryItem(name: "employeeId", value: employeeId)]
        let request = try buildRequest(endpoint: "/team/pay/agreement", queryItems: queryItems)
        let response: PayAgreementResponse = try await perform(request)
        return response.agreement
    }

    /// Owner-only. Upserts the pay agreement. For commission, pass
    /// `splitPercent` and leave rental fields nil. For chair_rental, pass
    /// `rentalAmount` + `rentalFrequency` and leave splitPercent nil.
    func setPayAgreement(
        employeeId: String,
        type: String,
        splitPercent: Double? = nil,
        rentalAmount: Double? = nil,
        rentalFrequency: String? = nil,
        autoApprovePayout: Bool
    ) async throws -> TeamPayAgreement {
        let payload = PayAgreementRequest(
            employeeId: employeeId,
            type: type,
            splitPercent: splitPercent,
            rentalAmount: rentalAmount,
            rentalFrequency: rentalFrequency,
            autoApprovePayout: autoApprovePayout
        )
        let body = try encoder.encode(payload)
        let request = try buildRequest(endpoint: "/team/pay/agreement", method: "PUT", body: body)
        let response: PayAgreementResponse = try await perform(request)
        guard let agreement = response.agreement else {
            throw APIError.serverError("Agreement save returned empty response")
        }
        return agreement
    }

    func getPayBalance(employeeId: String) async throws -> PayBalance {
        let queryItems = [URLQueryItem(name: "employeeId", value: employeeId)]
        let request = try buildRequest(endpoint: "/team/pay/balance", queryItems: queryItems)
        return try await perform(request)
    }

    func getPayPeriods(employeeId: String) async throws -> [PayPeriod] {
        let queryItems = [URLQueryItem(name: "employeeId", value: employeeId)]
        let request = try buildRequest(endpoint: "/team/pay/periods", queryItems: queryItems)
        let response: PayPeriodsResponse = try await perform(request)
        return response.periods
    }

    /// Owner-only. Generates the current period for a chair-rental employee
    /// (server picks the date range based on the agreement frequency).
    func generatePayPeriod(employeeId: String) async throws -> PayPeriod {
        let body = try encoder.encode(GeneratePayPeriodRequest(employeeId: employeeId))
        let request = try buildRequest(endpoint: "/team/pay/periods", method: "POST", body: body)
        return try await perform(request)
    }

    /// Owner-only. Waive a charged period (or recharge a waived one).
    func updatePayPeriodStatus(periodId: String, action: String, reason: String? = nil) async throws -> PayPeriodActionResponse {
        let body = try encoder.encode(PayPeriodActionRequest(periodId: periodId, action: action, reason: reason))
        let request = try buildRequest(endpoint: "/team/pay/periods", method: "PATCH", body: body)
        return try await perform(request)
    }

    func getPayouts(employeeId: String) async throws -> [Payout] {
        let queryItems = [URLQueryItem(name: "employeeId", value: employeeId)]
        let request = try buildRequest(endpoint: "/team/pay/payout", queryItems: queryItems)
        let response: PayoutsResponse = try await perform(request)
        return response.payouts
    }

    /// Employee-only. Requests a payout against the available balance.
    /// Server requires the user's stripeConnectPayoutsEnabled flag — caller
    /// should gate the UI on that before hitting this.
    func requestPayout(employeeId: String, amount: Double, note: String? = nil) async throws -> PayoutCreateResponse {
        let body = try encoder.encode(RequestPayoutRequest(employeeId: employeeId, amount: amount, note: note))
        let request = try buildRequest(endpoint: "/team/pay/payout", method: "POST", body: body)
        return try await perform(request)
    }

    /// Owner-only. Approves a pending payout (triggers Stripe transfer) or
    /// denies it with an optional note.
    func decidePayout(payoutId: String, action: String, note: String? = nil) async throws -> PayoutDecideResponse {
        let body = try encoder.encode(PayoutDecideRequest(payoutId: payoutId, action: action, note: note))
        let request = try buildRequest(endpoint: "/team/pay/payout", method: "PATCH", body: body)
        return try await perform(request)
    }

    func createPost(_ post: CreatePostRequest) async throws -> Post {
        let body = try encoder.encode(post)
        let request = try buildRequest(endpoint: "/post", method: "POST", body: body)
        return try await perform(request)
    }

    /// Owner-only post deletion. Server enforces ownership / admin role.
    func deletePost(id: String) async throws {
        let request = try buildRequest(endpoint: "/post/\(id)", method: "DELETE")
        let _: EmptyResponse = try await perform(request)
    }

    /// Hide a post from the current user's feed (server adds the user to
    /// the post's hiddenBy array; subsequent feed fetches filter it out).
    func hidePost(id: String) async throws {
        let request = try buildRequest(endpoint: "/postActions/\(id)/hide", method: "POST")
        let _: EmptyResponse = try await perform(request)
    }

    /// Mark a post as viewed. Server is idempotent — repeated calls from the
    /// same user are a no-op, so we don't need client-side dedup beyond not
    /// firing twice for the exact same paging snap.
    func markPostView(id: String) async throws {
        let request = try buildRequest(endpoint: "/post/\(id)/view", method: "POST")
        let _: EmptyResponse = try await perform(request)
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
    var galleryImages: [String]?
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

struct AcademyServiceRequest: Codable {
    var serviceName: String
    var price: Double
    var category: String
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
    // `serviceId` stays for legacy compatibility / "lead" service display.
    // `serviceIds` is the canonical multi-service list when the user picks more
    // than one service in the same reservation — web handles both shapes.
    let serviceId: String
    let serviceIds: [String]?
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


