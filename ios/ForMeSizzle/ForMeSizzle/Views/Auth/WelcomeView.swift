import SwiftUI

struct WelcomeView: View {
    @State private var showLogin = false
    @State private var showRegister = false
    @State private var logoReady = false
    @State private var taglineReady = false
    @State private var contentReady = false
    @State private var glowPulse = false
    @State private var orbsAnimate = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                // Drifting ambient orbs — slow, premium motion
                DriftingOrbs(animate: orbsAnimate)
                    .ignoresSafeArea()
                    .blur(radius: 60)
                    .opacity(0.7)

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

                // Bottom fade to black — keeps buttons readable
                VStack(spacing: 0) {
                    Spacer()
                    LinearGradient(
                        colors: [
                            Color.clear,
                            Color.black.opacity(0.85),
                            Color.black
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 240)
                }
                .ignoresSafeArea()

                VStack(spacing: 0) {
                    Spacer()

                    ZStack {
                        // Breathing ambient glow behind logo
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
                                .opacity(logoReady ? 1 : 0)
                                .scaleEffect(logoReady ? 1 : 0.95)

                            VStack(spacing: 4) {
                                Text("The professionals you love.")
                                    .foregroundColor(Color.white.opacity(0.65))
                                Text("The experiences you'll remember.")
                                    .foregroundColor(Color.white.opacity(0.45))
                            }
                            .font(ForMe.font(.regular, size: 15))
                            .tracking(0.2)
                            .multilineTextAlignment(.center)
                            .opacity(taglineReady ? 1 : 0)
                            .offset(y: taglineReady ? 0 : 6)
                        }
                    }

                    Spacer()

                    // Buttons
                    VStack(spacing: 12) {
                        Button {
                            Haptics.tap()
                            showRegister = true
                        } label: {
                            Text("Get Started")
                                .font(ForMe.font(.semibold, size: 15))
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
                            Haptics.tap()
                            showLogin = true
                        } label: {
                            Text("Sign In")
                                .font(ForMe.font(.semibold, size: 15))
                                .foregroundColor(.white.opacity(0.8))
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .contentShape(Rectangle())
                        }
                        .background(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .fill(Color.white.opacity(0.08))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                        Text("By continuing you agree to our Terms & Privacy Policy")
                            .font(ForMe.font(.regular, size: 11))
                            .foregroundColor(Color.white.opacity(0.3))
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
                orbsAnimate = true
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

// MARK: - Drifting Orbs Background

private struct DriftingOrbs: View {
    let animate: Bool

    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Orb 1 — warm amber, top-left drift
                Circle()
                    .fill(Color(hex: "C4A882"))
                    .frame(width: 300, height: 300)
                    .offset(
                        x: animate ? -geo.size.width * 0.3 : -geo.size.width * 0.1,
                        y: animate ? -geo.size.height * 0.2 : -geo.size.height * 0.35
                    )
                    .opacity(0.35)
                    .animation(
                        .easeInOut(duration: 18).repeatForever(autoreverses: true),
                        value: animate
                    )

                // Orb 2 — dusty rose, right-center drift
                Circle()
                    .fill(Color(hex: "E8B4B8"))
                    .frame(width: 360, height: 360)
                    .offset(
                        x: animate ? geo.size.width * 0.35 : geo.size.width * 0.15,
                        y: animate ? geo.size.height * 0.05 : geo.size.height * 0.25
                    )
                    .opacity(0.28)
                    .animation(
                        .easeInOut(duration: 22).repeatForever(autoreverses: true),
                        value: animate
                    )

                // Orb 3 — deep blue-gray, bottom-left drift
                Circle()
                    .fill(Color(hex: "86A4BB"))
                    .frame(width: 320, height: 320)
                    .offset(
                        x: animate ? -geo.size.width * 0.15 : -geo.size.width * 0.35,
                        y: animate ? geo.size.height * 0.3 : geo.size.height * 0.15
                    )
                    .opacity(0.3)
                    .animation(
                        .easeInOut(duration: 25).repeatForever(autoreverses: true),
                        value: animate
                    )

                // Orb 4 — muted lavender, top-right drift
                Circle()
                    .fill(Color(hex: "A89BC4"))
                    .frame(width: 280, height: 280)
                    .offset(
                        x: animate ? geo.size.width * 0.2 : geo.size.width * 0.4,
                        y: animate ? -geo.size.height * 0.3 : -geo.size.height * 0.1
                    )
                    .opacity(0.25)
                    .animation(
                        .easeInOut(duration: 20).repeatForever(autoreverses: true),
                        value: animate
                    )
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AuthViewModel())
}
