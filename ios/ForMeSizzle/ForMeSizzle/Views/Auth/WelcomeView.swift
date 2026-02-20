import SwiftUI

struct WelcomeView: View {
    @State private var showLogin = false
    @State private var showRegister = false
    @State private var appeared = false

    var body: some View {
        NavigationStack {
            VStack {
                Spacer()

                VStack(spacing: 28) {
                    // Logo
                    Image("Logo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 160)

                    // Tagline — serif + sans mix
                    VStack(spacing: 6) {
                        Text("Everything you need,")
                            .font(.system(size: 20, weight: .regular, design: .serif))
                            .foregroundColor(Color(hex: "37352F"))
                        Text("all in one place.")
                            .font(.system(size: 20, weight: .regular, design: .serif))
                            .italic()
                            .foregroundColor(Color(hex: "9B9A97"))
                    }
                }
                .opacity(appeared ? 1 : 0)

                Spacer()

                // Actions
                VStack(spacing: 0) {
                    Button {
                        showRegister = true
                    } label: {
                        Text("Get Started")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(Color(hex: "37352F"))
                            .cornerRadius(10)
                    }
                    .buttonStyle(WelcomePressStyle())

                    Button {
                        showLogin = true
                    } label: {
                        Text("Log in")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(Color(hex: "9B9A97"))
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                    }
                    .buttonStyle(WelcomePressStyle())
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 8)
            }
            .background(Color(hex: "FFFFFF").ignoresSafeArea())
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
            .navigationDestination(isPresented: $showRegister) {
                OnboardingFlowView()
            }
            .onAppear {
                withAnimation(.easeOut(duration: 0.6).delay(0.15)) {
                    appeared = true
                }
            }
        }
    }
}

private struct WelcomePressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.6 : 1.0)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AuthViewModel())
}
