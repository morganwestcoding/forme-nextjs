import SwiftUI

// MARK: - ForMe Design System
// 3 border radius values: .xl (12pt), .xxl (16pt), .full (capsule)
// Stone palette matching web Tailwind config

enum ForMe {

    // MARK: - Radius System (matches web: rounded-xl, rounded-2xl, rounded-full)
    static let radiusXL: CGFloat = 12    // buttons, inputs, small containers
    static let radius2XL: CGFloat = 16   // cards, modals, large containers
    // rounded-full = Capsule() or .clipShape(Circle())

    // MARK: - Spacing Scale (8pt base)
    static let space1: CGFloat = 4
    static let space2: CGFloat = 8
    static let space3: CGFloat = 12
    static let space4: CGFloat = 16
    static let space5: CGFloat = 20
    static let space6: CGFloat = 24
    static let space8: CGFloat = 32
    static let space10: CGFloat = 40

    // MARK: - Page-level spacing (matches web spacing tokens)
    static let pageHorizontal: CGFloat = 16   // px-4
    static let pageTop: CGFloat = 32          // mt-8
    static let sectionGap: CGFloat = 32       // gap between page sections
    static let cardPadding: CGFloat = 20      // p-5

    // MARK: - Accent
    static let accent = Color(hex: "60A5FA")         // sky-400
    static let accentHover = Color(hex: "3B82F6")    // blue-500
    static let accentLight = Color(hex: "60A5FA", opacity: 0.1)
    static let accentShadow = Color(hex: "60A5FA", opacity: 0.25)

    // MARK: - Stone Scale (matching web)
    static let stone50 = Color(hex: "FAFAF9")
    static let stone100 = Color(hex: "F5F5F4")
    static let stone200 = Color(hex: "E7E5E4")
    static let stone300 = Color(hex: "D6D3D1")
    static let stone400 = Color(hex: "A8A29E")
    static let stone500 = Color(hex: "78716C")
    static let stone600 = Color(hex: "57534E")
    static let stone700 = Color(hex: "44403C")
    static let stone800 = Color(hex: "292524")
    static let stone900 = Color(hex: "1C1917")
    static let stone950 = Color(hex: "0C0A09")

    // MARK: - Adaptive Colors (light/dark)
    static let background = Color("background")
    static let surface = Color("surface")
    static let cardBg = Color("cardBg")
    static let inputBg = Color("inputBg")

    // MARK: - Adaptive Text
    static let textPrimary = Color("textPrimary")
    static let textSecondary = Color("textSecondary")
    static let textTertiary = Color("textTertiary")
    static let textOnDark = Color.white

    // MARK: - Adaptive Borders
    static let border = Color("border")
    static let borderLight = Color("borderLight")
    static let borderHover = Color("borderHover")

    // MARK: - Status Colors
    static let statusConfirmed = Color(hex: "34D399")  // emerald-400
    static let statusPending = Color(hex: "FBBF24")    // amber-400
    static let statusCancelled = Color(hex: "FB7185")  // rose-400
    static let statusCompleted = Color(hex: "60A5FA")  // sky-400
    static let statusClosed = Color(hex: "A3A3A3")     // neutral-400

    // MARK: - Chat
    static let chatSent = Color(hex: "3B82F6")       // blue-500
    static let chatReceived = Color(hex: "F3F4F6")    // gray-100

    // MARK: - Elevation System (matches web shadow-elevation-1/2/3)
    enum Elevation {
        case level1  // subtle — resting state
        case level2  // cards — interactive hover
        case level3  // modals, dropdowns, popovers

        var radius: CGFloat {
            switch self {
            case .level1: return 3
            case .level2: return 16
            case .level3: return 48
            }
        }

        var opacity: Double {
            switch self {
            case .level1: return 0.06
            case .level2: return 0.06
            case .level3: return 0.12
            }
        }

        var y: CGFloat {
            switch self {
            case .level1: return 1
            case .level2: return 4
            case .level3: return 16
            }
        }
    }

    // MARK: - Category System (matches web Categories.tsx exactly)
    enum Category: String, CaseIterable, Codable {
        case wellness = "Wellness"
        case training = "Training"
        case barber = "Barber"
        case salon = "Salon"
        case nails = "Nails"
        case skincare = "Skincare"
        case lashes = "Lashes"
        case brows = "Brows"
        case ink = "Ink"

        var color: Color {
            switch self {
            case .wellness: return Color(hex: "C4D4A9")
            case .training: return Color(hex: "86A4BB")
            case .barber:   return Color(hex: "D6C3B6")
            case .salon:    return Color(hex: "B3C5D1")
            case .nails:    return Color(hex: "E8B4B8")
            case .skincare: return Color(hex: "F5E6D3")
            case .lashes:   return Color(hex: "D4B5A0")
            case .brows:    return Color(hex: "C4A882")
            case .ink:      return Color(hex: "A3A3A3")
            }
        }

        var gradientColors: [Color] {
            switch self {
            case .wellness: return [Color(hex: "dac6be"), Color(hex: "c1a093")]
            case .training: return [Color(hex: "dac6be"), Color(hex: "c1a093")]
            case .barber:   return [Color(hex: "cdb3a8"), Color(hex: "907d76")]
            case .salon:    return [Color(hex: "dac6be"), Color(hex: "c1a093")]
            case .nails:    return [Color(hex: "e8b4b8"), Color(hex: "c4868b")]
            case .skincare: return [Color(hex: "f5e6d3"), Color(hex: "d4c4b0")]
            case .lashes:   return [Color(hex: "d4b5a0"), Color(hex: "b8967e")]
            case .brows:    return [Color(hex: "c4a882"), Color(hex: "a08660")]
            case .ink:      return [Color(hex: "71717a"), Color(hex: "3f3f46")]
            }
        }

        var description: String {
            switch self {
            case .wellness: return "Wellness services"
            case .training: return "Training services"
            case .barber:   return "Barber services"
            case .salon:    return "Salon services"
            case .nails:    return "Nail services"
            case .skincare: return "Skincare services"
            case .lashes:   return "Lash services"
            case .brows:    return "Brow services"
            case .ink:      return "Tattoo services"
            }
        }
    }

    /// Lookup category color by string label (for API data)
    static func categoryColor(_ label: String) -> Color {
        Category(rawValue: label)?.color ?? stone300
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

// MARK: - Elevation Modifier

struct ForMeElevation: ViewModifier {
    let level: ForMe.Elevation

    func body(content: Content) -> some View {
        content
            .shadow(color: .black.opacity(level.opacity), radius: level.radius, x: 0, y: level.y)
    }
}

extension View {
    func elevation(_ level: ForMe.Elevation) -> some View {
        modifier(ForMeElevation(level: level))
    }
}

// MARK: - Card Style (rounded-2xl)

struct ForMeCardStyle: ViewModifier {
    var padding: CGFloat = ForMe.cardPadding

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(ForMe.cardBg)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.border, lineWidth: 1)
            )
            .elevation(.level1)
    }
}

extension View {
    func forMeCard(padding: CGFloat = ForMe.cardPadding) -> some View {
        modifier(ForMeCardStyle(padding: padding))
    }
}

// MARK: - Button Styles

struct ForMeAccentButtonStyle: ButtonStyle {
    var isEnabled: Bool = true
    @Environment(\.colorScheme) private var colorScheme

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(colorScheme == .dark ? ForMe.stone900 : .white)
            .frame(maxWidth: .infinity)
            .frame(minHeight: 48)
            .background(
                colorScheme == .dark
                    ? (isEnabled ? Color.white : ForMe.stone600)
                    : (isEnabled ? ForMe.stone900 : ForMe.textTertiary)
            )
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .elevation(.level1)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct ForMeSecondaryButtonStyle: ButtonStyle {
    @Environment(\.colorScheme) private var colorScheme

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(ForMe.textPrimary)
            .frame(maxWidth: .infinity)
            .frame(minHeight: 48)
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                    .stroke(ForMe.border, lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct ForMeDestructiveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(minHeight: 48)
            .background(Color(hex: "F43F5E")) // rose-500
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .shadow(color: Color(hex: "F43F5E", opacity: 0.25), radius: 8, x: 0, y: 2)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct ForMeGhostButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(ForMe.textSecondary)
            .frame(maxWidth: .infinity)
            .frame(minHeight: 48)
            .background(configuration.isPressed ? ForMe.stone100 : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Input Field Style (rounded-xl)

struct ForMeInputStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(ForMe.inputBg)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
    }
}

extension View {
    func forMeInput() -> some View {
        modifier(ForMeInputStyle())
    }
}

// MARK: - Search Bar (rounded-xl, matches web)

struct ForMeSearchBar: View {
    @Binding var text: String
    var placeholder: String = "Looking for something?"
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 0) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(ForMe.textTertiary)
                .padding(.leading, ForMe.space4)

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
                        .foregroundColor(ForMe.stone400)
                }
                .padding(.trailing, 14)
            }
        }
        .background(ForMe.stone100)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                .stroke(isFocused ? ForMe.borderHover : ForMe.border, lineWidth: 1)
        )
        .elevation(.level1)
    }
}

// MARK: - Header Icon Button (48pt touch target, matches web w-12 h-12)

struct HeaderIconButton: View {
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(icon)
                .renderingMode(.template)
                .resizable()
                .frame(width: 20, height: 20)
                .foregroundColor(ForMe.textSecondary)
                .frame(width: 48, height: 48)
                .contentShape(Circle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Category Pill (rounded-xl, matches web CategoryNav)

struct CategoryPill: View {
    let category: ForMe.Category
    let isSelected: Bool
    let action: () -> Void
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Button(action: action) {
            Text(category.rawValue)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(
                    isSelected
                        ? (colorScheme == .dark ? ForMe.stone900 : .white)
                        : ForMe.textSecondary
                )
                .padding(.horizontal, ForMe.space4)
                .frame(height: 36)
                .background(
                    isSelected
                        ? (colorScheme == .dark ? Color.white : ForMe.stone900)
                        : Color.clear
                )
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                        .stroke(isSelected ? Color.clear : ForMe.stone200, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
        .scaleEffect(1.0)
    }
}

// MARK: - Typeform Heading (matches web TypeformHeading.tsx)

struct TypeformHeading: View {
    let question: String
    var subtitle: String? = nil
    var stepNumber: Int? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            HStack(spacing: 0) {
                if let num = stepNumber {
                    Text("\(num) →  ")
                        .foregroundColor(ForMe.stone400)
                }
                Text(question)
            }
            .font(.system(size: 26, weight: .semibold))
            .foregroundColor(ForMe.textPrimary)
            .lineSpacing(2)

            if let subtitle = subtitle {
                Text(subtitle)
                    .font(.system(size: 16))
                    .foregroundColor(ForMe.stone500)
            }
        }
    }
}

// MARK: - Gold Star (matches web's listingStarGold SVG)

struct GoldStar: View {
    var size: CGFloat = 11

    var body: some View {
        Image(systemName: "star.fill")
            .font(.system(size: size))
            .foregroundStyle(
                LinearGradient(
                    colors: [Color(hex: "f5c842"), Color(hex: "d4a017")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
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

// MARK: - Previews

#Preview("Buttons & Card") {
    VStack(alignment: .leading, spacing: 16) {
        Button("Primary Button") {}
            .buttonStyle(ForMeAccentButtonStyle())
        Button("Secondary Button") {}
            .buttonStyle(ForMeSecondaryButtonStyle())
        Button("Destructive") {}
            .buttonStyle(ForMeDestructiveButtonStyle())
        Button("Ghost") {}
            .buttonStyle(ForMeGhostButtonStyle())
        Text("Card content goes here")
            .frame(maxWidth: .infinity, alignment: .leading)
            .forMeCard()
        TextField("Email", text: .constant(""))
            .forMeInput()
        ForMeSearchBar(text: .constant(""))
    }
    .padding()
    .background(ForMe.background)
}

#Preview("Categories") {
    ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 8) {
            ForEach(ForMe.Category.allCases, id: \.self) { cat in
                CategoryPill(category: cat, isSelected: cat == .salon, action: {})
            }
        }
        .padding()
    }
    .background(ForMe.background)
}

#Preview("Border Radius") {
    HStack(spacing: 12) {
        VStack {
            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                .fill(ForMe.stone200)
                .frame(width: 80, height: 50)
            Text("XL (12)").font(.caption2)
        }
        VStack {
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .fill(ForMe.stone200)
                .frame(width: 80, height: 50)
            Text("2XL (16)").font(.caption2)
        }
        VStack {
            Capsule()
                .fill(ForMe.stone200)
                .frame(width: 80, height: 50)
            Text("Full").font(.caption2)
        }
    }
    .padding()
    .background(ForMe.background)
}
