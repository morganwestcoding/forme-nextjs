import SwiftUI

struct SearchView: View {
    @StateObject private var viewModel = SearchViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showMessages = false
    @FocusState private var searchFieldFocused: Bool

    // Reflects what the user actually sees after category + query filtering,
    // so the empty state triggers when *their* filters return nothing — not
    // just when /listings came back empty.
    private var hasResults: Bool {
        !viewModel.displayListings.isEmpty || !viewModel.workers.isEmpty
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                VStack(spacing: 16) {
                // Header — matches Discover (Logo on the left, plus + bell + chat + avatar on the right)
                HStack(alignment: .center) {
                    Image("Logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 36)
                        .opacity(0.9)

                    Spacer()

                    HStack(spacing: 2) {
                        Button {
                            appState.showingCreateMenu = true
                        } label: {
                            Image(systemName: "plus")
                                .font(.system(size: 20, weight: .regular))
                                .foregroundColor(ForMe.textSecondary)
                                .frame(width: 48, height: 48)
                                .contentShape(Circle())
                        }
                        .buttonStyle(.plain)

                        HeaderIconButton(icon: "AlertBell") {
                            appState.showingNotifications = true
                        }

                        HeaderIconButton(icon: "HeaderChat") {
                            showMessages = true
                        }

                        Button {
                            appState.showingProfile = true
                        } label: {
                            DynamicAvatar(
                                name: authViewModel.currentUser?.name ?? "User",
                                imageUrl: authViewModel.currentUser?.avatarURL,
                                size: .smallMedium
                            )
                        }
                        .padding(.leading, 4)
                    }
                }
                .padding(.horizontal)

                // Search bar — matches Discover exactly (inline markup, same placeholder/styling).
                HStack(spacing: 0) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 15))
                        .foregroundColor(ForMe.textTertiary)
                        .padding(.leading, ForMe.space4)

                    // Bound directly to viewModel.query so typing instantly narrows
                    // the list client-side — no debounce, no re-fetch, full 100-item
                    // loaded set stays searchable rather than being capped at 5.
                    TextField("Search posts, users, listings, shops…", text: $viewModel.query)
                        .font(ForMe.font(.regular, size: 15))
                        .foregroundColor(ForMe.textPrimary)
                        .tint(ForMe.accent)
                        .focused($searchFieldFocused)
                        .padding(.horizontal, 10)
                        .submitLabel(.search)

                    if !viewModel.query.isEmpty {
                        Button {
                            viewModel.query = ""
                            searchFieldFocused = false
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 14))
                                .foregroundColor(ForMe.stone400)
                        }
                        .padding(.trailing, 14)
                    }
                }
                .frame(height: 46)
                .background(ForMe.stone100)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                        .stroke(searchFieldFocused ? ForMe.borderHover : ForMe.border, lineWidth: 1)
                )
                .elevation(.level1)
                .padding(.horizontal)
                }

                // Sort row — the Search-only control that makes results rank-aware.
                // Hidden until we have results to sort so the empty state stays clean.
                if !viewModel.displayListings.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.up.arrow.down")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(ForMe.textTertiary)
                                .padding(.leading, 2)

                            ForEach(SearchSortOption.allCases) { option in
                                FilterChip(
                                    title: option.label,
                                    isSelected: viewModel.sortOption == option
                                ) {
                                    viewModel.sortOption = option
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                }

                // Results
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if !hasResults {
                    emptyState
                } else {
                    VStack(spacing: 24) {
                        // Workers section
                        if !viewModel.workers.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Workers")
                                    .font(.headline)
                                    .foregroundColor(ForMe.textPrimary)
                                    .padding(.horizontal)

                                LazyVStack(spacing: 4) {
                                    ForEach(Array(viewModel.workers.enumerated()), id: \.element.id) { index, worker in
                                        let workerListing = viewModel.listings.first { $0.userId == worker.id || $0.user?.id == worker.id }
                                        if let listing = workerListing {
                                            NavigationLink(value: listing) {
                                                WorkerRow(user: worker, listing: listing)
                                            }
                                            .buttonStyle(.plain)
                                            .staggeredFadeIn(index: index)
                                        } else {
                                            WorkerRow(user: worker, listing: nil)
                                                .staggeredFadeIn(index: index)
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }

                        // Listings section — uses displayListings so sort + query + category all apply.
                        if !viewModel.displayListings.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                resultsSummary
                                    .padding(.horizontal)

                                LazyVStack(spacing: 4) {
                                    ForEach(Array(viewModel.displayListings.enumerated()), id: \.element.id) { index, listing in
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
                    }
                }
            }
            .padding(.vertical)
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .task {
            await viewModel.search()
        }
        .sheet(isPresented: $showMessages) {
            NavigationStack {
                MessagesListView()
            }
        }
    }

    // MARK: - Subviews

    // Small header above the ranked list — shows the count + active sort so the
    // user understands *why* the ordering shifted. Discover never shows this
    // because its ordering is editorial, not user-chosen.
    private var resultsSummary: some View {
        let count = viewModel.displayListings.count
        return HStack(spacing: 4) {
            Text("\(count) \(count == 1 ? "result" : "results")")
                .font(ForMe.font(.semibold, size: 13))
                .foregroundColor(ForMe.textPrimary)

            if viewModel.sortOption != .relevance {
                Text("• sorted by \(viewModel.sortOption.label)")
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.textTertiary)
            }

            Spacer()
        }
    }

    // Empty state — when filters are active, suggest loosening them rather than
    // just saying "no results". On Discover we swap the category; on Search,
    // the answer is usually to relax the filters the user applied themselves.
    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 40))
                .foregroundColor(ForMe.textTertiary)

            Text(emptyStateTitle)
                .font(ForMe.font(.semibold, size: 15))
                .foregroundColor(ForMe.textSecondary)

            if let hint = emptyStateHint {
                Text(hint)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.textTertiary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            if !viewModel.query.isEmpty {
                Button {
                    viewModel.query = ""
                } label: {
                    Text("Clear search")
                        .font(ForMe.font(.semibold, size: 13))
                        .foregroundColor(.white)
                        .padding(.horizontal, 18)
                        .padding(.vertical, 9)
                        .background(ForMe.textPrimary)
                        .clipShape(Capsule())
                }
                .padding(.top, 4)
            }
        }
        .padding(.top, 60)
    }

    private var emptyStateTitle: String {
        viewModel.query.isEmpty ? "Start typing to search" : "No results found"
    }

    private var emptyStateHint: String? {
        viewModel.query.isEmpty
            ? nil
            : "We couldn't find anything for \"\(viewModel.query)\". Try a broader term."
    }

}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(ForMe.font(isSelected ? .semibold : .medium, size: 13))
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

// MARK: - Worker Row (temporary, will be rebuilt in Phase 2)

struct WorkerRow: View {
    let name: String
    let image: String?
    let listing: Listing?

    init(user: User, listing: Listing?) {
        self.name = user.name ?? "Provider"
        self.image = user.avatarURL
        self.listing = listing
    }

    var body: some View {
        HStack(spacing: 14) {
            DynamicAvatar(name: name, imageUrl: image, size: .medium)
            VStack(alignment: .leading, spacing: 4) {
                Text(name)
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                if let location = listing?.location {
                    Text(location)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
            Spacer()
        }
        .padding(ForMe.space3)
    }
}

#Preview {
    SearchView()
}
