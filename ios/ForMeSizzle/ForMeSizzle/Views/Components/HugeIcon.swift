import SwiftUI

// MARK: - HugeIcon — SwiftUI renderer for hugeicons-react SVG paths
//
// Matches the web app's icon set exactly by reusing the raw SVG path strings.
// Use `HugeIcon.share` or pass custom paths for any other hugeicon.

struct HugeIcon: View {
    let paths: [String]
    var size: CGFloat = 20
    var color: Color = .white
    var lineWidth: CGFloat = 2.0

    var body: some View {
        Canvas { context, size in
            let scale = min(size.width, size.height) / 24.0
            let style = StrokeStyle(lineWidth: lineWidth, lineCap: .round, lineJoin: .round)
            for pathStr in paths {
                if let path = CGPath.from(svgPath: pathStr) {
                    let transformedPath = Path(path)
                        .applying(CGAffineTransform(scaleX: scale, y: scale))
                    context.stroke(transformedPath, with: .color(color), style: style)
                }
            }
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Presets (match web hugeicon usage)

extension HugeIcon {
    /// ArrowLeft — matches the web ListingHead back-button arrow exactly
    static let arrowLeftPaths: [String] = [
        "M19 12H5",
        "M5 12L12 5",
        "M5 12L12 19"
    ]

    /// Cancel01 — close / dismiss X. Two diagonal strokes that match the
    /// feed action icons' weight when rendered with the same lineWidth.
    static let cancelPaths: [String] = [
        "M19.0005 4.99988L5.00049 18.9999",
        "M5.00049 4.99988L19.0005 18.9999"
    ]

    /// Share08Icon — used for share buttons on Discover, Feed, Bookings
    static let sharePaths: [String] = [
        "M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963",
        "M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13"
    ]

    /// FavouriteIcon — filled heart for active state
    static let heartFilledPaths: [String] = [
        "M18.5 9.5C18.5 12.5 16 15 13 18L12 19L11 18C8 15 5.5 12.5 5.5 9.5C5.5 7.5 7 6 9 6C10 6 11 6.5 12 7.5C13 6.5 14 6 15 6C17 6 18.5 7.5 18.5 9.5Z"
    ]

    /// FavouriteIcon — stroke heart for inactive state
    static let heartPaths: [String] = [
        "M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z"
    ]

    /// FavouriteIcon — outline heart matching hugeicons-react FavouriteIcon
    static let favouritePaths: [String] = [
        "M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
    ]

    /// GridViewIcon — used for "Listing" / "Listings"
    static let gridViewPaths: [String] = [
        "M2 18C2 16.4596 2 15.6893 2.34673 15.1235C2.54074 14.8069 2.80693 14.5407 3.12353 14.3467C3.68934 14 4.45956 14 6 14C7.54044 14 8.31066 14 8.87647 14.3467C9.19307 14.5407 9.45926 14.8069 9.65327 15.1235C10 15.6893 10 16.4596 10 18C10 19.5404 10 20.3107 9.65327 20.8765C9.45926 21.1931 9.19307 21.4593 8.87647 21.6533C8.31066 22 7.54044 22 6 22C4.45956 22 3.68934 22 3.12353 21.6533C2.80693 21.4593 2.54074 21.1931 2.34673 20.8765C2 20.3107 2 19.5404 2 18Z",
        "M14 18C14 16.4596 14 15.6893 14.3467 15.1235C14.5407 14.8069 14.8069 14.5407 15.1235 14.3467C15.6893 14 16.4596 14 18 14C19.5404 14 20.3107 14 20.8765 14.3467C21.1931 14.5407 21.4593 14.8069 21.6533 15.1235C22 15.6893 22 16.4596 22 18C22 19.5404 22 20.3107 21.6533 20.8765C21.4593 21.1931 21.1931 21.4593 20.8765 21.6533C20.3107 22 19.5404 22 18 22C16.4596 22 15.6893 22 15.1235 21.6533C14.8069 21.4593 14.5407 21.1931 14.3467 20.8765C14 20.3107 14 19.5404 14 18Z",
        "M2 6C2 4.45956 2 3.68934 2.34673 3.12353C2.54074 2.80693 2.80693 2.54074 3.12353 2.34673C3.68934 2 4.45956 2 6 2C7.54044 2 8.31066 2 8.87647 2.34673C9.19307 2.54074 9.45926 2.80693 9.65327 3.12353C10 3.68934 10 4.45956 10 6C10 7.54044 10 8.31066 9.65327 8.87647C9.45926 9.19307 9.19307 9.45926 8.87647 9.65327C8.31066 10 7.54044 10 6 10C4.45956 10 3.68934 10 3.12353 9.65327C2.80693 9.45926 2.54074 9.19307 2.34673 8.87647C2 8.31066 2 7.54044 2 6Z",
        "M14 6C14 4.45956 14 3.68934 14.3467 3.12353C14.5407 2.80693 14.8069 2.54074 15.1235 2.34673C15.6893 2 16.4596 2 18 2C19.5404 2 20.3107 2 20.8765 2.34673C21.1931 2.54074 21.4593 2.80693 21.6533 3.12353C22 3.68934 22 4.45956 22 6C22 7.54044 22 8.31066 21.6533 8.87647C21.4593 9.19307 21.1931 9.45926 20.8765 9.65327C20.3107 10 19.5404 10 18 10C16.4596 10 15.6893 10 15.1235 9.65327C14.8069 9.45926 14.5407 9.19307 14.3467 8.87647C14 8.31066 14 7.54044 14 6Z"
    ]

    /// UserIcon — used for "Profile"
    static let userPaths: [String] = [
        "M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z",
        "M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"
    ]

    /// UserAdd01Icon — used for "Worker"
    static let userAddPaths: [String] = [
        "M12.5 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453365 18.0441 4.1628 16.324 5.57757 15.4816C7.67837 14.2307 10.1368 13.7719 12.5 14.1052C13.3575 14.2261 14.1926 14.4514 15 14.7809",
        "M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z",
        "M18.5 22L18.5 15M15 18.5H22"
    ]

    /// AnalyticsUpIcon — used for "Analytics"
    static let analyticsUpPaths: [String] = [
        "M7 18V16M12 18V15M17 18V13M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z",
        "M5.99219 11.4863C8.14729 11.5581 13.0341 11.2328 15.8137 6.82132M13.9923 6.28835L15.8678 5.98649C16.0964 5.95738 16.432 6.13785 16.5145 6.35298L17.0104 7.99142"
    ]

    /// CreditCardIcon — used for "Subscription"
    static let creditCardPaths: [String] = [
        "M2 12C2 8.46252 2 6.69377 3.0528 5.5129C3.22119 5.32403 3.40678 5.14935 3.60746 4.99087C4.86213 4 6.74142 4 10.5 4H13.5C17.2586 4 19.1379 4 20.3925 4.99087C20.5932 5.14935 20.7788 5.32403 20.9472 5.5129C22 6.69377 22 8.46252 22 12C22 15.5375 22 17.3062 20.9472 18.4871C20.7788 18.676 20.5932 18.8506 20.3925 19.0091C19.1379 20 17.2586 20 13.5 20H10.5C6.74142 20 4.86213 20 3.60746 19.0091C3.40678 18.8506 3.22119 18.676 3.0528 18.4871C2 17.3062 2 15.5375 2 12Z",
        "M10 16H11.5",
        "M14.5 16L18 16",
        "M2 9H22"
    ]

    /// UserMultipleIcon — used for "Team"
    static let userMultiplePaths: [String] = [
        "M18.6161 20H19.1063C20.2561 20 21.1707 19.4761 21.9919 18.7436C24.078 16.8826 19.1741 15 17.5 15M15.5 5.06877C15.7271 5.02373 15.9629 5 16.2048 5C18.0247 5 19.5 6.34315 19.5 8C19.5 9.65685 18.0247 11 16.2048 11C15.9629 11 15.7271 10.9763 15.5 10.9312",
        "M4.48131 16.1112C3.30234 16.743 0.211137 18.0331 2.09388 19.6474C3.01359 20.436 4.03791 21 5.32572 21H12.6743C13.9621 21 14.9864 20.436 15.9061 19.6474C17.7889 18.0331 14.6977 16.743 13.5187 16.1112C10.754 14.6296 7.24599 14.6296 4.48131 16.1112Z",
        "M13 7.5C13 9.70914 11.2091 11.5 9 11.5C6.79086 11.5 5 9.70914 5 7.5C5 5.29086 6.79086 3.5 9 3.5C11.2091 3.5 13 5.29086 13 7.5Z"
    ]

    /// ShopIcon — custom icon used for "Shop" in the create modal (matches web)
    static let shopPaths: [String] = [
        "M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18",
        "M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z",
        "M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75",
        "M10 10.75H12.5"
    ]

    /// ProductIcon — custom icon used for "Product" in the create modal (matches web)
    static let productPaths: [String] = [
        "M2.5 7.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5H13.5C17.2712 21.5 19.1569 21.5 20.3284 20.3284C21.5 19.1569 21.5 17.2712 21.5 13.5V7.5",
        "M3.86909 5.31461L2.5 7.5H21.5L20.2478 5.41303C19.3941 3.99021 18.9673 3.2788 18.2795 2.8894C17.5918 2.5 16.7621 2.5 15.1029 2.5H8.95371C7.32998 2.5 6.51812 2.5 5.84013 2.8753C5.16215 3.2506 4.73113 3.93861 3.86909 5.31461Z",
        "M12 7.5V2.5",
        "M6 18H11M6 15H9"
    ]
}

// MARK: - HugePostIcon — composite (image-frame paths + filled dot)
//
// PostIcon in the web app is custom: an image-card outline with a small filled
// dot for the "sun" inside. The HugeIcon stroke renderer can't fill shapes, so
// this wraps the same Canvas approach and adds a filled circle.

struct HugePostIcon: View {
    var size: CGFloat = 22
    var color: Color = ForMe.stone500
    var lineWidth: CGFloat = 1.5

    private let paths: [String] = [
        "M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z",
        "M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424"
    ]

    var body: some View {
        Canvas { context, canvasSize in
            let scale = min(canvasSize.width, canvasSize.height) / 24.0
            let style = StrokeStyle(lineWidth: lineWidth, lineCap: .round, lineJoin: .round)
            for pathStr in paths {
                if let path = CGPath.from(svgPath: pathStr) {
                    let transformed = Path(path)
                        .applying(CGAffineTransform(scaleX: scale, y: scale))
                    context.stroke(transformed, with: .color(color), style: style)
                }
            }
            let dotRadius = 1.5 * scale
            let dotRect = CGRect(
                x: 7.5 * scale - dotRadius,
                y: 7.5 * scale - dotRadius,
                width: dotRadius * 2,
                height: dotRadius * 2
            )
            context.fill(Path(ellipseIn: dotRect), with: .color(color))
        }
        .frame(width: size, height: size)
    }
}

// MARK: - MoreHorizontal (3-dot horizontal — matches hugeicons MoreHorizontalIcon)

struct HugeMoreHorizontal: View {
    var size: CGFloat = 18
    var color: Color = ForMe.textTertiary

    var body: some View {
        HStack(spacing: size * 0.18) {
            Circle().fill(color).frame(width: size * 0.18, height: size * 0.18)
            Circle().fill(color).frame(width: size * 0.18, height: size * 0.18)
            Circle().fill(color).frame(width: size * 0.18, height: size * 0.18)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - MoreVertical (3-dot vertical — matches hugeicons MoreVerticalIcon)

struct HugeMoreVertical: View {
    var size: CGFloat = 18
    var color: Color = ForMe.textTertiary

    var body: some View {
        VStack(spacing: size * 0.18) {
            Circle().fill(color).frame(width: size * 0.18, height: size * 0.18)
            Circle().fill(color).frame(width: size * 0.18, height: size * 0.18)
            Circle().fill(color).frame(width: size * 0.18, height: size * 0.18)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - SVG Path Parser (shared; previously in FeedView)

extension CGPath {
    static func from(svgPath: String) -> CGPath? {
        let path = CGMutablePath()
        let scanner = Scanner(string: svgPath)
        scanner.charactersToBeSkipped = CharacterSet.whitespaces.union(.init(charactersIn: ","))

        var currentPoint = CGPoint.zero
        var lastCommand: Character = "M"

        while !scanner.isAtEnd {
            var cmd: NSString?
            let cmdChars = CharacterSet(charactersIn: "MmLlHhVvCcSsQqTtAaZz")
            if scanner.scanCharacters(from: cmdChars, into: &cmd), let c = cmd as String?, let first = c.first {
                lastCommand = first
            }

            switch lastCommand {
            case "M":
                if let x = scanner.scanDouble(), let y = scanner.scanDouble() {
                    path.move(to: CGPoint(x: x, y: y))
                    currentPoint = CGPoint(x: x, y: y)
                    lastCommand = "L"
                }
            case "m":
                if let dx = scanner.scanDouble(), let dy = scanner.scanDouble() {
                    let p = CGPoint(x: currentPoint.x + dx, y: currentPoint.y + dy)
                    path.move(to: p)
                    currentPoint = p
                    lastCommand = "l"
                }
            case "L":
                if let x = scanner.scanDouble(), let y = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: x, y: y))
                    currentPoint = CGPoint(x: x, y: y)
                }
            case "l":
                if let dx = scanner.scanDouble(), let dy = scanner.scanDouble() {
                    let p = CGPoint(x: currentPoint.x + dx, y: currentPoint.y + dy)
                    path.addLine(to: p)
                    currentPoint = p
                }
            case "H":
                if let x = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: x, y: currentPoint.y))
                    currentPoint.x = x
                }
            case "h":
                if let dx = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: currentPoint.x + dx, y: currentPoint.y))
                    currentPoint.x += dx
                }
            case "V":
                if let y = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: currentPoint.x, y: y))
                    currentPoint.y = y
                }
            case "v":
                if let dy = scanner.scanDouble() {
                    path.addLine(to: CGPoint(x: currentPoint.x, y: currentPoint.y + dy))
                    currentPoint.y += dy
                }
            case "C":
                if let x1 = scanner.scanDouble(), let y1 = scanner.scanDouble(),
                   let x2 = scanner.scanDouble(), let y2 = scanner.scanDouble(),
                   let x = scanner.scanDouble(), let y = scanner.scanDouble() {
                    path.addCurve(to: CGPoint(x: x, y: y), control1: CGPoint(x: x1, y: y1), control2: CGPoint(x: x2, y: y2))
                    currentPoint = CGPoint(x: x, y: y)
                }
            case "c":
                if let dx1 = scanner.scanDouble(), let dy1 = scanner.scanDouble(),
                   let dx2 = scanner.scanDouble(), let dy2 = scanner.scanDouble(),
                   let dx = scanner.scanDouble(), let dy = scanner.scanDouble() {
                    let p = CGPoint(x: currentPoint.x + dx, y: currentPoint.y + dy)
                    path.addCurve(to: p,
                                  control1: CGPoint(x: currentPoint.x + dx1, y: currentPoint.y + dy1),
                                  control2: CGPoint(x: currentPoint.x + dx2, y: currentPoint.y + dy2))
                    currentPoint = p
                }
            case "Z", "z":
                path.closeSubpath()
            default:
                break
            }
        }
        return path
    }
}
