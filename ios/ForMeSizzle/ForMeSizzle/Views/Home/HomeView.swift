import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showMessages = false
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Discover")
                            .font(.largeTitle.bold())
                            .foregroundColor(ForMe.textPrimary)

                        Text("Find what you're looking for")
                            .font(.subheadline)
                            .foregroundColor(ForMe.textSecondary)
                    }

                    Spacer()

                    HStack(spacing: 12) {
                        HeaderIconButton(icon: "AlertBell") {
                            // TODO: alerts
                        }

                        HeaderIconButton(icon: "HeaderChat") {
                            showMessages = true
                        }

                        Button {
                            appState.selectedTab = .profile
                        } label: {
                            DynamicAvatar(
                                name: authViewModel.currentUser?.name ?? "User",
                                imageUrl: authViewModel.currentUser?.image,
                                size: .smallMedium
                            )
                        }
                    }
                }
                .padding(.horizontal)
                .staggeredFadeIn(index: 0)

                // Search Bar
                Button {
                    appState.selectedTab = .search
                } label: {
                    HStack(spacing: 0) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 15, weight: .regular))
                            .foregroundColor(ForMe.textTertiary)
                            .padding(.leading, 16)

                        Text("Looking for something?")
                            .font(.system(size: 15))
                            .foregroundColor(Color(UIColor.placeholderText))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 15)

                        Spacer()
                    }
                    .background(Color(hex: "F7F7F6"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(ForMe.border, lineWidth: 1)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: 1)
                }
                .padding(.horizontal)

                // Categories
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(ServiceCategory.allCases, id: \.self) { category in
                            FilterChip(
                                title: category.rawValue,
                                isSelected: false
                            ) {
                                viewModel.selectedCategory = category
                                appState.selectedTab = .search
                            }
                        }
                    }
                    .padding(.horizontal)
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
                        ProgressView()
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
                            HStack(spacing: 8) {
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

                    LazyVStack(spacing: 0) {
                        ForEach(Array(viewModel.recentListings.enumerated()), id: \.element.id) { index, listing in
                            NavigationLink(value: listing) {
                                ListingRow(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index + 5)

                            // Interleave a worker row after every 2 listings
                            if (index + 1) % 2 == 0,
                               index / 2 < viewModel.topProviders.count {
                                WorkerRow(user: viewModel.topProviders[index / 2])
                                    .padding(.horizontal, 12)
                                    .staggeredFadeIn(index: index + 6)
                            }
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
        .sheet(isPresented: $showMessages) {
            NavigationStack {
                MessagesListView()
            }
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

                // Bottom rating section
                HStack(spacing: 0) {
                    if let rating = listing.rating {
                        HStack(spacing: 5) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(Color(hex: "FBBF24"))

                            Text(String(format: "%.1f", rating))
                                .font(.system(size: 26, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                        }

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
                        HStack(spacing: 5) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white.opacity(0.2))

                            Text("0.0")
                                .font(.system(size: 26, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                        }

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
                .padding(.horizontal, 12)
                .padding(.bottom, 16)
            }
        }
        .frame(width: cardWidth, height: cardHeight)
        .clipShape(RoundedRectangle(cornerRadius: 20))
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

    var body: some View {
        VStack(spacing: 0) {
            // Avatar
            ZStack(alignment: .bottomTrailing) {
                AsyncImage(url: URL(string: user.image ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "F3F4F6"), Color(hex: "E5E7EB")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            Text(user.name?.prefix(1).uppercased() ?? "?")
                                .font(.system(size: 28, weight: .bold, design: .rounded))
                                .foregroundColor(ForMe.textTertiary)
                        )
                }
                .frame(width: 88, height: 88)
                .clipShape(Circle())
                .shadow(color: .black.opacity(0.04), radius: 2, x: 0, y: 1)

                if user.isVerified {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 16))
                        .foregroundColor(ForMe.textPrimary)
                        .background(
                            Circle()
                                .fill(ForMe.background)
                                .frame(width: 20, height: 20)
                        )
                        .offset(x: 2, y: 2)
                }
            }
            .padding(.top, 20)

            // Info section
            VStack(spacing: 8) {
                Text(user.name ?? "Provider")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)

                Text(user.role ?? "Service Provider")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(ForMe.textSecondary)
                    .lineLimit(1)

                Text(user.location ?? "Location not set")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(ForMe.textTertiary)
                    .lineLimit(1)

                // Stats row
                HStack(spacing: 16) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hex: "FBBF24"))
                        Text("5.0")
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundColor(ForMe.textPrimary)
                    }

                    RoundedRectangle(cornerRadius: 1)
                        .fill(ForMe.border)
                        .frame(width: 1, height: 14)

                    Text("0 reviews")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
            .padding(.top, 10)
            .padding(.horizontal, 16)

            Spacer(minLength: 16)
        }
        .frame(width: 180)
        .background(ForMe.background)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

// MARK: - Listing Row

struct ListingRow: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: 14) {
            // Image with phase handling
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                case .failure:
                    listingPlaceholder
                case .empty:
                    listingPlaceholder
                        .overlay(
                            ProgressView()
                                .tint(ForMe.textTertiary)
                        )
                @unknown default:
                    listingPlaceholder
                }
            }
            .frame(width: 96, height: 96)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

            // Content
            VStack(alignment: .leading, spacing: 6) {
                Text(listing.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: 200, alignment: .leading)

                if let location = listing.location {
                    Text(location)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }

                // Rating + Reviews
                HStack(spacing: 16) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hex: "FBBF24"))
                        Text(String(format: "%.1f", listing.rating ?? 0))
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundColor(ForMe.textPrimary)
                    }

                    RoundedRectangle(cornerRadius: 1)
                        .fill(ForMe.border)
                        .frame(width: 1, height: 14)

                    Text("\(listing.ratingCount ?? 0) reviews")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)
                }

            }

            Spacer()

            Image(systemName: "ellipsis")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(ForMe.textTertiary)
        }
        .padding(12)
    }

    private var listingPlaceholder: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [Color(hex: "F3F4F6"), Color(hex: "E9EAEC")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }
}

// MARK: - Worker Row (inline with listings)

struct WorkerRow: View {
    let user: User

    var body: some View {
        HStack(spacing: 14) {
            // Avatar
            ZStack(alignment: .bottomTrailing) {
                AsyncImage(url: URL(string: user.image ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "F3F4F6"), Color(hex: "E5E7EB")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            Text(user.name?.prefix(1).uppercased() ?? "?")
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundColor(ForMe.textTertiary)
                        )
                }
                .frame(width: 64, height: 64)
                .clipShape(Circle())

                if user.isVerified {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 14))
                        .foregroundColor(ForMe.textPrimary)
                        .background(
                            Circle()
                                .fill(ForMe.background)
                                .frame(width: 18, height: 18)
                        )
                        .offset(x: 2, y: 2)
                }
            }

            // Info
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(user.name ?? "Provider")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)

                    // Worker badge
                    Text("Worker")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(ForMe.accent)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(ForMe.accentLight)
                        .clipShape(Capsule())
                }

                if let role = user.role {
                    Text(role)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textSecondary)
                        .lineLimit(1)
                }

                if let location = user.location {
                    Text(location)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(ForMe.textTertiary)
        }
        .padding(12)
        .background(ForMe.accentLight)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
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
    HStack(spacing: 8) {
        ProviderCard(user: User(id: "1", name: "Marcus Johnson", role: "Barber"))
        ProviderCard(user: User(id: "2", name: "Sarah Chen", role: "Stylist", isVerified: true))
    }
    .padding(20)
    .background(ForMe.background)
}
