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
            for pathStr in paths {
                if let path = CGPath.from(svgPath: pathStr) {
                    let transformedPath = Path(path)
                        .applying(CGAffineTransform(scaleX: scale, y: scale))
                    context.stroke(transformedPath, with: .color(color), lineWidth: lineWidth)
                }
            }
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Presets (match web hugeicon usage)

extension HugeIcon {
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
