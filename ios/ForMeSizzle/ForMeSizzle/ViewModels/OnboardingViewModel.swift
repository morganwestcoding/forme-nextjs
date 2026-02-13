import SwiftUI
import Combine

enum OnboardingStep: Int, CaseIterable, Identifiable {
    case account
    case interests
    case userType
    case jobTitle
    case listingCategory
    case listingInfo
    case location
    case profile

    var id: Int { rawValue }
}

enum OnboardingUserType: String, CaseIterable {
    case customer
    case individual
    case team

    var title: String {
        switch self {
        case .customer: return "Customer"
        case .individual: return "Independent provider"
        case .team: return "Team member"
        }
    }

    var description: String {
        switch self {
        case .customer: return "I want to discover and book services"
        case .individual: return "I offer services on my own"
        case .team: return "I work at a business or salon"
        }
    }

    var icon: String {
        switch self {
        case .customer: return "person.fill"
        case .individual: return "briefcase.fill"
        case .team: return "person.3.fill"
        }
    }
}

@MainActor
class OnboardingViewModel: ObservableObject {
    // MARK: - Account
    @Published var name = ""
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var emailExists = false
    @Published var isCheckingEmail = false

    // MARK: - Interests
    @Published var selectedInterests: [String] = []

    // MARK: - User Type
    @Published var userType: OnboardingUserType = .customer

    // MARK: - Job Title
    @Published var jobTitle = ""
    @Published var isOwnerManager = false

    // MARK: - Listing (Individual)
    @Published var listingCategory: ServiceCategory?
    @Published var listingTitle = ""
    @Published var listingDescription = ""

    // MARK: - Location
    @Published var selectedState = ""
    @Published var city = ""

    // MARK: - Profile
    @Published var bio = ""
    @Published var profileImageData: Data?

    // MARK: - Flow State
    @Published var currentStepIndex = 0
    @Published var isSubmitting = false
    @Published var submitError: String?
    @Published var direction: Int = 1 // 1 = forward, -1 = back

    private let api = APIService.shared

    // MARK: - Steps

    var steps: [OnboardingStep] {
        var flow: [OnboardingStep] = [.account, .interests, .userType]

        switch userType {
        case .customer:
            break
        case .individual:
            flow.append(.jobTitle)
            flow.append(.listingCategory)
            flow.append(.listingInfo)
        case .team:
            flow.append(.jobTitle)
        }

        flow.append(.location)
        flow.append(.profile)
        return flow
    }

    var currentStep: OnboardingStep {
        let allSteps = steps
        guard currentStepIndex < allSteps.count else { return allSteps.last ?? .account }
        return allSteps[currentStepIndex]
    }

    var progress: Double {
        let total = Double(steps.count)
        guard total > 0 else { return 0 }
        return Double(currentStepIndex + 1) / total
    }

    var isFirstStep: Bool {
        currentStepIndex == 0
    }

    var isLastStep: Bool {
        currentStepIndex == steps.count - 1
    }

    // MARK: - Password Validation

    var hasMinLength: Bool { password.count >= 6 }
    var hasUppercase: Bool { password.range(of: "[A-Z]", options: .regularExpression) != nil }
    var hasLowercase: Bool { password.range(of: "[a-z]", options: .regularExpression) != nil }
    var hasNumber: Bool { password.range(of: "[0-9]", options: .regularExpression) != nil }
    var hasSpecialChar: Bool { password.range(of: "[^A-Za-z0-9]", options: .regularExpression) != nil }
    var passwordIsValid: Bool { hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar }
    var passwordsMatch: Bool { password == confirmPassword && !confirmPassword.isEmpty }

    var isValidEmail: Bool {
        let pattern = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
        return email.range(of: pattern, options: .regularExpression) != nil
    }

    // MARK: - Can Proceed

    var canProceed: Bool {
        switch currentStep {
        case .account:
            return !name.trimmingCharacters(in: .whitespaces).isEmpty
                && isValidEmail
                && !emailExists
                && passwordIsValid
                && passwordsMatch
        case .interests:
            return true // optional step
        case .userType:
            return true // always has a selection
        case .jobTitle:
            if userType == .team {
                return isOwnerManager || !jobTitle.trimmingCharacters(in: .whitespaces).isEmpty
            }
            return !jobTitle.trimmingCharacters(in: .whitespaces).isEmpty
        case .listingCategory:
            return listingCategory != nil
        case .listingInfo:
            return !listingTitle.trimmingCharacters(in: .whitespaces).isEmpty
        case .location:
            return !selectedState.isEmpty && !city.trimmingCharacters(in: .whitespaces).isEmpty
        case .profile:
            return true // bio and photo are optional
        }
    }

    // MARK: - Navigation

    func nextStep() {
        guard canProceed else { return }
        if isLastStep { return }
        direction = 1
        withAnimation(.easeInOut(duration: 0.3)) {
            currentStepIndex += 1
        }
    }

    func previousStep() {
        guard currentStepIndex > 0 else { return }
        direction = -1
        withAnimation(.easeInOut(duration: 0.3)) {
            currentStepIndex -= 1
        }
    }

    // When user type changes, clamp step index if needed
    func userTypeChanged() {
        let maxIndex = steps.count - 1
        if currentStepIndex > maxIndex {
            currentStepIndex = maxIndex
        }
    }

    // MARK: - Email Check

    func checkEmail() async {
        guard isValidEmail else {
            emailExists = false
            return
        }
        isCheckingEmail = true
        do {
            emailExists = try await api.checkEmailExists(email: email)
        } catch {
            emailExists = false
        }
        isCheckingEmail = false
    }

    // MARK: - Submit

    var locationString: String? {
        guard !city.isEmpty, !selectedState.isEmpty else { return nil }
        return "\(city), \(selectedState)"
    }

    func buildRegisterRequest() -> RegisterRequest {
        RegisterRequest(
            name: name.trimmingCharacters(in: .whitespaces),
            email: email.trimmingCharacters(in: .whitespaces).lowercased(),
            password: password,
            userType: userType.rawValue,
            location: locationString,
            bio: bio.isEmpty ? nil : bio,
            image: nil, // image upload handled separately in future
            jobTitle: (userType == .individual || userType == .team) && !jobTitle.isEmpty ? jobTitle : nil,
            isOwnerManager: userType == .team ? isOwnerManager : nil,
            selectedListing: nil,
            selectedServices: nil,
            listingCategory: userType == .individual ? listingCategory?.rawValue : nil,
            listingTitle: userType == .individual && !listingTitle.isEmpty ? listingTitle : nil,
            listingDescription: userType == .individual && !listingDescription.isEmpty ? listingDescription : nil
        )
    }

    func submit(authViewModel: AuthViewModel) async -> Bool {
        isSubmitting = true
        submitError = nil

        let request = buildRegisterRequest()
        let success = await authViewModel.register(request)

        if !success {
            submitError = authViewModel.error
        }

        isSubmitting = false
        return success
    }
}
