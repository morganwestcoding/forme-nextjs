import SwiftUI

struct BrandsView: View {
    @StateObject private var viewModel = BrandsViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showMessages = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Brands")
                            .font(.largeTitle.bold())
                            .foregroundColor(ForMe.textPrimary)

                        Text("Discover top shops")
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
                            appState.showingProfile = true
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

                // Category filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(ServiceCategory.allCases, id: \.self) { category in
                            FilterChip(
                                title: category.rawValue,
                                isSelected: viewModel.selectedCategory == category
                            ) {
                                if viewModel.selectedCategory == category {
                                    viewModel.selectedCategory = nil
                                } else {
                                    viewModel.selectedCategory = category
                                }
                                Task { await viewModel.loadListings() }
                            }
                        }
                    }
                    .padding(.horizontal)
                }

                // Shops list
                if viewModel.isLoading {
                    ProgressView()
                        .padding(.top, 60)
                } else if viewModel.listings.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "bag")
                            .font(.system(size: 40))
                            .foregroundColor(ForMe.textTertiary)
                        Text("No shops found")
                            .font(.subheadline)
                            .foregroundColor(ForMe.textSecondary)
                    }
                    .padding(.top, 60)
                } else {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(viewModel.listings.enumerated()), id: \.element.id) { index, listing in
                            NavigationLink(value: listing) {
                                ListingRow(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index)
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
            await viewModel.loadListings()
        }
        .task {
            await viewModel.loadListings()
        }
        .sheet(isPresented: $showMessages) {
            NavigationStack {
                MessagesListView()
            }
        }
    }
}

#Preview {
    BrandsView()
}
