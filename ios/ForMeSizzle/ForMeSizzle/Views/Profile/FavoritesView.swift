import SwiftUI

struct FavoritesView: View {
    @StateObject private var viewModel = FavoritesViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0

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
            VStack(spacing: 30) {
                ForEach(viewModel.listings) { listing in
                    NavigationLink(value: listing) {
                        ListingFullWidthCard(listing: listing)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, ForMe.space6)
        }
    }

    @ViewBuilder
    var workersContent: some View {
        if viewModel.workers.isEmpty {
            emptyState(icon: "person.2.slash", text: "No favorite workers yet")
        } else {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                ForEach(viewModel.workers, id: \.id) { worker in
                    ProviderCard(user: worker)
                }
            }
            .padding(.horizontal, ForMe.space6)
        }
    }

    @ViewBuilder
    var shopsContent: some View {
        if viewModel.shops.isEmpty {
            emptyState(icon: "bag", text: "No favorite shops yet")
        } else {
            VStack(spacing: 12) {
                ForEach(viewModel.shops) { shop in
                    Text(shop.name)
                        .font(.system(size: 15, weight: .semibold))
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(ForMe.surface)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                }
            }
            .padding(.horizontal, ForMe.space6)
        }
    }

    @ViewBuilder
    var postsContent: some View {
        if viewModel.posts.isEmpty {
            emptyState(icon: "square.stack", text: "No bookmarked posts yet")
        } else {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 2), spacing: 4) {
                ForEach(viewModel.posts) { post in
                    PostCard(post: post)
                }
            }
            .padding(.horizontal, ForMe.space6)
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
