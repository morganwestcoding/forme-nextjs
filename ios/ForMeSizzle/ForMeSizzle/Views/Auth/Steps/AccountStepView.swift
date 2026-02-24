import SwiftUI

struct AccountStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var focusedField: Field?

    enum Field {
        case name, email, password, confirmPassword
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Heading
            VStack(alignment: .leading, spacing: 8) {
                Text("Create your account")
                    .font(.title.bold())

                Text("Let's get you set up on ForMe")
                    .foregroundColor(ForMe.textSecondary)
            }

            // Fields
            VStack(spacing: 16) {
                // Name
                VStack(alignment: .leading, spacing: 6) {
                    Text("Full name")
                        .font(.subheadline.weight(.medium))

                    TextField("Your name", text: $viewModel.name)
                        .textContentType(.name)
                        .focused($focusedField, equals: .name)
                        .forMeInput()
                }

                // Email
                VStack(alignment: .leading, spacing: 6) {
                    Text("Email")
                        .font(.subheadline.weight(.medium))

                    ZStack(alignment: .leading) {
                        if viewModel.email.isEmpty {
                            Text("Email address")
                                .foregroundColor(ForMe.textTertiary)
                        }
                        TextField("", text: $viewModel.email)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .autocorrectionDisabled()
                            .focused($focusedField, equals: .email)
                    }
                    .forMeInput()
                        .onChange(of: viewModel.email) {
                            viewModel.emailExists = false
                        }
                        .onSubmit {
                            Task { await viewModel.checkEmail() }
                        }

                    if viewModel.isCheckingEmail {
                        HStack(spacing: 4) {
                            ProgressView()
                                .scaleEffect(0.7)
                            Text("Checking email...")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    } else if viewModel.emailExists {
                        Text("This email is already registered")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }

                // Password
                VStack(alignment: .leading, spacing: 6) {
                    Text("Password")
                        .font(.subheadline.weight(.medium))

                    SecureField("Create a password", text: $viewModel.password)
                        .textContentType(.newPassword)
                        .focused($focusedField, equals: .password)
                        .forMeInput()

                    // Password requirements
                    if !viewModel.password.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            PasswordRequirement(label: "6+ characters", met: viewModel.hasMinLength)
                            PasswordRequirement(label: "Uppercase letter", met: viewModel.hasUppercase)
                            PasswordRequirement(label: "Lowercase letter", met: viewModel.hasLowercase)
                            PasswordRequirement(label: "Number", met: viewModel.hasNumber)
                            PasswordRequirement(label: "Special character", met: viewModel.hasSpecialChar)
                        }
                        .padding(.top, 4)
                    }
                }

                // Confirm Password
                VStack(alignment: .leading, spacing: 6) {
                    Text("Confirm password")
                        .font(.subheadline.weight(.medium))

                    SecureField("Re-enter your password", text: $viewModel.confirmPassword)
                        .textContentType(.newPassword)
                        .focused($focusedField, equals: .confirmPassword)
                        .forMeInput()

                    if !viewModel.confirmPassword.isEmpty && !viewModel.passwordsMatch {
                        Text("Passwords don't match")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
            }
        }
        .onAppear {
            focusedField = viewModel.name.isEmpty ? .name : nil
        }
    }
}

struct PasswordRequirement: View {
    let label: String
    let met: Bool

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: met ? "checkmark.circle.fill" : "circle")
                .font(.caption)
                .foregroundColor(met ? ForMe.statusConfirmed : ForMe.textTertiary)

            Text(label)
                .font(.caption)
                .foregroundColor(met ? ForMe.textPrimary : ForMe.textTertiary)
        }
    }
}
