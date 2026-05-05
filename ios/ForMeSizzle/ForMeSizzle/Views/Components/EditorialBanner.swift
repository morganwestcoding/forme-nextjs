import SwiftUI

// MARK: - Editorial Banner — auto-rotating hero carousel
//
// Matches web DiscoverClient's BANNERS section: 4:1 image, fade transitions,
// italic tag, bold title, subtitle, dot indicators, ForMe wordmark top-right.

struct EditorialBanner: View {
    var isCollapsed: Bool = false
    @State private var activeIndex = 0
    @State private var timer: Timer?

    // Mirrors web/src/components/DiscoverClient.tsx BANNERS so iOS and web
    // show the same hero. Image path is resolved against the web origin via
    // AssetURL — keeps the asset in one place (web/public) instead of also
    // shipping it in Assets.xcassets.
    private let banners: [BannerSlide] = [
        BannerSlide(
            image: "/assets/people/v-drip.png",
            tag: "Featured",
            title: "Look Like Your Next Level.",
            subtitle: "Premium cuts, styles, and treatments from top-tier professionals"
        ),
    ]

    var body: some View {
        VStack(spacing: isCollapsed ? 0 : 12) {
            ZStack {
                // Color.clear establishes the box's size; image fills via overlay
                // so it can't push the layout outward.
                Color.clear
                    .overlay(
                        ZStack {
                            ForEach(Array(banners.enumerated()), id: \.offset) { index, banner in
                                AsyncImage(url: AssetURL.resolve(banner.image)) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image.resizable().scaledToFill()
                                    default:
                                        Color.clear
                                    }
                                }
                                .opacity(index == activeIndex ? 1 : 0)
                                .animation(.easeInOut(duration: 0.7), value: activeIndex)
                            }
                        }
                    )
                    .clipped()

                // Bottom gradient
                LinearGradient(
                    colors: [
                        Color.clear,
                        Color.black.opacity(0.85)
                    ],
                    startPoint: .center,
                    endPoint: .bottom
                )

                // ForMe wordmark — top right
                VStack {
                    HStack {
                        Spacer()
                        FormeWordmark()
                            .frame(width: 28, height: 28)
                    }
                    Spacer()
                }
                .padding(20)

                // Tag, title, subtitle — bottom left
                VStack(alignment: .leading, spacing: 4) {
                    Spacer()
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(banners[activeIndex].tag)
                                .font(.system(size: 13, weight: .regular, design: .serif))
                                .italic()
                                .foregroundColor(Color.white.opacity(0.85))
                                .tracking(0.5)

                            Text(banners[activeIndex].title)
                                .font(ForMe.font(.bold, size: 20))
                                .foregroundColor(.white)

                            Text(banners[activeIndex].subtitle)
                                .font(ForMe.font(.regular, size: 14))
                                .foregroundColor(Color.white.opacity(0.7))
                        }
                        .animation(.easeInOut(duration: 0.5), value: activeIndex)
                        Spacer()
                    }
                }
                .padding(24)
            }
            .frame(height: isCollapsed ? 0 : 200)
            .frame(maxWidth: .infinity)
            .background(ForMe.stone900)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .clipped()
            .animation(
                isCollapsed
                    ? .easeInOut(duration: 0.45).delay(0.3)
                    : .easeInOut(duration: 0.45),
                value: isCollapsed
            )
            .opacity(isCollapsed ? 0 : 1)
            .animation(
                isCollapsed
                    ? .easeInOut(duration: 0.3)
                    : .easeInOut(duration: 0.25).delay(0.45),
                value: isCollapsed
            )

            // Dot indicators — match web: only render when there's more than
            // one banner, otherwise a lonely dot looks broken.
            if banners.count > 1 {
                HStack(spacing: 6) {
                    ForEach(0..<banners.count, id: \.self) { i in
                        Capsule()
                            .fill(i == activeIndex ? ForMe.textPrimary : ForMe.stone300)
                            .frame(width: i == activeIndex ? 16 : 6, height: 6)
                            .animation(.easeInOut(duration: 0.3), value: activeIndex)
                            .onTapGesture {
                                activeIndex = i
                                restartTimer()
                            }
                    }
                }
                .frame(height: isCollapsed ? 0 : 6)
                .clipped()
                .animation(
                    isCollapsed
                        ? .easeInOut(duration: 0.45).delay(0.3)
                        : .easeInOut(duration: 0.45),
                    value: isCollapsed
                )
                .opacity(isCollapsed ? 0 : 1)
                .animation(
                    isCollapsed
                        ? .easeInOut(duration: 0.3)
                        : .easeInOut(duration: 0.25).delay(0.45),
                    value: isCollapsed
                )
            }
        }
        .onAppear {
            startTimer()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }

    private func startTimer() {
        timer?.invalidate()
        guard banners.count > 1 else { return }
        timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
            withAnimation {
                activeIndex = (activeIndex + 1) % banners.count
            }
        }
    }

    private func restartTimer() {
        startTimer()
    }
}

private struct BannerSlide {
    let image: String
    let tag: String
    let title: String
    let subtitle: String
}

// MARK: - ForMe wordmark icon (matches web SVG inside banner)

private struct FormeWordmark: View {
    var body: some View {
        Canvas { context, size in
            let scale = min(size.width, size.height) / 24.0
            let paths = [
                "M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215",
                "M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z",
                "M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843"
            ]
            for pathStr in paths {
                if let path = CGPath.from(svgPath: pathStr) {
                    let scaledPath = Path(path)
                        .applying(CGAffineTransform(scaleX: scale, y: scale))
                    context.stroke(scaledPath, with: .color(.white.opacity(0.75)), lineWidth: 1.5)
                }
            }
        }
    }
}

#Preview {
    EditorialBanner()
        .padding()
        .background(ForMe.background)
}
