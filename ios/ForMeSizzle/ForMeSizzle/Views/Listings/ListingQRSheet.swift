import SwiftUI
import CoreImage.CIFilterBuiltins

struct ListingQRSheet: View {
    let listing: Listing
    @Environment(\.dismiss) private var dismiss

    private var shareURL: String {
        "https://forme.app/listings/\(listing.id)"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: ForMe.space5) {
                Spacer().frame(height: ForMe.space2)

                Text(listing.title)
                    .font(ForMe.font(.semibold, size: 18))
                    .foregroundColor(ForMe.textPrimary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, ForMe.space5)

                if let qr = qrImage(for: shareURL) {
                    Image(uiImage: qr)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 240, height: 240)
                        .padding(ForMe.space5)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                        .elevation(.level2)
                } else {
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .fill(ForMe.stone100)
                        .frame(width: 240, height: 240)
                        .overlay(
                            Text("QR unavailable")
                                .font(ForMe.font(.medium, size: 13))
                                .foregroundColor(ForMe.textTertiary)
                        )
                }

                Text("Scan to view on ForMe")
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.textTertiary)

                Button {
                    presentShareSheet()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.arrow.up")
                        Text("Share link")
                    }
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                }
                .padding(.horizontal, ForMe.space5)
                .padding(.top, ForMe.space2)

                Spacer()
            }
            .padding(.top, ForMe.space5)
            .background(ForMe.background)
            .navigationTitle("QR Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(ForMe.textPrimary)
                }
            }
        }
    }

    private func qrImage(for string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        guard let data = string.data(using: .utf8) else { return nil }
        filter.setValue(data, forKey: "inputMessage")
        filter.setValue("H", forKey: "inputCorrectionLevel")
        guard let output = filter.outputImage else { return nil }
        let scaled = output.transformed(by: CGAffineTransform(scaleX: 10, y: 10))
        guard let cg = context.createCGImage(scaled, from: scaled.extent) else { return nil }
        return UIImage(cgImage: cg)
    }

    private func presentShareSheet() {
        let activity = UIActivityViewController(activityItems: [shareURL], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(activity, animated: true)
        }
    }
}
