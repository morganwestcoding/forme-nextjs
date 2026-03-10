import SwiftUI

struct ForMeLoader: View {
    enum Size {
        case small, medium, large

        var dimension: CGFloat {
            switch self {
            case .small: return 16
            case .medium: return 24
            case .large: return 32
            }
        }

        var lineWidth: CGFloat {
            switch self {
            case .small: return 2
            case .medium: return 2.5
            case .large: return 3
            }
        }
    }

    var size: Size = .medium
    var color: Color = ForMe.textTertiary

    @State private var isSpinning = false

    var body: some View {
        Circle()
            .trim(from: 0, to: 0.7)
            .stroke(color, style: StrokeStyle(lineWidth: size.lineWidth, lineCap: .round))
            .frame(width: size.dimension, height: size.dimension)
            .rotationEffect(.degrees(isSpinning ? 360 : 0))
            .animation(.linear(duration: 0.8).repeatForever(autoreverses: false), value: isSpinning)
            .onAppear {
                isSpinning = true
            }
    }
}

// MARK: - Full Screen Loading View

struct ForMeLoadingView: View {
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 20) {
            ForMeLoader(size: .large)

            Text("ForMe")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(ForMe.textPrimary)
                .opacity(appeared ? 1 : 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ForMe.background)
        .onAppear {
            withAnimation(.easeIn(duration: 0.5)) {
                appeared = true
            }
        }
    }
}

#Preview {
    VStack(spacing: 40) {
        ForMeLoader(size: .small)
        ForMeLoader(size: .medium)
        ForMeLoader(size: .large)
    }
}
