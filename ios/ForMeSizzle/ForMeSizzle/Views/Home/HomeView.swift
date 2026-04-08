import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showMessages = false
    @State private var searchQuery = ""
    @State private var searchResults: [SearchResultItem] = []
    @State private var isSearching = false
    @FocusState private var searchFieldFocused: Bool
    @State private var searchTask: Task<Void, Never>?

    private var showDropdown: Bool {
        searchFieldFocused && !searchQuery.isEmpty
    }

    var body: some View {
        ZStack(alignment: .top) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    VStack(spacing: 16) {
                        headerSection
                        searchBarSection
                    }
                    categorySection
                    postsSection
                    listingsSection
                    professionalsSection
                }
                .padding(.vertical)
                .padding(.bottom, 80)
            }
            .background(ForMe.background)

            // Search dropdown overlay
            if showDropdown {
                searchDropdown
            }
        }
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
        .onChange(of: searchQuery) { _, newValue in
            searchTask?.cancel()
            let trimmed = newValue
                .trimmingCharacters(in: .whitespaces)
                .replacingOccurrences(of: "\u{2018}", with: "'") // left smart quote
                .replacingOccurrences(of: "\u{2019}", with: "'") // right smart quote
                .replacingOccurrences(of: "\u{201C}", with: "\"") // left double smart quote
                .replacingOccurrences(of: "\u{201D}", with: "\"") // right double smart quote
            guard trimmed.count >= 2 else {
                searchResults = []
                isSearching = false
                return
            }
            isSearching = true
            searchTask = Task {
                // No debounce — fire immediately
                guard !Task.isCancelled else { return }
                do {
                    let response = try await APIService.shared.search(query: trimmed)
                    guard !Task.isCancelled else { return }
                    let results = response.results ?? []
                    print("[Search] query='\(trimmed)' → \(results.count) results")
                    searchResults = results
                } catch {
                    print("[Search] query='\(trimmed)' → error: \(error)")
                    if !Task.isCancelled { searchResults = [] }
                }
                isSearching = false
            }
        }
    }
}

// MARK: - Header

private extension HomeView {
    var headerSection: some View {
        HStack(alignment: .center) {
            Image("Logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 36)
                .opacity(0.9)

            Spacer()

            HStack(spacing: 12) {
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
                        imageUrl: authViewModel.currentUser?.image,
                        size: .smallMedium
                    )
                }
            }
        }
        .padding(.horizontal)
    }
}

// MARK: - Search Bar (inline, matches web GlobalSearch)

private extension HomeView {
    var searchBarSection: some View {
        HStack(spacing: 0) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15))
                .foregroundColor(ForMe.textTertiary)
                .padding(.leading, ForMe.space4)

            TextField("Search posts, users, listings, shops…", text: $searchQuery)
                .font(.system(size: 15))
                .foregroundColor(ForMe.textPrimary)
                .tint(ForMe.accent)
                .focused($searchFieldFocused)
                .padding(.horizontal, 10)
                .submitLabel(.search)

            if !searchQuery.isEmpty {
                Button {
                    searchQuery = ""
                    searchResults = []
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
        .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: 1)
        .padding(.horizontal)
    }

    // MARK: - Search Dropdown (matches web GlobalSearch dropdown)

    var searchDropdown: some View {
        VStack(spacing: 0) {
            // Spacer for header + search bar height
            Color.clear.frame(height: 130)

            VStack(spacing: 0) {
                if isSearching {
                    HStack(spacing: 8) {
                        ProgressView()
                            .scaleEffect(0.8)
                        Text("Searching…")
                            .font(.system(size: 14))
                            .foregroundColor(ForMe.textTertiary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, ForMe.space4)
                } else if searchQuery.count >= 2 && searchResults.isEmpty {
                    Text("No results found for \"\(searchQuery)\"")
                        .font(.system(size: 14))
                        .foregroundColor(ForMe.textTertiary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, ForMe.space4)
                } else {
                    searchResultsList
                }
            }
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.12), radius: 12, x: 0, y: 4)
            .padding(.horizontal)

            Spacer()
        }
    }

    var searchResultsList: some View {
        let grouped = Dictionary(grouping: searchResults, by: \.type)
        let typeOrder = ["user", "listing", "shop", "product", "employee", "service", "post"]

        return VStack(alignment: .leading, spacing: 0) {
            ForEach(typeOrder, id: \.self) { typeKey in
                if let items = grouped[typeKey], !items.isEmpty {
                    Text(items[0].typeLabel)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(ForMe.textTertiary)
                        .textCase(.uppercase)
                        .tracking(0.8)
                        .padding(.horizontal, ForMe.space4)
                        .padding(.top, ForMe.space3)
                        .padding(.bottom, ForMe.space1)

                    ForEach(items) { item in
                        SearchResultRow(item: item) {
                            searchQuery = ""
                            searchResults = []
                            searchFieldFocused = false
                        }
                    }
                }
            }
        }
        .padding(.vertical, ForMe.space1)
        .fixedSize(horizontal: false, vertical: true)
    }
}

// MARK: - Categories (matches web "Shop By Category" with circles)

private extension HomeView {
    var categorySection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(ForMe.Category.allCases, id: \.self) { cat in
                    let isSelected = viewModel.selectedCategory == cat.rawValue
                    Button {
                        if isSelected {
                            viewModel.selectedCategory = nil
                        } else {
                            viewModel.selectedCategory = cat.rawValue
                        }
                    } label: {
                        VStack(spacing: 8) {
                            Image("Category\(cat.rawValue)")
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 72, height: 72)
                                .clipShape(Circle())
                                .overlay(
                                    Circle()
                                        .stroke(
                                            isSelected ? ForMe.stone900 : ForMe.stone200,
                                            lineWidth: isSelected ? 2.5 : 1.5
                                        )
                                )
                                .shadow(color: isSelected ? ForMe.stone900.opacity(0.15) : .clear, radius: 6, x: 0, y: 3)

                            Text(cat.rawValue)
                                .font(.system(size: 12, weight: isSelected ? .semibold : .regular))
                                .foregroundColor(isSelected ? ForMe.textPrimary : ForMe.textSecondary)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Posts Section

private extension HomeView {
    var postsSection: some View {
        Group {
            if !viewModel.posts.isEmpty {
                VStack(spacing: 14) {
                    Text("Posts We Think You'll Love")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(ForMe.stone500)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.bottom, 4)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(Array(viewModel.posts.prefix(14).enumerated()), id: \.element.id) { index, post in
                                PostCard(post: post)
                                    .staggeredFadeIn(index: index)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
        }
    }
}

// MARK: - Listings Section

private extension HomeView {
    var listingsSection: some View {
        Group {
            if !filteredListings.isEmpty {
                VStack(spacing: 14) {
                    Text("Local Businesses Worth Checking Out")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(ForMe.stone500)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.bottom, 4)

                    VStack(spacing: 20) {
                        ForEach(Array(filteredListings.prefix(9).enumerated()), id: \.element.id) { index, listing in
                            NavigationLink(value: listing) {
                                ListingFullWidthCard(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index)
                        }
                    }
                }
            }
        }
    }

    var filteredListings: [Listing] {
        guard let cat = viewModel.selectedCategory else { return viewModel.listings }
        return viewModel.listings.filter { $0.category.lowercased() == cat.lowercased() }
    }
}

// MARK: - Professionals Section

private extension HomeView {
    var professionalsSection: some View {
        Group {
            if !viewModel.employees.isEmpty {
                VStack(spacing: 14) {
                    Text("Trending Professionals")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(ForMe.stone500)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.bottom, 4)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                        ForEach(Array(viewModel.employees.prefix(9).enumerated()), id: \.element.id) { index, provider in
                            let providerListing = viewModel.listings.first { $0.user?.id == provider.id || $0.userId == provider.id }
                            if let listing = providerListing {
                                NavigationLink(value: listing) {
                                    ProviderCard(user: provider)
                                }
                                .buttonStyle(.plain)
                            } else {
                                ProviderCard(user: provider)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
    }
}

// MARK: - Section Header (matches web SectionHeader)

struct SectionHeader: View {
    let title: String
    var onSeeAll: (() -> Void)? = nil

    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            Spacer()

            if let action = onSeeAll {
                Button("See All", action: action)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(ForMe.textTertiary)
            }
        }
    }
}

// MARK: - Listing Row (matches web ListingCard horizontal variant)

struct ListingRow: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: 14) {
            // Image
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                case .failure:
                    listingPlaceholder
                case .empty:
                    listingPlaceholder
                @unknown default:
                    listingPlaceholder
                }
            }
            .frame(width: 96, height: 96)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

            // Content
            VStack(alignment: .leading, spacing: 6) {
                Text(listing.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(2)

                if let location = listing.location {
                    Text(location)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }

                // Rating
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 10))
                        .foregroundColor(Color(hex: "FBBF24"))
                    Text(String(format: "%.1f", listing.rating ?? 0))
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(ForMe.textPrimary)

                    dotSeparator

                    Text("\(listing.ratingCount ?? 0) reviews")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ForMe.textTertiary)
                }
            }

            Spacer()
        }
        .padding(ForMe.space3)
    }

    private var listingPlaceholder: some View {
        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
            .fill(LinearGradient(colors: [ForMe.stone100, ForMe.stone200], startPoint: .topLeading, endPoint: .bottomTrailing))
    }

    private var dotSeparator: some View {
        Circle()
            .fill(ForMe.stone300)
            .frame(width: 3, height: 3)
    }
}

// MARK: - Provider Card (matches web WorkerCard)

// MARK: - Listing Full Width Card (edge-to-edge image, info below)

struct ListingFullWidthCard: View {
    let listing: Listing

    var body: some View {
        VStack(spacing: 0) {
            // Image — edge to edge, no radius
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle()
                        .fill(ForMe.stone100)
                        .overlay(
                            Image(systemName: listing.categoryIcon)
                                .font(.system(size: 28))
                                .foregroundColor(ForMe.stone300)
                        )
                }
            }
            .frame(height: 200)
            .frame(maxWidth: .infinity)
            .clipped()

            // Info below
            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)

                HStack(spacing: 0) {
                    if let location = listing.location {
                        Text(location)
                            .font(.system(size: 12))
                            .foregroundColor(ForMe.textTertiary)
                    }

                    Circle()
                        .fill(ForMe.stone300)
                        .frame(width: 3, height: 3)
                        .padding(.horizontal, 6)

                    Image(systemName: "star.fill")
                        .font(.system(size: 9))
                        .foregroundColor(Color(hex: "FBBF24"))
                    Text(" \(String(format: "%.1f", listing.rating ?? 0))")
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundColor(ForMe.textPrimary)

                    Text(" (\(listing.ratingCount ?? 0))")
                        .font(.system(size: 11))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
            .padding(.top, 10)
            .padding(.horizontal, ForMe.space4)
        }
    }
}

// MARK: - Listing Grid Card (2-col, image on top, info below)

struct ListingGridCard: View {
    let listing: Listing

    var body: some View {
        VStack(spacing: 10) {
            // Listing image
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                        .fill(ForMe.stone100)
                        .overlay(
                            Image(systemName: listing.categoryIcon)
                                .font(.system(size: 24))
                                .foregroundColor(ForMe.stone300)
                        )
                }
            }
            .frame(width: 120, height: 120)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

            VStack(spacing: 3) {
                Text(listing.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)

                if let location = listing.location {
                    Text(location)
                        .font(.system(size: 11))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }

                HStack(spacing: 3) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 9))
                        .foregroundColor(Color(hex: "FBBF24"))
                    Text(String(format: "%.1f", listing.rating ?? 0))
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundColor(ForMe.textPrimary)
                    Circle()
                        .fill(ForMe.stone300)
                        .frame(width: 3, height: 3)
                    Text("\(listing.ratingCount ?? 0) reviews")
                        .font(.system(size: 11))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
        }
    }
}

struct ProviderCard: View {
    let name: String
    let image: String?

    init(user: User) {
        self.name = user.name ?? "Provider"
        self.image = user.image
    }

    init(user: CompactUser) {
        self.name = user.name ?? "Provider"
        self.image = user.image
    }

    var body: some View {
        VStack(spacing: 10) {
            DynamicAvatar(name: name, imageUrl: image, size: .large)

            Text(name)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)
                .lineLimit(1)

            Text("Service Provider")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(ForMe.textTertiary)
        }
        .frame(width: 100)
    }
}

// MARK: - Search Result Row (matches web GlobalSearch dropdown items)

struct SearchResultRow: View {
    let item: SearchResultItem
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Thumbnail
                if let imageUrl = item.image, !imageUrl.isEmpty {
                    AsyncImage(url: URL(string: imageUrl)) { img in
                        img.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                            .fill(ForMe.stone100)
                    }
                    .frame(width: 36, height: 36)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                } else {
                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                        .fill(ForMe.stone100)
                        .frame(width: 36, height: 36)
                        .overlay(
                            Text(item.type.prefix(2).uppercased())
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(ForMe.textTertiary)
                        )
                }

                // Text
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.displayTitle)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)
                    if let subtitle = item.subtitle {
                        Text(subtitle)
                            .font(.system(size: 12))
                            .foregroundColor(ForMe.textTertiary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                // Type badge
                Text(item.type)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(ForMe.textTertiary)
                    .textCase(.uppercase)
                    .tracking(0.5)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(ForMe.stone50)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }
            .padding(.horizontal, ForMe.space4)
            .padding(.vertical, 10)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Previews

#Preview("Home") {
    HomeView()
        .environmentObject(AppState())
        .environmentObject(AuthViewModel())
}

#Preview("Listing Row") {
    ListingRow(listing: Listing(
        id: "1",
        title: "Pretty Ricky's Hair and Braid",
        description: "Premium styling",
        imageSrc: nil,
        category: "Barber",
        location: "Long Beach, CA",
        rating: 4.8,
        ratingCount: 124,
        userId: "1"
    ))
    .padding()
}

#Preview("Provider Card") {
    HStack(spacing: 16) {
        ProviderCard(user: User(id: "1", name: "Marcus J."))
        ProviderCard(user: User(id: "2", name: "Sarah C."))
    }
    .padding()
    .background(ForMe.background)
}
