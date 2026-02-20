import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss

    @State private var email = ""
    @State private var password = ""
    @FocusState private var focusedField: Field?

    enum Field {
        case email, password
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Text("Welcome back")
                        .font(.largeTitle.bold())

                    Text("Sign in to your account")
                        .foregroundColor(.secondary)
                }
                .padding(.top, 40)

                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .focused($focusedField, equals: .email)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                        .focused($focusedField, equals: .password)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
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
                        if await authViewModel.login(email: email, password: password) {
                            dismiss()
                        }
                    }
                } label: {
                    if authViewModel.isLoading {
                        GridLoader(size: .small, startColor: .white, endColor: .gray)
                    } else {
                        Text("Sign In")
                    }
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(isFormValid ? Color.primary : Color.gray)
                .cornerRadius(12)
                .disabled(!isFormValid || authViewModel.isLoading)

                Button("Forgot password?") {
                    // TODO: Implement forgot password
                }
                .foregroundColor(.secondary)

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }
}

#Preview {
    NavigationStack {
        LoginView()
            .environmentObject(AuthViewModel())
    }
}
