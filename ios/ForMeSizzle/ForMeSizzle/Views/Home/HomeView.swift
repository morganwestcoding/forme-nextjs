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
                        .foregroundColor(ForMe.textSecondary)
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

                // Top Providers
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Top Providers")
                            .font(.headline)
                            .foregroundColor(ForMe.textPrimary)

                        Spacer()

                        Button("See All") {
                            appState.selectedTab = .search
                        }
                        .font(.subheadline)
                        .foregroundColor(ForMe.textSecondary)
                    }
                    .padding(.horizontal)

                    if !viewModel.topProviders.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 14) {
                                ForEach(Array(viewModel.topProviders.enumerated()), id: \.element.id) { index, provider in
                                    ProviderCard(user: provider)
                                        .staggeredFadeIn(index: index + 3)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }

                // Browse Services
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Browse Services")
                            .font(.headline)
                            .foregroundColor(ForMe.textPrimary)

                        Spacer()

                        Button("See All") {
                            appState.selectedTab = .search
                        }
                        .font(.subheadline)
                        .foregroundColor(ForMe.textSecondary)
                    }
                    .padding(.horizontal)

                    LazyVStack(spacing: 12) {
                        ForEach(Array(viewModel.recentListings.enumerated()), id: \.element.id) { index, listing in
                            NavigationLink(value: listing) {
                                ListingRow(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index + 5)
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
    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: category.icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(isPressed ? ForMe.textPrimary : ForMe.textSecondary)
                    .frame(width: 52, height: 52)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(isPressed ? ForMe.textPrimary.opacity(0.08) : ForMe.surface)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(isPressed ? ForMe.borderHover : Color.clear, lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)

                Text(category.rawValue)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(isPressed ? ForMe.textPrimary : ForMe.textSecondary)
            }
        }
        .buttonStyle(CategoryButtonStyle(isPressed: $isPressed))
    }
}

struct CategoryButtonStyle: ButtonStyle {
    @Binding var isPressed: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
            .onChange(of: configuration.isPressed) { _, newValue in
                isPressed = newValue
            }
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

            // Subtle warm lift
            Color(hex: "FDF6E3").opacity(0.03)
                .blendMode(.plusLighter)

            // Edge vignette - soft, natural falloff
            RadialGradient(
                gradient: Gradient(stops: [
                    .init(color: .clear, location: 0.3),
                    .init(color: .black.opacity(0.4), location: 0.85),
                    .init(color: .black.opacity(0.6), location: 1.0)
                ]),
                center: .init(x: 0.5, y: 0.5),
                startRadius: 0,
                endRadius: cardWidth * 0.95
            )

            // Bottom fade - smooth and deep
            LinearGradient(
                stops: [
                    .init(color: .clear, location: 0.35),
                    .init(color: .black.opacity(0.4), location: 0.55),
                    .init(color: .black.opacity(0.85), location: 0.75),
                    .init(color: .black.opacity(0.98), location: 1.0)
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
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(.white.opacity(0.12))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(.white.opacity(0.25), lineWidth: 1)
                                    )
                            )
                    }

                    Spacer()

                    // Quick book button
                    Button {
                        // TODO: Quick book action
                    } label: {
                        Image(systemName: "bolt.fill")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 38, height: 38)
                            .background(
                                Circle()
                                    .fill(.white.opacity(0.12))
                                    .overlay(
                                        Circle()
                                            .stroke(.white.opacity(0.25), lineWidth: 1)
                                    )
                            )
                    }
                    .buttonStyle(.plain)

                    // Favorite button
                    Button {
                        // TODO: Toggle favorite
                    } label: {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 38, height: 38)
                            .background(
                                Circle()
                                    .fill(.white.opacity(0.12))
                                    .overlay(
                                        Circle()
                                            .stroke(.white.opacity(0.25), lineWidth: 1)
                                    )
                            )
                    }
                    .buttonStyle(.plain)
                }
                .padding(14)

                Spacer()

                // Center content section
                VStack(alignment: .center, spacing: 4) {
                    // Category label
                    Text(listing.category.rawValue)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))

                    // Title
                    Text(listing.title)
                        .font(.system(size: 21, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)

                    // Location
                    if let location = listing.location {
                        Text(location)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white.opacity(0.6))
                            .lineLimit(1)
                    }
                }
                .shadow(color: .black.opacity(0.5), radius: 6, x: 0, y: 2)
                .padding(.horizontal, 18)

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
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(.black.opacity(0.35), in: RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(
                            LinearGradient(
                                colors: [.white.opacity(0.3), .white.opacity(0.1)],
                                startPoint: .top,
                                endPoint: .bottom
                            ),
                            lineWidth: 0.5
                        )
                )
                .padding(.horizontal, 12)
                .padding(.bottom, 16)
            }
        }
        .frame(width: cardWidth, height: cardHeight)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(
                    LinearGradient(
                        colors: [.white.opacity(0.3), .white.opacity(0.1), .clear],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)
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

// MARK: - Provider Card

struct ProviderCard: View {
    let user: User

    private let cardWidth: CGFloat = 140
    private let cardHeight: CGFloat = 190

    var body: some View {
        ZStack(alignment: .bottom) {
            // Background image
            AsyncImage(url: URL(string: user.image ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .scaleEffect(1.05)
                case .failure, .empty:
                    providerPlaceholder
                @unknown default:
                    providerPlaceholder
                }
            }
            .frame(width: cardWidth, height: cardHeight)
            .clipped()

            // Bottom gradient
            LinearGradient(
                stops: [
                    .init(color: .clear, location: 0.3),
                    .init(color: .black.opacity(0.5), location: 0.55),
                    .init(color: .black.opacity(0.9), location: 0.8),
                    .init(color: .black.opacity(0.95), location: 1.0)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            // Content
            VStack(spacing: 3) {
                // Verified badge
                if user.isVerified {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 10))
                        Text("Verified")
                            .font(.system(size: 10, weight: .medium))
                    }
                    .foregroundColor(.white.opacity(0.7))
                }

                Text(user.name ?? "Provider")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(1)

                if let location = user.location {
                    HStack(spacing: 3) {
                        Image(systemName: "mappin")
                            .font(.system(size: 8, weight: .semibold))
                        Text(location)
                            .font(.system(size: 10, weight: .medium))
                    }
                    .foregroundColor(.white.opacity(0.6))
                    .lineLimit(1)
                } else if let role = user.role {
                    Text(role)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                        .lineLimit(1)
                }
            }
            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
            .padding(.horizontal, 10)
            .padding(.bottom, 14)
        }
        .frame(width: cardWidth, height: cardHeight)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(
                    LinearGradient(
                        colors: [.white.opacity(0.25), .white.opacity(0.08), .clear],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 0.5
                )
        )
        .shadow(color: .black.opacity(0.12), radius: 10, x: 0, y: 5)
    }

    private var providerPlaceholder: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "1a1a2e"), Color(hex: "16213e"), Color(hex: "0f0f23")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Text(user.name?.prefix(1).uppercased() ?? "?")
                .font(.system(size: 40, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.25))
        }
    }
}

// MARK: - Listing Row

struct ListingRow: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: 14) {
            // Image
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color(hex: "F8F8F7"))
                    .overlay(
                        Image(systemName: listing.category.icon)
                            .font(.system(size: 22, weight: .light))
                            .foregroundColor(ForMe.textTertiary)
                    )
            }
            .frame(width: 88, height: 88)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            // Content
            VStack(alignment: .leading, spacing: 8) {
                // Title + Category
                VStack(alignment: .leading, spacing: 2) {
                    Text(listing.category.rawValue)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)

                    Text(listing.title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(2)
                }

                // Rating + Price
                HStack(spacing: 10) {
                    // Rating
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hex: "FBBF24"))

                        Text(String(format: "%.1f", listing.rating ?? 0))
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(ForMe.textSecondary)

                        if let count = listing.ratingCount, count > 0 {
                            Text("(\(count))")
                                .font(.system(size: 11))
                                .foregroundColor(ForMe.textTertiary)
                        }
                    }

                    // Price
                    if let priceRange = listing.priceRange {
                        Text(priceRange)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(ForMe.textSecondary)
                    }
                }
            }

            Spacer()

            // Actions pill
            VStack(spacing: 0) {
                Button {
                    // TODO: Toggle favorite
                } label: {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 16))
                        .foregroundColor(ForMe.textTertiary)
                        .frame(width: 44, height: 44)
                }
                .buttonStyle(.plain)

                Divider()
                    .frame(width: 24)

                Button {
                    // TODO: Quick book
                } label: {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 16))
                        .foregroundColor(ForMe.textTertiary)
                        .frame(width: 44, height: 44)
                }
                .buttonStyle(.plain)
            }
            .background(ForMe.background)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .padding(12)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: .black.opacity(0.04), radius: 8, x: 0, y: 2)
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

#Preview("Listing Row") {
    ListingRow(listing: Listing(
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
    .padding(20)
}

#Preview("Provider Card") {
    HStack(spacing: 14) {
        ProviderCard(user: User(id: "1", name: "Marcus Johnson", role: "Barber"))
        ProviderCard(user: User(id: "2", name: "Sarah Chen", role: "Stylist", isVerified: true))
    }
    .padding(20)
    .background(ForMe.background)
}
