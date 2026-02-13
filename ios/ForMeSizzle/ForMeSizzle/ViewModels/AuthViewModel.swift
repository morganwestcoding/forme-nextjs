import SwiftUI
import Combine

@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isCheckingAuth = true
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func checkAuthStatus() async {
        guard api.isAuthenticated else {
            isAuthenticated = false
            isCheckingAuth = false
            return
        }

        isCheckingAuth = true
        do {
            currentUser = try await api.getCurrentUser()
            isAuthenticated = true
        } catch {
            isAuthenticated = false
            currentUser = nil
        }
        isCheckingAuth = false
    }

    func login(email: String, password: String) async -> Bool {
        isLoading = true
        error = nil

        do {
            let response = try await api.login(email: email, password: password)
            currentUser = response.user
            isAuthenticated = true
            isLoading = false
            return true
        } catch let apiError as APIError {
            error = apiError.errorDescription
            isLoading = false
            return false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            return false
        }
    }

    func register(_ request: RegisterRequest) async -> Bool {
        isLoading = true
        error = nil

        do {
            let response = try await api.register(request)
            currentUser = response.user
            isAuthenticated = true
            isLoading = false
            return true
        } catch let apiError as APIError {
            error = apiError.errorDescription
            isLoading = false
            return false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            return false
        }
    }

    func logout() {
        api.logout()
        currentUser = nil
        isAuthenticated = false
    }

    func updateProfile(name: String? = nil, bio: String? = nil, location: String? = nil) async -> Bool {
        do {
            currentUser = try await api.updateProfile(ProfileUpdateRequest(
                name: name,
                bio: bio,
                location: location
            ))
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}
