import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @FocusState private var focusedField: Field?

    enum Field {
        case email, password
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Text("Welcome back")
                        .font(.title.bold())
                        .foregroundColor(ForMe.textPrimary)

                    Text("Sign in to your account")
                        .foregroundColor(ForMe.textSecondary)
                }
                .padding(.top, 40)

                VStack(spacing: 16) {
                    // Email field
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email")
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(ForMe.textPrimary)

                        TextField("you@example.com", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .focused($focusedField, equals: .email)
                            .forMeInput()
                    }

                    // Password field
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password")
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(ForMe.textPrimary)

                        HStack {
                            if showPassword {
                                TextField("Enter your password", text: $password)
                                    .textContentType(.password)
                                    .focused($focusedField, equals: .password)
                            } else {
                                SecureField("Enter your password", text: $password)
                                    .textContentType(.password)
                                    .focused($focusedField, equals: .password)
                            }

                            Button {
                                showPassword.toggle()
                            } label: {
                                Image(systemName: showPassword ? "eye.slash" : "eye")
                                    .foregroundColor(ForMe.textTertiary)
                                    .font(.body)
                            }
                        }
                        .forMeInput()

                        HStack {
                            Spacer()
                            Button("Forgot password?") {
                                // TODO: Implement forgot password
                            }
                            .font(.caption)
                            .foregroundColor(ForMe.accent)
                        }
                    }
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
                        ForMeLoader(size: .small, color: .white)
                    } else {
                        Text("Continue")
                    }
                }
                .buttonStyle(ForMeAccentButtonStyle(isEnabled: isFormValid))
                .disabled(!isFormValid || authViewModel.isLoading)

                HStack(spacing: 4) {
                    Text("First time using ForMe?")
                        .foregroundColor(ForMe.textSecondary)
                    Button("Create an account") {
                        dismiss()
                    }
                    .foregroundColor(ForMe.accent)
                    .fontWeight(.medium)
                }
                .font(.subheadline)

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .background(ForMe.background)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            focusedField = .email
        }
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
