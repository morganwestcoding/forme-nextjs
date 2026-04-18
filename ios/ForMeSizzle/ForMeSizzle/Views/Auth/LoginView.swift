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
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 6) {
                    Text("Welcome back")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(ForMe.textPrimary)

                    Text("Sign in to your account")
                        .font(.system(size: 14))
                        .foregroundColor(ForMe.textTertiary)
                }
                .padding(.top, 40)
                .padding(.bottom, 32)

                // Form
                VStack(spacing: ForMe.space4) {
                    // Email
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(ForMe.textSecondary)

                        TextField("you@example.com", text: $email)
                            .font(.system(size: 15))
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .textContentType(.emailAddress)
                            .focused($focusedField, equals: .email)
                            .padding(.horizontal, ForMe.space4)
                            .padding(.vertical, 14)
                            .background(ForMe.surface)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                    .stroke(focusedField == .email ? ForMe.borderHover : ForMe.borderLight, lineWidth: 1)
                            )
                    }

                    // Password
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(ForMe.textSecondary)

                        HStack(spacing: 10) {
                            Group {
                                if showPassword {
                                    TextField("Enter your password", text: $password)
                                } else {
                                    SecureField("Enter your password", text: $password)
                                }
                            }
                            .font(.system(size: 15))
                            .textContentType(.password)
                            .focused($focusedField, equals: .password)

                            Button {
                                showPassword.toggle()
                            } label: {
                                Image(systemName: showPassword ? "eye.slash" : "eye")
                                    .font(.system(size: 15))
                                    .foregroundColor(ForMe.textTertiary)
                            }
                        }
                        .padding(.horizontal, ForMe.space4)
                        .padding(.vertical, 14)
                        .background(ForMe.surface)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .stroke(focusedField == .password ? ForMe.borderHover : ForMe.borderLight, lineWidth: 1)
                        )

                        HStack {
                            Spacer()
                            Button("Forgot password?") {
                                // TODO: forgot password flow
                            }
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(ForMe.textTertiary)
                        }
                    }
                }

                // Error
                if let error = authViewModel.error {
                    Text(error)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color(hex: "F43F5E"))
                        .multilineTextAlignment(.center)
                        .padding(.top, ForMe.space3)
                }

                // Submit
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
                .padding(.top, 24)

                // Footer
                HStack(spacing: 4) {
                    Text("Don't have an account?")
                        .foregroundColor(ForMe.textTertiary)
                    Button("Sign up") {
                        dismiss()
                    }
                    .foregroundColor(ForMe.textPrimary)
                    .fontWeight(.semibold)
                }
                .font(.system(size: 13))
                .padding(.top, ForMe.space5)

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .background(ForMe.background)
        .navigationBarTitleDisplayMode(.inline)
        .tint(ForMe.textPrimary)
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
