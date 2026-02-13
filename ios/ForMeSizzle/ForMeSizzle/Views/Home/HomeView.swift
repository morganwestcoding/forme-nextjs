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

// MARK: - Featured Listing Card (full image background)

struct FeaturedListingCard: View {
    let listing: Listing

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            // Full background image
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color(hex: "F5F5F4"))
                    .overlay(
                        Image(systemName: listing.category.icon)
                            .font(.system(size: 40))
                            .foregroundColor(ForMe.textTertiary)
                    )
            }
            .frame(width: 220, height: 300)
            .clipped()

            // Gradient overlay
            LinearGradient(
                colors: [.black.opacity(0.7), .black.opacity(0.3), .clear],
                startPoint: .bottom,
                endPoint: .top
            )

            // Top overlays
            VStack {
                HStack {
                    // Category pill
                    Text(listing.category.rawValue)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.black.opacity(0.5))
                        .clipShape(RoundedRectangle(cornerRadius: 8))

                    Spacer()

                    // Star rating
                    HStack(spacing: 2) {
                        ForEach(0..<5) { i in
                            Image(systemName: "star.fill")
                                .font(.system(size: 8))
                                .foregroundColor(i < Int((listing.rating ?? 5).rounded()) ? Color(hex: "FBBF24") : .white.opacity(0.4))
                        }
                    }
                }
                .padding(12)

                Spacer()
            }

            // Bottom content
            VStack(alignment: .leading, spacing: 8) {
                // Title
                Text(listing.title)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                // Price | Category | Rating
                HStack(spacing: 8) {
                    if let priceRange = listing.priceRange {
                        Text(priceRange)
                            .font(.system(size: 13, weight: .semibold))
                    }

                    Text("|")
                        .font(.system(size: 12))
                        .opacity(0.7)

                    if let rating = listing.rating {
                        Text(String(format: "%.1f", rating))
                            .font(.system(size: 13, weight: .medium))
                        if let count = listing.ratingCount {
                            Text("(\(count))")
                                .font(.system(size: 11))
                                .opacity(0.7)
                        }
                    }
                }
                .foregroundColor(.white)

                // Reserve link
                Text("Reserve")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
                    .underline()
            }
            .padding(14)
        }
        .frame(width: 220, height: 300)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(ForMe.border.opacity(0.5), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
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

                // Price | Stars | Rating
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
                }

                // Reserve link
                Text("Reserve")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(ForMe.accent)
                    .underline()
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

#Preview {
    HomeView()
        .environmentObject(AppState())
}
