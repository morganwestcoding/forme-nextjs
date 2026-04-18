import SwiftUI

struct WelcomeView: View {
    @State private var showLogin = false
    @State private var showRegister = false
    @State private var logoReady = false
    @State private var taglineReady = false
    @State private var contentReady = false
    @State private var glowPulse = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                // Top-down vignette
                VStack(spacing: 0) {
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.04),
                            Color.white.opacity(0.01),
                            Color.clear
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 300)
                    Spacer()
                }
                .ignoresSafeArea()

                VStack(spacing: 0) {
                    Spacer()

                    ZStack {
                        // Breathing ambient glow — visible on black
                        Circle()
                            .fill(
                                RadialGradient(
                                    colors: [
                                        Color.white.opacity(0.15),
                                        Color.white.opacity(0.06),
                                        Color.clear
                                    ],
                                    center: .center,
                                    startRadius: 10,
                                    endRadius: 160
                                )
                            )
                            .frame(width: 320, height: 320)
                            .scaleEffect(glowPulse ? 1.1 : 0.92)
                            .opacity(glowPulse ? 1 : 0.4)
                            .animation(
                                .easeInOut(duration: 5)
                                .repeatForever(autoreverses: true),
                                value: glowPulse
                            )

                        // Logo + tagline
                        VStack(spacing: 28) {
                            Image("LogoWhite")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 140)
                                .mask(
                                    RadialGradient(
                                        colors: [.white, .white, .white.opacity(0)],
                                        center: .center,
                                        startRadius: 30,
                                        endRadius: 80
                                    )
                                )
                                .opacity(logoReady ? 1 : 0)
                                .scaleEffect(logoReady ? 1 : 0.95)

                            Text("Your complete business ecosystem")
                                .font(.system(size: 15, weight: .regular))
                                .foregroundColor(Color.white.opacity(0.35))
                                .tracking(0.3)
                                .opacity(taglineReady ? 1 : 0)
                                .offset(y: taglineReady ? 0 : 6)
                        }
                    }

                    Spacer()

                    // Buttons
                    VStack(spacing: 12) {
                        Button {
                            UIImpactFeedbackGenerator(style: .soft).impactOccurred()
                            showRegister = true
                        } label: {
                            Text("Get Started")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.black)
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .contentShape(Rectangle())
                        }
                        .background(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .fill(.white)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                        Button {
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            showLogin = true
                        } label: {
                            Text("Sign In")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white.opacity(0.7))
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .contentShape(Rectangle())
                        }
                        .background(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .stroke(Color.white.opacity(0.18), lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                        Text("By continuing you agree to our Terms & Privacy Policy")
                            .font(.system(size: 11))
                            .foregroundColor(Color.white.opacity(0.2))
                            .multilineTextAlignment(.center)
                            .padding(.top, 8)
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 48)
                    .opacity(contentReady ? 1 : 0)
                    .offset(y: contentReady ? 0 : 16)
                }
            }
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
            .navigationDestination(isPresented: $showRegister) {
                OnboardingFlowView()
            }
            .onAppear {
                withAnimation(.easeOut(duration: 0.7).delay(0.2)) {
                    logoReady = true
                }
                withAnimation(.easeOut(duration: 0.5).delay(0.5)) {
                    taglineReady = true
                }
                withAnimation(.easeOut(duration: 0.6).delay(0.8)) {
                    contentReady = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    glowPulse = true
                }
            }
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AuthViewModel())
}
