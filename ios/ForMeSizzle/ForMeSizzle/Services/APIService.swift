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
        let isoFractional = ISO8601DateFormatter()
        isoFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let isoBasic = ISO8601DateFormatter()
        isoBasic.formatOptions = [.withInternetDateTime]
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let string = try container.decode(String.self)
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

    // MARK: - Reservations

    func getReservations() async throws -> [Reservation] {
        let request = try buildRequest(endpoint: "/reservations")
        return try await perform(request)
    }

    func createReservation(_ reservation: CreateReservationRequest) async throws -> Reservation {
        let body = try encoder.encode(reservation)
        let request = try buildRequest(endpoint: "/reservations", method: "POST", body: body)
        return try await perform(request)
    }

    func cancelReservation(id: String) async throws {
        let request = try buildRequest(endpoint: "/reservations/\(id)", method: "DELETE")
        let _: EmptyResponse = try await perform(request)
    }

    // MARK: - Messages

    func getConversations() async throws -> [Conversation] {
        let request = try buildRequest(endpoint: "/messages")
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
        return try await perform(request)
    }

    // MARK: - Favorites

    func getFavorites() async throws -> [Listing] {
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

    // MARK: - Providers

    func getProviders(limit: Int = 10) async throws -> [User] {
        let queryItems = [URLQueryItem(name: "limit", value: "\(limit)")]
        let request = try buildRequest(endpoint: "/providers", queryItems: queryItems)
        return try await perform(request)
    }

    // MARK: - Profile

    func updateProfile(_ update: ProfileUpdateRequest) async throws -> User {
        let body = try encoder.encode(update)
        let request = try buildRequest(endpoint: "/profile", method: "POST", body: body)
        return try await perform(request)
    }

    // MARK: - Feed

    func getFeed(page: Int = 1) async throws -> [Post] {
        let queryItems = [URLQueryItem(name: "page", value: "\(page)")]
        let request = try buildRequest(endpoint: "/post", queryItems: queryItems)
        return try await perform(request)
    }

    func likePost(postId: String) async throws {
        let request = try buildRequest(endpoint: "/postActions/like/\(postId)", method: "POST")
        let _: EmptyResponse = try await perform(request)
    }
}

// MARK: - Request/Response Types

struct EmptyResponse: Codable {}

struct CreateReservationRequest: Codable {
    let listingId: String
    let serviceId: String
    let employeeId: String?
    let date: String
    let time: String
    let note: String?
}

struct SearchResponse: Codable {
    let users: [User]?
    let listings: [Listing]?
    let services: [Service]?
}

struct ProfileUpdateRequest: Codable {
    var name: String?
    var bio: String?
    var location: String?
    var image: String?
}
