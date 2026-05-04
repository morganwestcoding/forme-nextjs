import SwiftUI
import MapKit
import Combine

struct MapsView: View {
    @StateObject private var viewModel = MapsViewModel()
    @State private var position: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 33.77, longitude: -118.19),
            span: MKCoordinateSpan(latitudeDelta: 0.15, longitudeDelta: 0.15)
        )
    )
    @State private var selectedListing: Listing?

    var body: some View {
        ZStack(alignment: .top) {
            Map(position: $position, selection: $selectedListing) {
                ForEach(viewModel.listings.filter { $0.lat != nil && $0.lng != nil }) { listing in
                    Annotation(listing.title, coordinate: CLLocationCoordinate2D(
                        latitude: listing.lat!,
                        longitude: listing.lng!
                    )) {
                        MapPin(listing: listing, isSelected: selectedListing?.id == listing.id)
                    }
                    .tag(listing)
                }
            }
            .mapStyle(.standard(pointsOfInterest: .excludingAll))
            .ignoresSafeArea()
            .onTapGesture {
                if selectedListing != nil {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                        selectedListing = nil
                    }
                }
            }

            // Top search bar overlay
            VStack(spacing: 0) {
                HStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 15))
                        .foregroundColor(ForMe.textTertiary)
                    Text("Search this area")
                        .font(ForMe.font(.regular, size: 15))
                        .foregroundColor(ForMe.textTertiary)
                    Spacer()
                }
                .padding(.horizontal, ForMe.space4)
                .padding(.vertical, 14)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                .elevation(.level2)
                .padding(.horizontal, ForMe.space4)
                .padding(.top, 8)

                Spacer()
            }

            // Bottom card when listing selected
            if let listing = selectedListing {
                VStack {
                    Spacer()
                    SelectedListingCard(listing: listing)
                        .padding(.horizontal, ForMe.space4)
                        .padding(.bottom, 100)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.spring(response: 0.35, dampingFraction: 0.8), value: selectedListing?.id)
            }
        }
        .navigationBarHidden(true)
        .task {
            await viewModel.loadListings()
        }
    }
}

// MARK: - Map Pin

private struct MapPin: View {
    let listing: Listing
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                Circle()
                    .fill(isSelected ? ForMe.stone900 : .white)
                    .frame(width: 36, height: 36)
                    .elevation(.level2)

                if let price = listing.priceRange {
                    Text(price)
                        .font(ForMe.font(.bold, size: 10))
                        .foregroundColor(isSelected ? .white : ForMe.stone900)
                } else {
                    Circle()
                        .fill(ForMe.categoryColor(listing.category))
                        .frame(width: 10, height: 10)
                }
            }

            // Pointer triangle
            Triangle()
                .fill(isSelected ? ForMe.stone900 : .white)
                .frame(width: 10, height: 6)
                .offset(y: -1)
        }
        .scaleEffect(isSelected ? 1.15 : 1.0)
        .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isSelected)
    }
}

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: rect.midX, y: rect.maxY))
            p.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
            p.closeSubpath()
        }
    }
}

// MARK: - Selected Listing Card

private struct SelectedListingCard: View {
    let listing: Listing

    var body: some View {
        VStack(spacing: 0) {
            Capsule()
                .fill(ForMe.stone300)
                .frame(width: 36, height: 4)
                .padding(.top, 6)
                .padding(.bottom, 8)

            cardBody
        }
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .elevation(.level2)
    }

    private var cardBody: some View {
        HStack(spacing: 14) {
            // Thumbnail
            if let src = listing.imageSrc, let url = URL(string: src) {
                AsyncImage(url: url) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle().fill(ForMe.stone100)
                }
                .frame(width: 72, height: 72)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)

                if !listing.displayLocation.isEmpty {
                    Text(listing.displayLocation)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textSecondary)
                }

                HStack(spacing: 4) {
                    if let rating = listing.rating, rating > 0 {
                        GoldStar(size: 10)
                        Text(String(format: "%.1f", rating))
                            .font(ForMe.font(.medium, size: 12))
                            .foregroundColor(ForMe.textPrimary)
                    }
                    if let price = listing.priceRange {
                        Text("·")
                            .foregroundColor(ForMe.stone300)
                        Text(price)
                            .font(ForMe.font(.medium, size: 12))
                            .foregroundColor(ForMe.textSecondary)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(ForMe.stone300)
        }
        .padding(.horizontal, ForMe.space3)
        .padding(.bottom, ForMe.space3)
    }
}

// MARK: - ViewModel

@MainActor
class MapsViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var isLoading = false

    func loadListings() async {
        isLoading = true
        do {
            let response = try await APIService.shared.getListings(page: 1, limit: 50)
            listings = response.listings
        } catch {
            print("MapsView load error: \(error)")
        }
        isLoading = false
    }
}

#Preview {
    MapsView()
}
