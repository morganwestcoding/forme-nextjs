import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Categories
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Categories")
                            .font(.title2.bold())
                            .padding(.horizontal)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(ServiceCategory.allCases, id: \.self) { category in
                                    CategoryCard(category: category) {
                                        viewModel.selectedCategory = category
                                        appState.selectedTab = .search
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                    }

                    // Featured Listings
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Popular Near You")
                                .font(.title2.bold())

                            Spacer()

                            Button("See All") {
                                appState.selectedTab = .search
                            }
                            .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)

                        if viewModel.isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                        } else if viewModel.featuredListings.isEmpty {
                            Text("No listings found")
                                .foregroundColor(.secondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                        } else {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 16) {
                                    ForEach(viewModel.featuredListings) { listing in
                                        NavigationLink(value: listing) {
                                            ListingCard(listing: listing)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }

                    // Recent/Trending
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recently Added")
                            .font(.title2.bold())
                            .padding(.horizontal)

                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.recentListings) { listing in
                                NavigationLink(value: listing) {
                                    ListingRow(listing: listing)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("ForMe")
            .navigationDestination(for: Listing.self) { listing in
                ListingDetailView(listing: listing)
            }
            .refreshable {
                await viewModel.loadData()
            }
        }
        .task {
            await viewModel.loadData()
        }
    }
}

struct CategoryCard: View {
    let category: ServiceCategory
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: category.icon)
                    .font(.title2)
                    .frame(width: 56, height: 56)
                    .background(Color(.systemGray6))
                    .clipShape(Circle())

                Text(category.rawValue)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
        }
        .buttonStyle(.plain)
    }
}

struct ListingCard: View {
    let listing: Listing

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color(.systemGray5))
            }
            .frame(width: 200, height: 140)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.headline)
                    .lineLimit(1)

                if let location = listing.location {
                    Text(location)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                if let rating = listing.rating, let count = listing.ratingCount {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                            .font(.caption)
                        Text(String(format: "%.1f", rating))
                            .font(.caption.bold())
                        Text("(\(count))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .frame(width: 200)
    }
}

struct ListingRow: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color(.systemGray5))
            }
            .frame(width: 80, height: 80)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.headline)
                    .lineLimit(1)

                Text(listing.category.rawValue)
                    .font(.caption)
                    .foregroundColor(.secondary)

                if let location = listing.location {
                    Text(location)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

#Preview {
    HomeView()
        .environmentObject(AppState())
}
