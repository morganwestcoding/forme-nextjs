import SwiftUI

struct ForMeLoader: View {
    enum Size {
        case small, medium, large

        var blockSize: CGFloat {
            switch self {
            case .small: return 6
            case .medium: return 10
            case .large: return 14
            }
        }

        var spacing: CGFloat {
            switch self {
            case .small: return 3
            case .medium: return 4
            case .large: return 5
            }
        }
    }

    var size: Size = .medium
    var color: Color = ForMe.accent

    @State private var animating = false

    var body: some View {
        let blocks = 9
        let columns = 3

        VStack(spacing: size.spacing) {
            ForEach(0..<columns, id: \.self) { row in
                HStack(spacing: size.spacing) {
                    ForEach(0..<columns, id: \.self) { col in
                        let index = row * columns + col
                        RoundedRectangle(cornerRadius: size.blockSize * 0.2)
                            .fill(color)
                            .frame(width: size.blockSize, height: size.blockSize)
                            .opacity(animating ? opacity(for: index, total: blocks) : 0.2)
                            .scaleEffect(animating ? scale(for: index, total: blocks) : 0.6)
                            .animation(
                                .easeInOut(duration: 0.6)
                                    .repeatForever(autoreverses: true)
                                    .delay(Double(index) * 0.08),
                                value: animating
                            )
                    }
                }
            }
        }
        .onAppear {
            animating = true
        }
    }

    private func opacity(for index: Int, total: Int) -> Double {
        let phase = Double(index) / Double(total)
        return 0.4 + (0.6 * phase)
    }

    private func scale(for index: Int, total: Int) -> CGFloat {
        let phase = Double(index) / Double(total)
        return 0.8 + (0.2 * CGFloat(phase))
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
        ForMeLoader(size: .large, color: .red)
    }
}
