import Foundation

// Resolves image URL strings coming from the web into URLs that
// AsyncImage can actually load. Two shapes show up in the data:
//
//  1. Absolute URLs (Cloudinary uploads, external avatars) — pass through.
//  2. Relative paths from web/public, e.g. "/assets/people/worker 3.png".
//     The browser resolves these against the page origin; on iOS we have
//     to prepend the web host ourselves. These also frequently contain
//     unencoded spaces, which makes URL(string:) return nil unless we
//     percent-encode first.
enum AssetURL {
    #if DEBUG
    static let webOrigin = "http://localhost:3000"
    #else
    static let webOrigin = "https://yourproductiondomain.com"
    #endif

    static func resolve(_ raw: String?) -> URL? {
        guard let raw, !raw.isEmpty else { return nil }

        // data: URIs and unsupported schemes — let AsyncImage handle/fail.
        if raw.hasPrefix("data:") { return URL(string: raw) }

        let encoded = raw.addingPercentEncoding(
            withAllowedCharacters: .urlPathAllowed.union(.urlQueryAllowed)
        ) ?? raw

        if encoded.hasPrefix("http://") || encoded.hasPrefix("https://") {
            return URL(string: encoded)
        }

        let path = encoded.hasPrefix("/") ? encoded : "/" + encoded
        return URL(string: webOrigin + path)
    }
}
