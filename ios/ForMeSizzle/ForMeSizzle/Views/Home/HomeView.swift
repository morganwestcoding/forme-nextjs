import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject var appState: AppState

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Discover")
                        .font(.largeTitle.bold())
                        .foregroundColor(ForMe.textPrimary)

                    Text("Find what you're looking for")
                        .font(.subheadline)
                        .foregroundColor(ForMe.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal)
                .staggeredFadeIn(index: 0)

                // Categories
                VStack(alignment: .leading, spacing: 12) {
                    Text("Categories")
                        .font(.headline)
                        .foregroundColor(ForMe.textPrimary)
                        .padding(.horizontal)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 16) {
                            ForEach(Array(ServiceCategory.allCases.enumerated()), id: \.element) { index, category in
                                CategoryCard(category: category) {
                                    viewModel.selectedCategory = category
                                    appState.selectedTab = .search
                                }
                                .staggeredFadeIn(index: index + 1)
                            }
                        }
                        .padding(.horizontal)
                    }
                }

                // Featured Listings
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Popular Near You")
                            .font(.headline)
                            .foregroundColor(ForMe.textPrimary)

                        Spacer()

                        Button("See All") {
                            appState.selectedTab = .search
                        }
                        .font(.subheadline)
                        .foregroundColor(ForMe.accent)
                    }
                    .padding(.horizontal)

                    if viewModel.isLoading {
                        ForMeLoader(size: .medium)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 40)
                    } else if viewModel.featuredListings.isEmpty {
                        VStack(spacing: 8) {
                            Image(systemName: "sparkles")
                                .font(.title)
                                .foregroundColor(ForMe.textTertiary)
                            Text("No listings found")
                                .foregroundColor(ForMe.textSecondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                    } else {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(Array(viewModel.featuredListings.enumerated()), id: \.element.id) { index, listing in
                                    NavigationLink(value: listing) {
                                        FeaturedListingCard(listing: listing)
                                    }
                                    .buttonStyle(.plain)
                                    .staggeredFadeIn(index: index + 2)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }

                // Recently Added
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recently Added")
                        .font(.headline)
                        .foregroundColor(ForMe.textPrimary)
                        .padding(.horizontal)

                    LazyVStack(spacing: 12) {
                        ForEach(Array(viewModel.recentListings.enumerated()), id: \.element.id) { index, listing in
                            NavigationLink(value: listing) {
                                ListingRow(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index + 4)
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .refreshable {
            await viewModel.loadData()
        }
        .task {
            await viewModel.loadData()
        }
    }
}

// MARK: - Category Card

struct CategoryCard: View {
    let category: ServiceCategory
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(ForMe.categoryColor(category.rawValue).opacity(0.15))
                        .frame(width: 56, height: 56)

                    Image(systemName: category.icon)
                        .font(.title3)
                        .foregroundColor(ForMe.categoryColor(category.rawValue))
                }

                Text(category.rawValue)
                    .font(.caption.weight(.medium))
                    .foregroundColor(ForMe.textPrimary)
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Featured Listing Card (Cinematic Movie Poster Style)

struct FeaturedListingCard: View {
    let listing: Listing

    private let cardWidth: CGFloat = 240
    private let cardHeight: CGFloat = 360

    var body: some View {
        ZStack {
            // Background image with scale effect for cinematic feel
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .scaleEffect(1.05) // Slight zoom for cinematic crop
                case .failure(_):
                    cinematicPlaceholder
                case .empty:
                    cinematicPlaceholder
                @unknown default:
                    cinematicPlaceholder
                }
            }
            .frame(width: cardWidth, height: cardHeight)
            .clipped()

            // Clean gradient overlay
            LinearGradient(
                stops: [
                    .init(color: .black.opacity(0.1), location: 0),
                    .init(color: .clear, location: 0.3),
                    .init(color: .clear, location: 0.4),
                    .init(color: .black.opacity(0.7), location: 0.7),
                    .init(color: .black.opacity(0.95), location: 1.0)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            // Content overlay
            VStack(spacing: 0) {
                // Top section
                HStack(alignment: .top) {
                    // Price tag
                    if let priceRange = listing.priceRange {
                        Text(priceRange)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(.black.opacity(0.4))
                            .clipShape(Capsule())
                    }

                    Spacer()

                    // Favorite button
                    Button {
                        // TODO: Toggle favorite
                    } label: {
                        Image(systemName: "heart")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 32, height: 32)
                            .background(.black.opacity(0.4))
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                }
                .padding(12)

                Spacer()

                // Center content section
                VStack(alignment: .center, spacing: 6) {
                    // Category label
                    Text(listing.category.rawValue.uppercased())
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(1)
                        .foregroundColor(.white.opacity(0.7))

                    // Title
                    Text(listing.title)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)

                    // Location
                    if let location = listing.location {
                        Text(location)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .lineLimit(1)
                    }
                }
                .padding(.horizontal, 16)

                Spacer()

                // Bottom rating section - frosted glass
                HStack(spacing: 0) {
                    if let rating = listing.rating {
                        // Star cluster
                        HStack(spacing: 3) {
                            ForEach(0..<5) { i in
                                Image(systemName: "star.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(
                                        i < Int(rating.rounded())
                                            ? Color(hex: "FBBF24")
                                            : .white.opacity(0.2)
                                    )
                            }
                        }

                        Spacer()

                        // Rating number
                        Text(String(format: "%.1f", rating))
                            .font(.system(size: 26, weight: .bold, design: .rounded))
                            .foregroundColor(.white)

                        Spacer()

                        // Review count
                        if let count = listing.ratingCount, count > 0 {
                            VStack(alignment: .trailing, spacing: 0) {
                                Text(formatRatingCount(count))
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white.opacity(0.9))
                                Text("Reviews")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(.white.opacity(0.5))
                            }
                        }
                    } else {
                        // No rating - show 0.0 with 0 reviews
                        HStack(spacing: 3) {
                            ForEach(0..<5) { _ in
                                Image(systemName: "star.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(.white.opacity(0.2))
                            }
                        }

                        Spacer()

                        Text("0.0")
                            .font(.system(size: 26, weight: .bold, design: .rounded))
                            .foregroundColor(.white)

                        Spacer()

                        VStack(alignment: .trailing, spacing: 0) {
                            Text("0")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white.opacity(0.9))
                            Text("Reviews")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                        }
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                .padding(.horizontal, 10)
                .padding(.bottom, 10)
            }
        }
        .frame(width: cardWidth, height: cardHeight)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: .black.opacity(0.25), radius: 20, x: 0, y: 10)
    }

    // Format rating count (1500 → 1.5k)
    private func formatRatingCount(_ count: Int) -> String {
        if count >= 1000 {
            let k = Double(count) / 1000.0
            return String(format: "%.1fk", k).replacingOccurrences(of: ".0k", with: "k")
        }
        return "\(count)"
    }

    // Cinematic placeholder view
    private var cinematicPlaceholder: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(hex: "1a1a2e"),
                    Color(hex: "16213e"),
                    Color(hex: "0f0f23")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 12) {
                Image(systemName: listing.category.icon)
                    .font(.system(size: 44, weight: .light))
                    .foregroundColor(.white.opacity(0.3))

                Text(listing.category.rawValue)
                    .font(.system(size: 12, weight: .medium))
                    .tracking(2)
                    .foregroundColor(.white.opacity(0.2))
            }
        }
    }
}

// MARK: - Listing Row (horizontal card with padded image)

struct ListingRow: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: 12) {
            // Thumbnail image with padding
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color(hex: "F5F5F4"))
                    .overlay(
                        Image(systemName: listing.category.icon)
                            .font(.system(size: 24))
                            .foregroundColor(ForMe.textTertiary)
                    )
            }
            .frame(width: 100, height: 100)
            .clipShape(RoundedRectangle(cornerRadius: 10))

            // Content
            VStack(alignment: .leading, spacing: 6) {
                // Category pill
                Text(listing.category.rawValue)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.black)
                    .clipShape(RoundedRectangle(cornerRadius: 6))

                // Title
                Text(listing.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                // Price | Stars | Rating | Reserve
                HStack(spacing: 6) {
                    if let priceRange = listing.priceRange {
                        Text(priceRange)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }

                    Text("|")
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.textTertiary)

                    HStack(spacing: 2) {
                        ForEach(0..<5) { i in
                            Image(systemName: "star.fill")
                                .font(.system(size: 9))
                                .foregroundColor(i < Int((listing.rating ?? 5).rounded()) ? Color(hex: "FBBF24") : ForMe.textTertiary.opacity(0.4))
                        }
                    }

                    if let rating = listing.rating {
                        Text(String(format: "%.1f", rating))
                            .font(.system(size: 12))
                            .foregroundColor(ForMe.textSecondary)
                    }

                    Text("|")
                        .font(.system(size: 12))
                        .foregroundColor(ForMe.textTertiary)

                    Text("Reserve")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.accent)
                        .underline()
                }
            }

            Spacer()
        }
        .padding(10)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }
}

#Preview("Home") {
    HomeView()
        .environmentObject(AppState())
}

#Preview("Featured Card") {
    FeaturedListingCard(listing: Listing(
        id: "preview",
        title: "Pretty Ricky's Hair and Braid",
        description: "Premium hair styling",
        imageSrc: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400",
        category: .barber,
        location: "Long Beach, California",
        services: [Service(id: "1", serviceName: "Cut", price: 75, category: nil, imageSrc: nil, description: nil, duration: 60, listingId: nil)],
        rating: 4.8,
        ratingCount: 124,
        userId: "1"
    ))
    .padding(40)
    .background(Color.black)
}
