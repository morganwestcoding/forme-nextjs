import SwiftUI

// MARK: - ForMe Color System (matching web Tailwind palette)

enum ForMe {

    // MARK: Accent
    static let accent = Color(hex: "60A5FA")         // sky-400
    static let accentHover = Color(hex: "3B82F6")    // blue-500
    static let accentLight = Color(hex: "60A5FA", opacity: 0.1)
    static let accentShadow = Color(hex: "60A5FA", opacity: 0.25)

    // MARK: Backgrounds
    static let background = Color(hex: "FAFAF9")     // stone-50
    static let cardTop = Color(hex: "FAFAF9")
    static let cardBottom = Color(hex: "F7F7F6")
    static let surface = Color.white
    static let inputBg = Color(hex: "F9FAFB")        // gray-50

    // MARK: Borders
    static let border = Color(hex: "D6D3D1", opacity: 0.9) // stone-300/90
    static let borderLight = Color(hex: "E5E7EB")    // gray-200
    static let borderHover = Color(hex: "A8A29E")    // stone-400

    // MARK: Text
    static let textPrimary = Color(hex: "171717")    // neutral-900
    static let textSecondary = Color(hex: "6B7280")  // gray-500
    static let textTertiary = Color(hex: "9CA3AF")   // gray-400
    static let textOnDark = Color.white

    // MARK: Status Colors
    static let statusConfirmed = Color(hex: "34D399")  // emerald-400
    static let statusPending = Color(hex: "FBBF24")    // amber-400
    static let statusCancelled = Color(hex: "FB7185")  // rose-400
    static let statusCompleted = Color(hex: "60A5FA")  // sky-400
    static let statusClosed = Color(hex: "A3A3A3")     // neutral-400

    // MARK: Chat
    static let chatSent = Color(hex: "3B82F6")       // blue-500
    static let chatReceived = Color(hex: "F3F4F6")    // gray-100

    // MARK: Category Colors (from web Categories.tsx)
    static func categoryColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "massage": return Color(hex: "D4B185")
        case "wellness": return Color(hex: "C4D4A9")
        case "fitness": return Color(hex: "86A4BB")
        case "nails": return Color(hex: "E5B9AD")
        case "spa": return Color(hex: "D8C3CE")
        case "barber": return Color(hex: "D6C3B6")
        case "beauty": return Color(hex: "E6C9B3")
        case "salon": return Color(hex: "B3C5D1")
        case "hair": return Color(hex: "D4B185")
        case "skin": return Color(hex: "E5B9AD")
        case "makeup": return Color(hex: "D8C3CE")
        default: return Color(hex: "D6D3D1")
        }
    }
}

// MARK: - Hex Color Extension

extension Color {
    init(hex: String, opacity: Double = 1.0) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        switch hex.count {
        case 6:
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: opacity
        )
    }
}

// MARK: - Card Style Modifier

struct ForMeCardStyle: ViewModifier {
    var padding: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                LinearGradient(
                    colors: [ForMe.cardTop, ForMe.cardBottom],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ForMe.border, lineWidth: 1)
            )
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: 1)
    }
}

extension View {
    func forMeCard(padding: CGFloat = 16) -> some View {
        modifier(ForMeCardStyle(padding: padding))
    }
}

// MARK: - Button Styles

struct ForMeAccentButtonStyle: ButtonStyle {
    var isEnabled: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(isEnabled ? ForMe.textPrimary : ForMe.textTertiary)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct ForMeSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundColor(ForMe.textPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Input Field Style

struct ForMeInputStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(ForMe.inputBg)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
            .cornerRadius(12)
    }
}

extension View {
    func forMeInput() -> some View {
        modifier(ForMeInputStyle())
    }
}

// MARK: - Search Bar (matching web PageSearch / ContextualSearch)

struct ForMeSearchBar: View {
    @Binding var text: String
    var placeholder: String = "Looking for something?"
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 0) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(ForMe.textTertiary)
                .padding(.leading, 16)

            TextField(placeholder, text: $text)
                .font(.system(size: 15))
                .foregroundColor(ForMe.textPrimary)
                .tint(ForMe.accent)
                .focused($isFocused)
                .padding(.horizontal, 10)
                .padding(.vertical, 13)

            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "A8A29E"))
                }
                .padding(.trailing, 14)
            }
        }
        .background(Color(hex: "F7F7F6"))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(isFocused ? ForMe.borderHover : ForMe.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: 1)
    }
}

// MARK: - Staggered Fade-In Animation

struct StaggeredFadeIn: ViewModifier {
    let index: Int
    @State private var appeared = false

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 8)
            .onAppear {
                withAnimation(.easeOut(duration: 0.4).delay(Double(index) * 0.05)) {
                    appeared = true
                }
            }
    }
}

extension View {
    func staggeredFadeIn(index: Int) -> some View {
        modifier(StaggeredFadeIn(index: index))
    }
}
