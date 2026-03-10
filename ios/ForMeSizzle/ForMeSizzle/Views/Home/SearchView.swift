import SwiftUI

struct SearchView: View {
    @StateObject private var viewModel = SearchViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var searchText = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Search")
                            .font(.largeTitle.bold())
                            .foregroundColor(ForMe.textPrimary)

                        Text("Find services near you")
                            .font(.subheadline)
                            .foregroundColor(ForMe.textSecondary)
                    }

                    Spacer()

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
                .padding(.horizontal)

                ForMeSearchBar(text: $searchText, placeholder: "Looking for something?")
                    .padding(.horizontal)

                // Category filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChip(
                            title: "All",
                            isSelected: viewModel.selectedCategory == nil
                        ) {
                            viewModel.selectedCategory = nil
                            Task { await viewModel.search() }
                        }

                        ForEach(ServiceCategory.allCases, id: \.self) { category in
                            FilterChip(
                                title: category.rawValue,
                                isSelected: viewModel.selectedCategory == category
                            ) {
                                viewModel.selectedCategory = category
                                Task { await viewModel.search() }
                            }
                        }
                    }
                    .padding(.horizontal)
                }

                // Results
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if viewModel.listings.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 40))
                            .foregroundColor(ForMe.textTertiary)
                        Text(searchText.isEmpty ? "Start typing to search" : "No results found")
                            .font(.subheadline)
                            .foregroundColor(ForMe.textSecondary)
                    }
                    .padding(.top, 60)
                } else {
                    LazyVStack(spacing: 4) {
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
        .onChange(of: searchText) { _, newValue in
            viewModel.query = newValue
            Task {
                try? await Task.sleep(nanoseconds: 300_000_000)
                await viewModel.search()
            }
        }
        .task {
            await viewModel.search()
        }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: isSelected ? .semibold : .medium))
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? ForMe.textPrimary : Color(hex: "F7F7F6"))
                .foregroundColor(isSelected ? .white : ForMe.textSecondary)
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .stroke(isSelected ? Color.clear : ForMe.border, lineWidth: 1)
                )
                .cornerRadius(8)
        }
    }
}

#Preview {
    SearchView()
}
