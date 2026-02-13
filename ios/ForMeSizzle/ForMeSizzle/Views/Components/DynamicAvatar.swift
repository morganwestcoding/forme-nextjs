import SwiftUI

struct DynamicAvatar: View {
    let name: String
    var imageUrl: String?
    var size: Size = .medium

    enum Size {
        case tiny, small, medium, large

        var dimension: CGFloat {
            switch self {
            case .tiny: return 22
            case .small: return 32
            case .medium: return 48
            case .large: return 80
            }
        }

        var fontSize: CGFloat {
            switch self {
            case .tiny: return 9
            case .small: return 12
            case .medium: return 18
            case .large: return 28
            }
        }

        var borderWidth: CGFloat {
            switch self {
            case .tiny: return 1
            case .small: return 1.5
            case .medium: return 2
            case .large: return 2.5
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
                Circle()
                    .stroke(ForMe.border, lineWidth: size.borderWidth)
            )
        } else {
            initialsView
                .frame(width: size.dimension, height: size.dimension)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(ForMe.border, lineWidth: size.borderWidth)
                )
        }
    }

    private var initialsView: some View {
        ZStack {
            Circle()
                .fill(colorFromName)

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

    // Deterministic color from name hash (matching web implementation)
    private var colorFromName: Color {
        let avatarColors: [Color] = [
            Color(hex: "60A5FA"), // blue
            Color(hex: "34D399"), // emerald
            Color(hex: "F472B6"), // pink
            Color(hex: "A78BFA"), // violet
            Color(hex: "FB923C"), // orange
            Color(hex: "FBBF24"), // amber
            Color(hex: "2DD4BF"), // teal
            Color(hex: "F87171"), // red
            Color(hex: "818CF8"), // indigo
            Color(hex: "38BDF8"), // sky
        ]

        var hash: UInt = 5381
        for char in name.utf8 {
            hash = ((hash << 5) &+ hash) &+ UInt(char)
        }
        let index = Int(hash % UInt(avatarColors.count))
        return avatarColors[index]
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
