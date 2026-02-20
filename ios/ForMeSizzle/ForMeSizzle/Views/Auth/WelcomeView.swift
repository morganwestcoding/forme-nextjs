import SwiftUI

struct WelcomeView: View {
    @State private var showLogin = false
    @State private var showRegister = false
    @State private var appeared = false
    @State private var drift = false

    private let floatingIcons: [(String, Color)] = [
        ("scissors", Color(hex: "60A5FA")),
        ("sparkles", Color(hex: "F472B6")),
        ("figure.run", Color(hex: "34D399")),
        ("hand.wave.fill", Color(hex: "FBBF24")),
        ("leaf.fill", Color(hex: "A78BFA")),
        ("comb.fill", Color(hex: "FB923C")),
        ("heart.fill", Color(hex: "F87171")),
        ("paintbrush.fill", Color(hex: "E879F9")),
        ("face.smiling", Color(hex: "60A5FA")),
        ("bolt.fill", Color(hex: "FBBF24")),
        ("flame.fill", Color(hex: "FB923C")),
        ("star.fill", Color(hex: "F472B6")),
        ("hands.sparkles.fill", Color(hex: "A78BFA")),
        ("drop.fill", Color(hex: "34D399")),
        ("wand.and.stars", Color(hex: "E879F9")),
        ("eye", Color(hex: "60A5FA")),
        ("mouth.fill", Color(hex: "F87171")),
        ("comb", Color(hex: "FB923C")),
        ("moon.fill", Color(hex: "A78BFA")),
        ("sun.max.fill", Color(hex: "FBBF24")),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color(hex: "0A0A0A").ignoresSafeArea()

                // Floating icons — fills the whole background
                GeometryReader { geo in
                    ForEach(Array(floatingIcons.enumerated()), id: \.offset) { index, item in
                        FloatingIcon(
                            icon: item.0,
                            color: item.1,
                            drift: drift,
                            index: index,
                            bounds: geo.size
                        )
                        .opacity(appeared ? 0.5 : 0)
                    }
                }
                .ignoresSafeArea()

                // Edge fades
                VStack(spacing: 0) {
                    LinearGradient(colors: [Color(hex: "0A0A0A"), .clear], startPoint: .top, endPoint: .bottom)
                        .frame(height: 140)
                    Spacer()
                    LinearGradient(colors: [.clear, Color(hex: "0A0A0A")], startPoint: .top, endPoint: .bottom)
                        .frame(height: 220)
                }
                .ignoresSafeArea()

                // Content
                VStack(spacing: 0) {
                    Spacer()

                    VStack(spacing: 24) {
                        Image("LogoWhite")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 140)

                        // Tagline with shine
                        Text("Everything you need,\nall in one place.")
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                            .multilineTextAlignment(.center)
                            .lineSpacing(5)
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [
                                        .white.opacity(0.9),
                                        .white.opacity(0.5),
                                        .white.opacity(0.9),
                                    ],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                    }
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.97)

                    Spacer()

                    // Actions
                    VStack(spacing: 10) {
                        Button {
                            showRegister = true
                        } label: {
                            Text("Get Started")
                                .font(.system(size: 16, weight: .semibold, design: .rounded))
                                .foregroundColor(Color(hex: "0A0A0A"))
                                .frame(maxWidth: .infinity)
                                .frame(height: 54)
                                .background(
                                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                                        .fill(.white)
                                )
                        }
                        .buttonStyle(WelcomePressStyle())

                        Button {
                            showLogin = true
                        } label: {
                            Text("I already have an account")
                                .font(.system(size: 14, weight: .medium, design: .rounded))
                                .foregroundColor(.white.opacity(0.3))
                                .frame(maxWidth: .infinity)
                                .frame(height: 44)
                        }
                        .buttonStyle(WelcomePressStyle())
                    }
                    .padding(.horizontal, 28)
                    .padding(.bottom, 36)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 12)
                }
            }
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
            .navigationDestination(isPresented: $showRegister) {
                OnboardingFlowView()
            }
            .onAppear {
                withAnimation(.easeOut(duration: 0.9)) {
                    appeared = true
                }
                withAnimation(
                    .easeInOut(duration: 6)
                    .repeatForever(autoreverses: true)
                ) {
                    drift = true
                }
            }
        }
    }
}

// MARK: - Floating icon

private struct FloatingIcon: View {
    let icon: String
    let color: Color
    let drift: Bool
    let index: Int
    let bounds: CGSize

    private var basePosition: CGPoint {
        let positions: [(CGFloat, CGFloat)] = [
            (0.10, 0.08), (0.45, 0.06), (0.80, 0.10), (0.25, 0.18),
            (0.65, 0.20), (0.90, 0.28), (0.08, 0.32), (0.50, 0.30),
            (0.75, 0.42), (0.18, 0.48), (0.55, 0.50), (0.88, 0.52),
            (0.30, 0.58), (0.70, 0.62), (0.12, 0.68), (0.48, 0.72),
            (0.82, 0.70), (0.22, 0.80), (0.60, 0.82), (0.40, 0.90),
        ]
        let pos = positions[index % positions.count]
        return CGPoint(x: bounds.width * pos.0, y: bounds.height * pos.1)
    }

    private var driftOffset: CGSize {
        let dx: CGFloat = index.isMultiple(of: 2) ? 10 : -12
        let dy: CGFloat = index.isMultiple(of: 3) ? -8 : 10
        return CGSize(width: drift ? dx : -dx, height: drift ? dy : -dy)
    }

    var body: some View {
        Image(systemName: icon)
            .font(.system(size: 18, weight: .medium))
            .foregroundColor(color)
            .frame(width: 44, height: 44)
            .background(
                Circle()
                    .fill(color.opacity(0.1))
                    .overlay(
                        Circle()
                            .stroke(color.opacity(0.12), lineWidth: 1)
                    )
            )
            .position(basePosition)
            .offset(driftOffset)
            .animation(
                .easeInOut(duration: Double(5 + index % 4))
                .repeatForever(autoreverses: true)
                .delay(Double(index) * 0.2),
                value: drift
            )
    }
}

// MARK: - Button style

private struct WelcomePressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AuthViewModel())
}
