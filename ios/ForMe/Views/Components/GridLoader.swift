import SwiftUI

struct GridLoader: View {
    enum Size {
        case small, medium, large

        var dotSize: CGFloat {
            switch self {
            case .small: return 8
            case .medium: return 12
            case .large: return 16
            }
        }

        var spacing: CGFloat {
            switch self {
            case .small: return 4
            case .medium: return 6
            case .large: return 8
            }
        }
    }

    var size: Size = .medium
    var startColor: Color = Color(white: 0.45)
    var endColor: Color = Color(white: 0.85)
    var dotCount: Int = 7

    private let duration: Double = 0.6
    private let baseDelay: Double = 0.08

    var body: some View {
        HStack(spacing: size.spacing) {
            ForEach(0..<dotCount, id: \.self) { index in
                LoaderDot(
                    dotSize: size.dotSize,
                    startColor: startColor,
                    endColor: endColor,
                    duration: duration,
                    delay: Double(index) * baseDelay
                )
            }
        }
    }
}

private struct LoaderDot: View {
    let dotSize: CGFloat
    let startColor: Color
    let endColor: Color
    let duration: Double
    let delay: Double

    @State private var isAnimating = false

    var body: some View {
        Circle()
            .fill(isAnimating ? endColor : startColor)
            .frame(width: dotSize, height: dotSize)
            .onAppear {
                withAnimation(
                    .easeInOut(duration: duration)
                    .repeatForever(autoreverses: true)
                    .delay(delay)
                ) {
                    isAnimating = true
                }
            }
    }
}

#Preview {
    VStack(spacing: 40) {
        GridLoader(size: .small)
        GridLoader(size: .medium)
        GridLoader(size: .large)

        GridLoader(size: .medium, startColor: .white, endColor: .gray)
            .padding()
            .background(Color.black)
    }
}
