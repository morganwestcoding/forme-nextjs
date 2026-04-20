import SwiftUI
import AVFoundation

// MARK: - Video Thumbnail
//
// Strategy:
// 1. If the URL is a Cloudinary video, rewrite it as a Cloudinary jpg thumbnail (fastest, always works)
// 2. Otherwise, extract the first frame with AVAssetImageGenerator
// 3. On any failure, show a stone-100 placeholder (no spinner forever)

struct VideoThumbnail: View {
    let url: URL
    var contentMode: ContentMode = .fill

    @State private var image: UIImage?
    @State private var remoteThumbURL: URL?
    @State private var didTryExtraction = false

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } else if let remoteThumbURL {
                AsyncImage(url: remoteThumbURL) { phase in
                    switch phase {
                    case .success(let img):
                        img.resizable().aspectRatio(contentMode: contentMode)
                    case .failure:
                        Rectangle().fill(ForMe.stone100)
                    case .empty:
                        Rectangle().fill(ForMe.stone100)
                            .overlay(ProgressView().tint(ForMe.textTertiary))
                    @unknown default:
                        Rectangle().fill(ForMe.stone100)
                    }
                }
            } else if didTryExtraction {
                Rectangle().fill(ForMe.stone100)
            } else {
                Rectangle().fill(ForMe.stone100)
                    .overlay(ProgressView().tint(ForMe.textTertiary))
            }
        }
        .task(id: url) {
            await resolveThumbnail()
        }
    }

    private func resolveThumbnail() async {
        // Check cache first
        if let cached = ThumbnailCache.shared.get(for: url) {
            self.image = cached
            return
        }

        // 1. Cloudinary fast path
        if let cloudinaryThumb = cloudinaryThumbnailURL(from: url) {
            await MainActor.run { self.remoteThumbURL = cloudinaryThumb }
            return
        }

        // 2. AVFoundation fallback
        do {
            let asset = AVURLAsset(url: url)
            let generator = AVAssetImageGenerator(asset: asset)
            generator.appliesPreferredTrackTransform = true
            generator.maximumSize = CGSize(width: 600, height: 600)

            let time = CMTime(seconds: 0.1, preferredTimescale: 600)
            let cgImage = try await generator.image(at: time).image
            let uiImage = UIImage(cgImage: cgImage)

            ThumbnailCache.shared.set(uiImage, for: url)

            await MainActor.run {
                self.image = uiImage
            }
        } catch {
            await MainActor.run {
                self.didTryExtraction = true
            }
        }
    }

    /// Rewrite a Cloudinary video URL into a still thumbnail URL.
    ///
    /// Input:  https://res.cloudinary.com/foo/video/upload/v123/clip.mp4
    /// Output: https://res.cloudinary.com/foo/video/upload/so_0,f_jpg,q_auto/v123/clip.jpg
    private func cloudinaryThumbnailURL(from url: URL) -> URL? {
        let s = url.absoluteString
        guard s.contains("res.cloudinary.com"), s.contains("/video/upload/") else { return nil }

        // Insert transformation params right after /video/upload/
        let transformed = s.replacingOccurrences(
            of: "/video/upload/",
            with: "/video/upload/so_0,f_jpg,q_auto,w_600/"
        )

        // Replace video extension with .jpg
        let videoExts = [".mp4", ".mov", ".m4v", ".webm", ".avi"]
        var final = transformed
        for ext in videoExts where final.hasSuffix(ext) {
            final = String(final.dropLast(ext.count)) + ".jpg"
            break
        }

        return URL(string: final)
    }
}

// MARK: - In-memory thumbnail cache

final class ThumbnailCache {
    static let shared = ThumbnailCache()
    private let cache = NSCache<NSURL, UIImage>()

    init() {
        cache.countLimit = 100
    }

    func get(for url: URL) -> UIImage? {
        cache.object(forKey: url as NSURL)
    }

    func set(_ image: UIImage, for url: URL) {
        cache.setObject(image, forKey: url as NSURL)
    }
}

// MARK: - Video detection helper

// MARK: - Cloudinary URL rewriting for AVPlayer compatibility

/// Rewrite a Cloudinary video URL so AVPlayer can decode it reliably.
///
/// Web browsers transparently handle WebM/VP9, but AVPlayer only decodes
/// H.264 / HEVC / AAC. Cloudinary uploads are stored in their original
/// container — if a user uploaded a WebM, `secure_url` points at the raw
/// WebM, which AVPlayer rejects with kFigAssetError / kFigFileReaderError.
///
/// Injecting `f_mp4,vc_h264,ac_aac` forces Cloudinary to transcode to an
/// mp4/H.264/AAC stream that AVPlayer can always play.
///
/// Input:  https://res.cloudinary.com/foo/video/upload/v123/clip.webm
/// Output: https://res.cloudinary.com/foo/video/upload/f_mp4,vc_h264,ac_aac/v123/clip.mp4
func avPlayerCompatibleURL(from url: URL) -> URL {
    let s = url.absoluteString
    guard s.contains("res.cloudinary.com"), s.contains("/video/upload/") else {
        return url
    }

    // Always inject our transform as the FIRST segment so it takes priority
    // over any pre-existing transformations (e.g. f_auto, which can still
    // serve WebM to some User-Agent strings). Cloudinary applies `/`-separated
    // transform chains in order, so putting ours first guarantees the final
    // container is mp4/H.264/AAC.
    var transformed = s.replacingOccurrences(
        of: "/video/upload/",
        with: "/video/upload/f_mp4,vc_h264,ac_aac/"
    )

    // Swap non-mp4 extensions to .mp4 so the URL is internally consistent.
    let videoExts = [".webm", ".mov", ".m4v", ".avi", ".mkv", ".ogv", ".ogg"]
    for ext in videoExts where transformed.lowercased().hasSuffix(ext) {
        transformed = String(transformed.dropLast(ext.count)) + ".mp4"
        break
    }

    return URL(string: transformed) ?? url
}

extension Post {
    var resolvedMediaType: String? {
        if let type = mediaType { return type }
        // Infer from URL patterns — check both mediaUrl and imageSrc
        let videoExts = [".mp4", ".mov", ".m4v", ".webm", ".avi"]
        for candidate in [mediaUrl, imageSrc].compactMap({ $0?.lowercased() }) {
            if videoExts.contains(where: { candidate.hasSuffix($0) }) { return "video" }
            // Cloudinary video URLs contain /video/upload/
            if candidate.contains("/video/upload/") { return "video" }
        }
        return nil
    }

    var isVideoPost: Bool {
        resolvedMediaType == "video"
    }
}
