import SwiftUI

struct DynamicAvatar: View {
    let name: String
    var imageUrl: String?
    var size: Size = .medium
    var showBorder: Bool = true

    enum Size {
        case tiny, small, smallMedium, medium, large, extraLarge

        var dimension: CGFloat {
            switch self {
            case .tiny: return 22
            case .small: return 32
            case .smallMedium: return 38
            case .medium: return 48
            case .large: return 96
            case .extraLarge: return 110
            }
        }

        var fontSize: CGFloat {
            switch self {
            case .tiny: return 9
            case .small: return 12
            case .smallMedium: return 15
            case .medium: return 18
            case .large: return 28
            case .extraLarge: return 36
            }
        }

        var borderWidth: CGFloat {
            switch self {
            case .tiny: return 1
            case .small: return 1.5
            case .smallMedium: return 1.5
            case .medium: return 2
            case .large: return 2.5
            case .extraLarge: return 3
            }
        }
    }

    var body: some View {
        if let url = imageUrl, !url.isEmpty, let imageURL = URL(string: url) {
            AsyncImage(url: imageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                initialsView
            }
            .frame(width: size.dimension, height: size.dimension)
            .clipShape(Circle())
            .overlay(
                Group {
                    if showBorder {
                        Circle().stroke(ForMe.border, lineWidth: size.borderWidth)
                    }
                }
            )
        } else {
            initialsView
                .frame(width: size.dimension, height: size.dimension)
                .clipShape(Circle())
                .overlay(
                    Group {
                        if showBorder {
                            Circle().stroke(ForMe.border, lineWidth: size.borderWidth)
                        }
                    }
                )
        }
    }

    private var initialsView: some View {
        ZStack {
            Circle()
                .fill(gradientFromName)

            Text(initials)
                .font(.system(size: size.fontSize, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
        }
    }

    private var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        } else if let first = parts.first {
            return String(first.prefix(2)).uppercased()
        }
        return "?"
    }

    // Deterministic gradient from name hash (matches web placeholderDataUri)
    private var colorFromName: Color {
        let pair = Self.colorPair(for: name)
        return pair.1 // use the darker color for solid fill
    }

    private var gradientFromName: LinearGradient {
        let pair = Self.colorPair(for: name)
        return LinearGradient(colors: [pair.0, pair.1], startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    static func colorPair(for name: String) -> (Color, Color) {
        let pairs: [(Color, Color)] = [
            (Color(hex: "f0abfc"), Color(hex: "a855f7")), // pink → purple
            (Color(hex: "93c5fd"), Color(hex: "3b82f6")), // light blue → blue
            (Color(hex: "6ee7b7"), Color(hex: "10b981")), // mint → emerald
            (Color(hex: "fcd34d"), Color(hex: "f59e0b")), // yellow → amber
            (Color(hex: "fca5a5"), Color(hex: "ef4444")), // rose → red
            (Color(hex: "a5b4fc"), Color(hex: "6366f1")), // lavender → indigo
            (Color(hex: "67e8f9"), Color(hex: "06b6d4")), // cyan → cyan
            (Color(hex: "fdba74"), Color(hex: "f97316")), // peach → orange
            (Color(hex: "86efac"), Color(hex: "22c55e")), // green light → green
            (Color(hex: "c4b5fd"), Color(hex: "8b5cf6")), // violet light → violet
        ]

        var hash = 0
        for char in name.utf8 {
            hash = Int(char) &+ ((hash << 5) &- hash)
        }
        let index = abs(hash) % pairs.count
        return pairs[index]
    }
}

#Preview {
    VStack(spacing: 20) {
        DynamicAvatar(name: "Jane Smith", size: .small)
        DynamicAvatar(name: "John Doe", size: .medium)
        DynamicAvatar(name: "Alice", size: .large)
        DynamicAvatar(name: "Bob Wilson", imageUrl: "https://example.com/photo.jpg", size: .large)
    }
}
