import SwiftUI

struct WelcomeView: View {
    @State private var showLogin = false
    @State private var showRegister = false
    @State private var particlesReady = false
    @State private var contentReady = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color(hex: "0A0A0A").ignoresSafeArea()

                // Particle field
                ParticleFieldView()
                    .ignoresSafeArea()
                    .opacity(particlesReady ? 1 : 0)

                // Content
                VStack(spacing: 0) {
                    Spacer()

                    Image("LogoWhite")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 200)
                        .shadow(color: .white.opacity(0.15), radius: 20, x: 0, y: 0)
                        .opacity(contentReady ? 1 : 0)
                        .scaleEffect(contentReady ? 1 : 0.97)

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
                                        .shadow(color: .white.opacity(0.15), radius: 20, x: 0, y: 0)
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
                    .opacity(contentReady ? 1 : 0)
                    .offset(y: contentReady ? 0 : 12)
                }
            }
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
            .navigationDestination(isPresented: $showRegister) {
                OnboardingFlowView()
            }
            .onAppear {
                withAnimation(.easeOut(duration: 0.8)) {
                    particlesReady = true
                }
                withAnimation(.easeOut(duration: 0.9).delay(0.6)) {
                    contentReady = true
                }
            }
        }
    }
}

// MARK: - Particle field

private struct Particle: Identifiable {
    let id = UUID()
    var x: CGFloat
    var y: CGFloat
    let size: CGFloat
    let opacity: Double
    let speed: CGFloat
    let color: Color
}

private struct ParticleFieldView: View {
    @State private var particles: [Particle] = []

    private let colors: [Color] = [
        Color(hex: "60A5FA"),
        Color(hex: "A78BFA"),
        Color(hex: "F472B6"),
        Color(hex: "34D399"),
        .white,
        .white,
        .white,
    ]

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { timeline in
            Canvas { context, size in
                for particle in particles {
                    let rect = CGRect(
                        x: particle.x - particle.size / 2,
                        y: particle.y - particle.size / 2,
                        width: particle.size,
                        height: particle.size
                    )
                    context.opacity = particle.opacity
                    context.fill(
                        Circle().path(in: rect),
                        with: .color(particle.color)
                    )
                }
            }
            .onChange(of: timeline.date) {
                updateParticles()
            }
        }
        .onAppear {
            spawnInitialParticles()
        }
    }

    private func spawnInitialParticles() {
        particles = (0..<60).map { _ in
            Particle(
                x: CGFloat.random(in: 0...UIScreen.main.bounds.width),
                y: CGFloat.random(in: 0...UIScreen.main.bounds.height),
                size: CGFloat.random(in: 2...5),
                opacity: Double.random(in: 0.25...0.7),
                speed: CGFloat.random(in: 0.15...0.6),
                color: colors.randomElement()!
            )
        }
    }

    private func updateParticles() {
        for i in particles.indices {
            particles[i].y -= particles[i].speed
            particles[i].x += CGFloat.random(in: -0.15...0.15)

            if particles[i].y < -10 {
                particles[i].y = UIScreen.main.bounds.height + 10
                particles[i].x = CGFloat.random(in: 0...UIScreen.main.bounds.width)
            }
        }
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
