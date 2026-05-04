import SwiftUI

/// Admin entry for managing partner academies. Lists every academy the platform
/// knows about (the public `/api/academies` endpoint) and drills into
/// `AcademyDetailView` per row. Reachable from `SettingsView` only when the
/// current user has master/admin role.
struct AcademiesAdminListView: View {
    @State private var academies: [Academy] = []
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space3) {
                if let error {
                    Text(error)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.statusCancelled)
                        .padding(.horizontal, ForMe.space5)
                }

                if isLoading && academies.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else if academies.isEmpty {
                    Text("No academies yet.")
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone400)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else {
                    VStack(spacing: 8) {
                        ForEach(academies) { academy in
                            NavigationLink {
                                AcademyDetailView(academy: academy)
                            } label: {
                                row(academy)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, ForMe.space5)
                }
            }
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space10)
        }
        .background(ForMe.background)
        .navigationTitle("Academies")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .refreshable { await load() }
    }

    private func row(_ academy: Academy) -> some View {
        HStack(spacing: 14) {
            logo(for: academy)
            VStack(alignment: .leading, spacing: 2) {
                Text(academy.name)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                if let location = academy.location, !location.isEmpty {
                    Text(location)
                        .font(ForMe.font(.regular, size: 11))
                        .foregroundColor(ForMe.stone400)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(ForMe.stone400)
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    @ViewBuilder
    private func logo(for academy: Academy) -> some View {
        if let logo = academy.logoUrl, let url = URL(string: logo) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(ForMe.stone100)
                }
            }
            .frame(width: 40, height: 40)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
        } else {
            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                .fill(ForMe.stone100)
                .frame(width: 40, height: 40)
                .overlay(
                    Text(String(academy.name.prefix(1)))
                        .font(ForMe.font(.bold, size: 16))
                        .foregroundColor(ForMe.stone500)
                )
        }
    }

    private func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            academies = try await APIService.shared.getAcademies()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
