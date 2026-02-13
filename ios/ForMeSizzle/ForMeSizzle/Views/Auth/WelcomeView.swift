import SwiftUI

struct WelcomeView: View {
    @State private var showLogin = false
    @State private var showRegister = false
    @State private var appeared = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Spacer()

                // Logo and tagline
                VStack(spacing: 20) {
                    ForMeLoader(size: .large, color: ForMe.accent)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 10)

                    Text("ForMe")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundColor(ForMe.textPrimary)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 10)

                    Text("Book beauty & wellness services")
                        .font(.title3)
                        .foregroundColor(ForMe.textSecondary)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 10)
                }

                Spacer()

                // Buttons
                VStack(spacing: 12) {
                    Button {
                        showRegister = true
                    } label: {
                        Text("Get Started")
                    }
                    .buttonStyle(ForMeAccentButtonStyle())

                    Button {
                        showLogin = true
                    } label: {
                        Text("I already have an account")
                    }
                    .buttonStyle(ForMeSecondaryButtonStyle())
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 48)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 16)
            }
            .background(ForMe.background)
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
            .navigationDestination(isPresented: $showRegister) {
                OnboardingFlowView()
            }
            .onAppear {
                withAnimation(.easeOut(duration: 0.6).delay(0.1)) {
                    appeared = true
                }
            }
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AuthViewModel())
}
