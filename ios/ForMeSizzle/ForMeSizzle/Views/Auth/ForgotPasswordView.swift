import SwiftUI

struct ForgotPasswordView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var isSubmitting = false
    @State private var didSubmit = false
    @State private var error: String?
    @FocusState private var emailFocused: Bool

    private var isValid: Bool {
        email.contains("@") && email.contains(".")
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                VStack(spacing: 6) {
                    Text(didSubmit ? "Check your email" : "Forgot password")
                        .font(ForMe.font(.bold, size: 22))
                        .foregroundColor(ForMe.textPrimary)

                    Text(didSubmit
                         ? "If an account exists for that email, we sent a reset link."
                         : "Enter your email and we'll send you a link to reset your password.")
                        .font(ForMe.font(.regular, size: 14))
                        .foregroundColor(ForMe.textTertiary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, ForMe.space5)
                }
                .padding(.top, 40)
                .padding(.bottom, 32)

                if !didSubmit {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email")
                            .font(ForMe.font(.semibold, size: 12))
                            .foregroundColor(ForMe.textSecondary)

                        TextField("you@example.com", text: $email)
                            .font(ForMe.font(.regular, size: 15))
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .textContentType(.emailAddress)
                            .focused($emailFocused)
                            .padding(.horizontal, ForMe.space4)
                            .padding(.vertical, 14)
                            .background(ForMe.surface)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                    .stroke(emailFocused ? ForMe.borderHover : ForMe.borderLight, lineWidth: 1)
                            )
                    }

                    if let error = error {
                        Text(error)
                            .font(ForMe.font(.medium, size: 12))
                            .foregroundColor(Color(hex: "F43F5E"))
                            .multilineTextAlignment(.center)
                            .padding(.top, ForMe.space3)
                    }

                    Button {
                        Task { await submit() }
                    } label: {
                        if isSubmitting {
                            ForMeLoader(size: .small, color: .white)
                        } else {
                            Text("Send reset link")
                        }
                    }
                    .buttonStyle(ForMeAccentButtonStyle(isEnabled: isValid))
                    .disabled(!isValid || isSubmitting)
                    .padding(.top, 24)
                } else {
                    Button {
                        dismiss()
                    } label: {
                        Text("Back to sign in")
                    }
                    .buttonStyle(ForMeAccentButtonStyle(isEnabled: true))
                    .padding(.top, 24)
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .background(ForMe.background)
        .navigationBarTitleDisplayMode(.inline)
        .tint(ForMe.textPrimary)
        .onAppear {
            if !didSubmit { emailFocused = true }
        }
    }

    private func submit() async {
        emailFocused = false
        isSubmitting = true
        error = nil
        do {
            try await APIService.shared.requestPasswordReset(email: email)
            isSubmitting = false
            withAnimation(.easeInOut(duration: 0.25)) {
                didSubmit = true
            }
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

#Preview {
    NavigationStack {
        ForgotPasswordView()
    }
}
