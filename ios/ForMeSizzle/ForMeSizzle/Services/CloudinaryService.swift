import Foundation
import UIKit

enum CloudinaryError: Error, LocalizedError {
    case invalidURL
    case encodingFailed
    case uploadFailed(Int)
    case decodingFailed
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid upload URL"
        case .encodingFailed: return "Could not encode image"
        case .uploadFailed(let status): return "Upload failed (HTTP \(status))"
        case .decodingFailed: return "Invalid Cloudinary response"
        case .networkError(let e): return e.localizedDescription
        }
    }
}

/// Mirrors web/src/lib/cloudinary.ts. Unsigned upload to the same cloud + preset.
@MainActor
final class CloudinaryService {
    static let shared = CloudinaryService()

    private let cloudName = "dbkoczywb"
    private let uploadPreset = "cs0am6m7"

    private init() {}

    // MARK: - Folders (mirrors web)
    enum Folder: String {
        case profiles = "uploads/profiles"
        case listings = "uploads/listings"
        case listingsGallery = "uploads/listings/gallery"
        case shops = "uploads/shops"
        case shopProducts = "uploads/shops/products"
        case posts = "uploads/posts"
    }

    enum ResourceType: String {
        case image
        case video
        case auto
    }

    struct UploadResponse: Decodable {
        let public_id: String
        let secure_url: String
        let resource_type: String
        let format: String?
    }

    // MARK: - Public API

    /// Upload raw data and return the final transformed URL ready to send to the backend.
    /// Mirrors web ImageUpload behavior: upload → transform URL with q_auto:good,f_auto.
    func uploadImage(
        _ image: UIImage,
        folder: Folder,
        targetWidth: Int = 1200,
        targetHeight: Int? = nil,
        cropMode: CropMode = .fill,
        gravity: String = "g_auto",
        compressionQuality: CGFloat = 0.85
    ) async throws -> String {
        guard let data = image.jpegData(compressionQuality: compressionQuality) else {
            throw CloudinaryError.encodingFailed
        }
        let resp = try await rawUpload(data: data, folder: folder, resourceType: .image, mimeType: "image/jpeg", filename: "upload.jpg")
        let h = targetHeight ?? Int((Double(targetWidth) * 3.0 / 4.0).rounded())
        let transforms = "q_auto:good,f_auto,w_\(targetWidth),h_\(h),\(cropMode.rawValue),\(gravity)"
        return transformURL(publicId: resp.public_id, transforms: transforms)
    }

    /// Upload arbitrary file data (used for video / non-image media).
    func uploadMedia(
        data: Data,
        folder: Folder,
        resourceType: ResourceType,
        mimeType: String,
        filename: String
    ) async throws -> UploadResponse {
        try await rawUpload(data: data, folder: folder, resourceType: resourceType, mimeType: mimeType, filename: filename)
    }

    enum CropMode: String {
        case fill = "c_fill"
        case thumb = "c_thumb"
        case fit = "c_fit"
    }

    func transformURL(publicId: String, transforms: String) -> String {
        "https://res.cloudinary.com/\(cloudName)/image/upload/\(transforms)/\(publicId)"
    }

    // MARK: - Internal

    private func rawUpload(
        data: Data,
        folder: Folder,
        resourceType: ResourceType,
        mimeType: String,
        filename: String
    ) async throws -> UploadResponse {
        guard let url = URL(string: "https://api.cloudinary.com/v1_1/\(cloudName)/\(resourceType.rawValue)/upload") else {
            throw CloudinaryError.invalidURL
        }

        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        let appendField: (String, String) -> Void = { name, value in
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(value)\r\n".data(using: .utf8)!)
        }
        appendField("upload_preset", uploadPreset)
        appendField("folder", folder.rawValue)

        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        do {
            let (responseData, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { throw CloudinaryError.uploadFailed(-1) }
            guard (200..<300).contains(http.statusCode) else { throw CloudinaryError.uploadFailed(http.statusCode) }
            do {
                return try JSONDecoder().decode(UploadResponse.self, from: responseData)
            } catch {
                throw CloudinaryError.decodingFailed
            }
        } catch let e as CloudinaryError {
            throw e
        } catch {
            throw CloudinaryError.networkError(error)
        }
    }
}
