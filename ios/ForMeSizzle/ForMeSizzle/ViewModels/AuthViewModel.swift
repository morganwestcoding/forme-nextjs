import SwiftUI
import Combine

@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    func checkAuthStatus() async {
        guard api.isAuthenticated else {
            isAuthenticated = false
            return
        }

        isLoading = true
        do {
            currentUser = try await api.getCurrentUser()
            isAuthenticated = true
        } catch {
            isAuthenticated = false
            currentUser = nil
        }
        isLoading = false
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

    func register(name: String, email: String, password: String, userType: String? = nil) async -> Bool {
        isLoading = true
        error = nil

        do {
            let response = try await api.register(name: name, email: email, password: password, userType: userType)
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
