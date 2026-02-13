import SwiftUI

struct SearchView: View {
    @StateObject private var viewModel = SearchViewModel()
    @State private var searchText = ""

    var body: some View {
        VStack(spacing: 0) {
            // Search header
            VStack(spacing: 12) {
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
            }
            .padding(.top, 8)
            .padding(.bottom, 12)
            .background(ForMe.background)

            // Thin separator
            Rectangle()
                .fill(ForMe.border.opacity(0.5))
                .frame(height: 0.5)

            // Results
            if viewModel.isLoading {
                Spacer()
                ForMeLoader(size: .medium)
                Spacer()
            } else if viewModel.listings.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 40))
                        .foregroundColor(ForMe.textTertiary)
                    Text(searchText.isEmpty ? "Start typing to search" : "No results found")
                        .font(.subheadline)
                        .foregroundColor(ForMe.textSecondary)
                }
                Spacer()
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(Array(viewModel.listings.enumerated()), id: \.element.id) { index, listing in
                            NavigationLink(value: listing) {
                                ListingRow(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index)
                        }
                    }
                    .padding()
                }
            }
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
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isSelected ? Color.clear : ForMe.border, lineWidth: 1)
                )
                .cornerRadius(20)
        }
    }
}

#Preview {
    SearchView()
}
