import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var userType: UserType = .customer
    @FocusState private var focusedField: Field?

    enum Field {
        case name, email, password, confirmPassword
    }

    enum UserType: String, CaseIterable {
        case customer = "customer"
        case provider = "provider"

        var title: String {
            switch self {
            case .customer: return "Book Services"
            case .provider: return "Offer Services"
            }
        }

        var description: String {
            switch self {
            case .customer: return "Find and book beauty & wellness appointments"
            case .provider: return "List your services and manage bookings"
            }
        }

        var icon: String {
            switch self {
            case .customer: return "calendar.badge.plus"
            case .provider: return "storefront"
            }
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Text("Create account")
                        .font(.largeTitle.bold())

                    Text("Join ForMe today")
                        .foregroundColor(.secondary)
                }
                .padding(.top, 20)

                // User type selection
                VStack(alignment: .leading, spacing: 12) {
                    Text("I want to...")
                        .font(.headline)

                    HStack(spacing: 12) {
                        ForEach(UserType.allCases, id: \.self) { type in
                            UserTypeCard(
                                type: type,
                                isSelected: userType == type
                            ) {
                                userType = type
                            }
                        }
                    }
                }

                VStack(spacing: 16) {
                    TextField("Full Name", text: $name)
                        .textContentType(.name)
                        .focused($focusedField, equals: .name)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .focused($focusedField, equals: .email)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                    SecureField("Password", text: $password)
                        .textContentType(.newPassword)
                        .focused($focusedField, equals: .password)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                    SecureField("Confirm Password", text: $confirmPassword)
                        .textContentType(.newPassword)
                        .focused($focusedField, equals: .confirmPassword)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                }

                if !passwordsMatch && !confirmPassword.isEmpty {
                    Text("Passwords don't match")
                        .foregroundColor(.red)
                        .font(.caption)
                }

                if let error = authViewModel.error {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task {
                        focusedField = nil
                        let request = RegisterRequest(
                            name: name,
                            email: email,
                            password: password,
                            userType: userType.rawValue,
                            location: nil,
                            bio: nil,
                            image: nil,
                            jobTitle: nil,
                            isOwnerManager: nil,
                            selectedListing: nil,
                            selectedServices: nil,
                            listingCategory: nil,
                            listingTitle: nil,
                            listingDescription: nil
                        )
                        if await authViewModel.register(request) {
                            dismiss()
                        }
                    }
                } label: {
                    if authViewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Create Account")
                    }
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(isFormValid ? Color.primary : Color.gray)
                .cornerRadius(12)
                .disabled(!isFormValid || authViewModel.isLoading)

                Text("By creating an account, you agree to our Terms of Service and Privacy Policy")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    var passwordsMatch: Bool {
        password == confirmPassword
    }

    var isFormValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        email.contains("@") &&
        password.count >= 6 &&
        passwordsMatch
    }
}

struct UserTypeCard: View {
    let type: RegisterView.UserType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: type.icon)
                    .font(.title2)

                Text(type.title)
                    .font(.subheadline.bold())
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isSelected ? Color.primary.opacity(0.1) : Color(.systemGray6))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.primary : Color.clear, lineWidth: 2)
            )
            .cornerRadius(12)
        }
        .foregroundColor(isSelected ? .primary : .secondary)
    }
}

#Preview {
    NavigationStack {
        RegisterView()
            .environmentObject(AuthViewModel())
    }
}
