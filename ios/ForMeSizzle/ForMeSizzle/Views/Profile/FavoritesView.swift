import SwiftUI

struct FavoritesView: View {
    @StateObject private var viewModel = FavoritesViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0
    @State private var showFeed = false
    @State private var feedStartIndex = 0

    private let tabs = ["Listings", "Workers", "Shops", "Posts"]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Tabs
                FavoritesTabBar(selectedTab: $selectedTab, tabs: tabs)
                    .padding(.horizontal, ForMe.space6)
                    .padding(.top, ForMe.space2)
                    .padding(.bottom, ForMe.space3)

                Divider()

                // Content
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else {
                    ScrollView(showsIndicators: false) {
                        LazyVStack(spacing: 0) {
                            switch selectedTab {
                            case 0: listingsContent
                            case 1: workersContent
                            case 2: shopsContent
                            case 3: postsContent
                            default: EmptyView()
                            }
                        }
                        .padding(.top, ForMe.space3)
                        .padding(.bottom, 80)
                    }
                }
            }
            .background(ForMe.background)
            .navigationTitle("Favorites")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
            .navigationDestination(for: Listing.self) { listing in
                ListingDetailView(listing: listing)
            }
            .navigationDestination(for: ProfileRoute.self) { route in
                ProfileView(userId: route.userId)
            }
            .fullScreenCover(isPresented: $showFeed) {
                FeedView(posts: viewModel.posts, startIndex: feedStartIndex)
            }
            .task {
                await viewModel.loadFavorites()
            }
        }
    }

    @ViewBuilder
    var listingsContent: some View {
        if viewModel.listings.isEmpty {
            emptyState(icon: "heart.slash", text: "No favorite listings yet")
        } else {
            LazyVStack(spacing: 4) {
                ForEach(viewModel.listings) { listing in
                    NavigationLink(value: listing) {
                        ListingRow(listing: listing)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }

    @ViewBuilder
    var workersContent: some View {
        if viewModel.workers.isEmpty {
            emptyState(icon: "person.2.slash", text: "No favorite workers yet")
        } else {
            LazyVStack(spacing: 4) {
                ForEach(viewModel.workers, id: \.id) { professional in
                    NavigationLink(value: ProfileRoute(userId: professional.user.id)) {
                        ProviderRow(user: professional.user, listing: professional.listing)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }

    @ViewBuilder
    var shopsContent: some View {
        if viewModel.shops.isEmpty {
            emptyState(icon: "bag", text: "No favorite shops yet")
        } else {
            LazyVStack(spacing: 4) {
                ForEach(viewModel.shops) { shop in
                    ShopRow(shop: shop)
                }
            }
            .padding(.horizontal)
        }
    }

    @ViewBuilder
    var postsContent: some View {
        if viewModel.posts.isEmpty {
            emptyState(icon: "square.stack", text: "No bookmarked posts yet")
        } else {
            LazyVGrid(
                columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)],
                spacing: 8
            ) {
                ForEach(Array(viewModel.posts.enumerated()), id: \.element.id) { index, post in
                    PostCard(post: post, width: nil)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            feedStartIndex = index
                            showFeed = true
                        }
                }
            }
            .padding(.horizontal)
        }
    }

    func emptyState(icon: String, text: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundColor(ForMe.stone300)
            Text(text)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(ForMe.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 80)
    }
}

// MARK: - Tab Bar

private struct FavoritesTabBar: View {
    @Binding var selectedTab: Int
    let tabs: [String]
    @Namespace private var ns

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = index
                    }
                } label: {
                    VStack(spacing: 8) {
                        Text(tab)
                            .font(.system(size: 13, weight: selectedTab == index ? .semibold : .medium))
                            .foregroundColor(selectedTab == index ? ForMe.textPrimary : ForMe.stone400)

                        if selectedTab == index {
                            Capsule()
                                .fill(ForMe.stone900)
                                .frame(height: 2)
                                .matchedGeometryEffect(id: "favTab", in: ns)
                        } else {
                            Capsule().fill(.clear).frame(height: 2)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }
}

#Preview {
    FavoritesView()
}
