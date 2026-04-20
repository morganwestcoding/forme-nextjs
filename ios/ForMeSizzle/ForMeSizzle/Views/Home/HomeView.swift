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
    @State private var showFeed = false
    @State private var feedStartIndex = 0

    private var showDropdown: Bool {
        searchFieldFocused && !searchQuery.isEmpty
    }

    private var isFiltered: Bool {
        viewModel.selectedCategory != nil
    }

    var body: some View {
        ZStack(alignment: .top) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    VStack(spacing: 16) {
                        headerSection
                        searchBarSection
                    }
                    VStack(spacing: 0) {
                        EditorialBanner(isCollapsed: isFiltered)
                            .padding(.horizontal)

                        // Spacer between banner and category — collapses when filtered
                        // so the category slides up to where the banner's top was.
                        Color.clear
                            .frame(height: isFiltered ? 0 : 28)

                        categorySection
                    }
                    if isFiltered {
                        resultsSection
                            .transition(.opacity)
                    } else {
                        postsSection
                        listingsSection
                        endlessSection
                    }
                }
                .padding(.vertical)
                .padding(.bottom, 80)
                .animation(.easeInOut(duration: 0.75), value: viewModel.selectedCategory)
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
        .navigationDestination(for: ListingIdRoute.self) { route in
            ListingByIdLoader(id: route.id)
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
        .fullScreenCover(isPresented: $showFeed) {
            FeedView(posts: viewModel.posts, startIndex: feedStartIndex)
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

            HStack(spacing: 2) {
                // Plus / Create button — matches HeaderIconButton styling
                Button {
                    appState.showingCreateMenu = true
                } label: {
                    Image(systemName: "plus")
                        .font(ForMe.font(.regular, size: 20))
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
                        imageUrl: authViewModel.currentUser?.image,
                        size: .smallMedium
                    )
                }
                .padding(.leading, 4)
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
                .font(ForMe.font(size: 15))
                .foregroundColor(ForMe.textTertiary)
                .padding(.leading, ForMe.space4)

            TextField("Search posts, users, listings, shops…", text: $searchQuery)
                .font(ForMe.font(size: 15))
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
                        .font(ForMe.font(size: 14))
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
                            .font(ForMe.font(size: 14))
                            .foregroundColor(ForMe.textTertiary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, ForMe.space4)
                } else if searchQuery.count >= 2 && searchResults.isEmpty {
                    Text("No results found for \"\(searchQuery)\"")
                        .font(ForMe.font(size: 14))
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
                        .font(ForMe.font(.semibold, size: 11))
                        .foregroundColor(ForMe.textTertiary)
                        .textCase(.uppercase)
                        .tracking(0.8)
                        .padding(.horizontal, ForMe.space4)
                        .padding(.top, ForMe.space3)
                        .padding(.bottom, ForMe.space1)

                    ForEach(items) { item in
                        SearchResultRow(item: item) {
                            handleSearchResultTap(item)
                        }
                    }
                }
            }
        }
        .padding(.vertical, ForMe.space1)
        .fixedSize(horizontal: false, vertical: true)
    }

    // Dispatches a dropdown tap to the right destination by type. Routes:
    //   listing / service → ListingDetailView via ListingIdRoute (loader fetches)
    //   user / employee   → ProfileView via ProfileRoute
    //   post              → FeedView (jump to that post, or top if not loaded)
    //   shop / product    → no-op (no destination wired yet)
    // Pushes synchronously so the transition starts immediately; the detail
    // view handles its own loading state.
    func handleSearchResultTap(_ item: SearchResultItem) {
        let id = item.id
        let type = item.type

        // Dismiss dropdown before navigating
        searchQuery = ""
        searchResults = []
        searchFieldFocused = false

        switch type {
        case "listing", "service":
            appState.navigationPath.append(ListingIdRoute(id: id))
        case "user", "employee":
            appState.navigationPath.append(ProfileRoute(userId: id))
        case "post":
            if let idx = viewModel.posts.firstIndex(where: { $0.id == id }) {
                feedStartIndex = idx
            } else {
                feedStartIndex = 0
            }
            showFeed = true
        default:
            // shop / product — destinations not yet implemented
            break
        }
    }
}

// Id-only route so search results can push a listing destination synchronously
// — the loader fetches the full Listing inside the pushed view, which means
// the user sees a nav transition the instant they tap (no network-latency stall).
struct ListingIdRoute: Hashable {
    let id: String
}

struct ListingByIdLoader: View {
    let id: String
    @State private var listing: Listing?
    @State private var loadError: String?

    var body: some View {
        Group {
            if let listing = listing {
                ListingDetailView(listing: listing)
            } else if loadError != nil {
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(ForMe.font(size: 28))
                        .foregroundColor(ForMe.textTertiary)
                    Text("Couldn't load this listing.")
                        .font(ForMe.font(size: 14))
                        .foregroundColor(ForMe.textSecondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(ForMe.background)
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(ForMe.background)
            }
        }
        .task {
            do {
                listing = try await APIService.shared.getListing(id: id)
            } catch {
                loadError = "\(error)"
                print("[ListingByIdLoader] failed to load \(id): \(error)")
            }
        }
    }
}

// MARK: - Categories (matches web "Shop By Category" with circles)

private extension HomeView {
    // Repeat category list enough times that the user can scroll effectively forever
    // in either direction. 50 cycles × 9 categories = 450 entries, start in the middle.
    static var cycledCategories: [(index: Int, category: ForMe.Category)] {
        let cats = ForMe.Category.allCases
        return (0..<(50 * cats.count)).map { i in
            (index: i, category: cats[i % cats.count])
        }
    }

    var categoryStartId: Int {
        (Self.cycledCategories.count / 2)
    }

    var categorySection: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 7) {
                    ForEach(Self.cycledCategories, id: \.index) { entry in
                        let cat = entry.category
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
                                    .font(ForMe.font(isSelected ? .semibold : .regular, size: 12))
                                    .foregroundColor(isSelected ? ForMe.textPrimary : ForMe.textSecondary)
                            }
                        }
                        .buttonStyle(.plain)
                        .id(entry.index)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }
            .onAppear {
                // Anchor the starting category ~20% in from the leading edge so
                // the previous item peeks on the left and several follow on the right,
                // making the bidirectional scroll affordance obvious.
                proxy.scrollTo(categoryStartId, anchor: UnitPoint(x: 0.5, y: 0.5))
            }
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
                        .font(ForMe.font(.bold, size: 18))
                        .foregroundColor(ForMe.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                        .padding(.bottom, 4)

                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)],
                        spacing: 8
                    ) {
                        ForEach(Array(viewModel.posts.prefix(4).enumerated()), id: \.element.id) { index, post in
                            PostCard(post: post, width: nil)
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    feedStartIndex = index
                                    showFeed = true
                                }
                                .staggeredFadeIn(index: index)
                        }
                    }
                    .padding(.horizontal)
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
                        .font(ForMe.font(.bold, size: 18))
                        .foregroundColor(ForMe.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                        .padding(.bottom, 4)

                    LazyVStack(spacing: 4) {
                        ForEach(Array(filteredListings.prefix(5).enumerated()), id: \.element.id) { index, listing in
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

    var filteredListings: [Listing] {
        guard let cat = viewModel.selectedCategory else { return viewModel.listings }
        return viewModel.listings.filter { $0.category.lowercased() == cat.lowercased() }
    }

    var filteredPosts: [Post] {
        guard let cat = viewModel.selectedCategory else { return viewModel.posts }
        return viewModel.posts.filter { ($0.category ?? "").lowercased() == cat.lowercased() }
    }

    var filteredEmployees: [Professional] {
        guard let cat = viewModel.selectedCategory else { return viewModel.employees }
        return viewModel.employees.filter { $0.listing.category.lowercased() == cat.lowercased() }
    }

    var totalResultsCount: Int {
        filteredPosts.count + filteredListings.count + filteredEmployees.count
    }
}

// MARK: - Results Section (category-filtered, matches web DiscoverClient filtered grid)

private extension HomeView {
    var resultsSection: some View {
        VStack(spacing: 20) {
            resultsHeader

            if totalResultsCount == 0 {
                Text("No results found. Try another category.")
                    .font(ForMe.font(size: 14))
                    .foregroundColor(ForMe.textTertiary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, ForMe.space6)
            } else {
                if !filteredPosts.isEmpty {
                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)],
                        spacing: 8
                    ) {
                        ForEach(Array(filteredPosts.enumerated()), id: \.element.id) { index, post in
                            PostCard(post: post, width: nil)
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    feedStartIndex = index
                                    showFeed = true
                                }
                                .staggeredFadeIn(index: index)
                        }
                    }
                    .padding(.horizontal)
                }

                if !filteredListings.isEmpty {
                    LazyVStack(spacing: 4) {
                        ForEach(Array(filteredListings.enumerated()), id: \.element.id) { index, listing in
                            NavigationLink(value: listing) {
                                ListingRow(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .staggeredFadeIn(index: index)
                        }
                    }
                    .padding(.horizontal)
                }

                if !filteredEmployees.isEmpty {
                    LazyVStack(spacing: 4) {
                        ForEach(Array(filteredEmployees.enumerated()), id: \.element.id) { index, professional in
                            // Tapping an employee row routes to that user's
                            // profile, not to their listing — matches the web's
                            // /profile/[id] behavior on Discover.
                            NavigationLink(value: ProfileRoute(userId: professional.user.id)) {
                                ProviderRow(user: professional.user, listing: professional.listing)
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

    var resultsHeader: some View {
        let count = totalResultsCount
        let cat = viewModel.selectedCategory ?? ""
        let suffix = cat.isEmpty ? "" : " — \(cat) Feed"
        return Text("\(count) \(count == 1 ? "Result" : "Results")\(suffix)")
            .font(ForMe.font(.semibold, size: 22))
            .foregroundColor(ForMe.textPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal)
    }
}

// MARK: - Endless Feed
//
// Pattern per cycle (repeats ~50× so scrolling feels unbounded):
//   4 posts → 5 employees → 4 posts → 5 shops* → 4 posts → 5 listings
// *shops block is skipped entirely when there are no shops.
// Indices wrap with modulo so content reorders naturally once exhausted.

private extension HomeView {
    enum EndlessBlock: Identifiable, Hashable {
        case posts(blockId: Int, start: Int, typeIndex: Int)
        case employees(blockId: Int, start: Int, typeIndex: Int)
        case shops(blockId: Int, start: Int, typeIndex: Int)
        case listings(blockId: Int, start: Int, typeIndex: Int)

        var id: String {
            switch self {
            case .posts(let b, _, _): return "p-\(b)"
            case .employees(let b, _, _): return "e-\(b)"
            case .shops(let b, _, _): return "s-\(b)"
            case .listings(let b, _, _): return "l-\(b)"
            }
        }
    }

    static let endlessCycles = 50
    static let postsPerBlock = 4
    static let peoplePerBlock = 5

    // Headlines rotate so repeated sections don't read as obvious duplicates.
    // The initial "Posts We Think You'll Love" and "Local Businesses Worth Checking Out"
    // live in the top sections, so these arrays start with fresh phrasing.
    static let postHeadlines = [
        "More Posts For You",
        "Fresh From The Feed",
        "Keep Scrolling",
        "You Might Also Like"
    ]
    static let employeeHeadlines = [
        "Trending Professionals",
        "Top Rated Pros",
        "Meet The Pros",
        "More Local Talent"
    ]
    static let shopHeadlines = [
        "Featured Shops",
        "Shops To Explore",
        "Trending Shops",
        "More Shops"
    ]
    static let listingHeadlines = [
        "More Places Nearby",
        "Spots To Explore",
        "Discover More Businesses",
        "Hidden Gems"
    ]

    var endlessBlocks: [EndlessBlock] {
        let hasPosts = !viewModel.posts.isEmpty
        let hasEmployees = !viewModel.employees.isEmpty
        let hasShops = !viewModel.shops.isEmpty
        let hasListings = !viewModel.listings.isEmpty

        var blocks: [EndlessBlock] = []
        // First posts/listings sections above already showed prefix(4)/prefix(5),
        // so the endless loop continues from those offsets to avoid repeats up front.
        var postCursor = 4
        var employeeCursor = 0
        var shopCursor = 0
        var listingCursor = 5
        var postsTypeIndex = 0
        var employeesTypeIndex = 0
        var shopsTypeIndex = 0
        var listingsTypeIndex = 0
        var id = 0
        // Gate post emission so two post blocks never land back-to-back —
        // e.g. when shops is empty and would otherwise leave two 2×2 grids adjacent.
        var lastWasPosts = false

        func emitPosts() {
            guard hasPosts, !lastWasPosts else { return }
            blocks.append(.posts(blockId: id, start: postCursor, typeIndex: postsTypeIndex))
            postCursor += Self.postsPerBlock
            postsTypeIndex += 1
            id += 1
            lastWasPosts = true
        }
        func emitEmployees() {
            guard hasEmployees else { return }
            blocks.append(.employees(blockId: id, start: employeeCursor, typeIndex: employeesTypeIndex))
            employeeCursor += Self.peoplePerBlock
            employeesTypeIndex += 1
            id += 1
            lastWasPosts = false
        }
        func emitShops() {
            guard hasShops else { return }
            blocks.append(.shops(blockId: id, start: shopCursor, typeIndex: shopsTypeIndex))
            shopCursor += Self.peoplePerBlock
            shopsTypeIndex += 1
            id += 1
            lastWasPosts = false
        }
        func emitListings() {
            guard hasListings else { return }
            blocks.append(.listings(blockId: id, start: listingCursor, typeIndex: listingsTypeIndex))
            listingCursor += Self.peoplePerBlock
            listingsTypeIndex += 1
            id += 1
            lastWasPosts = false
        }

        for _ in 0..<Self.endlessCycles {
            emitPosts()
            emitEmployees()
            emitPosts()
            emitShops()
            emitPosts()
            emitListings()
        }
        return blocks
    }

    var endlessSection: some View {
        LazyVStack(spacing: 28) {
            ForEach(endlessBlocks) { block in
                endlessBlockView(block)
            }
        }
    }

    @ViewBuilder
    func endlessBlockView(_ block: EndlessBlock) -> some View {
        switch block {
        case .posts(_, let start, let ti):
            endlessPostsBlock(start: start, headline: Self.postHeadlines[ti % Self.postHeadlines.count])
        case .employees(_, let start, let ti):
            endlessEmployeesBlock(start: start, headline: Self.employeeHeadlines[ti % Self.employeeHeadlines.count])
        case .shops(_, let start, let ti):
            endlessShopsBlock(start: start, headline: Self.shopHeadlines[ti % Self.shopHeadlines.count])
        case .listings(_, let start, let ti):
            endlessListingsBlock(start: start, headline: Self.listingHeadlines[ti % Self.listingHeadlines.count])
        }
    }

    private func cycled<T>(_ array: [T], start: Int, count: Int) -> [(realIndex: Int, item: T)] {
        guard !array.isEmpty else { return [] }
        return (0..<count).map { offset in
            let real = (start + offset) % array.count
            return (real, array[real])
        }
    }

    func sectionHeadline(_ text: String) -> some View {
        Text(text)
            .font(ForMe.font(.bold, size: 18))
            .foregroundColor(ForMe.textPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal)
            .padding(.bottom, 4)
    }

    func endlessPostsBlock(start: Int, headline: String) -> some View {
        let items = cycled(viewModel.posts, start: start, count: Self.postsPerBlock)
        return VStack(spacing: 14) {
            sectionHeadline(headline)
            LazyVGrid(
                columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)],
                spacing: 8
            ) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, pair in
                    PostCard(post: pair.item, width: nil)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            feedStartIndex = pair.realIndex
                            showFeed = true
                        }
                }
            }
            .padding(.horizontal)
        }
    }

    func endlessEmployeesBlock(start: Int, headline: String) -> some View {
        let items = cycled(viewModel.employees, start: start, count: Self.peoplePerBlock)
        return VStack(spacing: 14) {
            sectionHeadline(headline)
            LazyVStack(spacing: 4) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, pair in
                    NavigationLink(value: ProfileRoute(userId: pair.item.user.id)) {
                        ProviderRow(user: pair.item.user, listing: pair.item.listing)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }

    func endlessShopsBlock(start: Int, headline: String) -> some View {
        let items = cycled(viewModel.shops, start: start, count: Self.peoplePerBlock)
        return VStack(spacing: 14) {
            sectionHeadline(headline)
            LazyVStack(spacing: 4) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, pair in
                    ShopRow(shop: pair.item)
                }
            }
            .padding(.horizontal)
        }
    }

    func endlessListingsBlock(start: Int, headline: String) -> some View {
        let items = cycled(viewModel.listings, start: start, count: Self.peoplePerBlock)
        return VStack(spacing: 14) {
            sectionHeadline(headline)
            LazyVStack(spacing: 4) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, pair in
                    NavigationLink(value: pair.item) {
                        ListingRow(listing: pair.item)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Shop Row (used by endless feed — mirrors ListingRow layout)

struct ShopRow: View {
    let shop: Shop

    var body: some View {
        HStack(spacing: 14) {
            AsyncImage(url: URL(string: shop.coverImage ?? shop.logo ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                        .fill(LinearGradient(
                            colors: [ForMe.stone100, ForMe.stone200],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                }
            }
            .frame(width: 96, height: 96)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

            VStack(alignment: .leading, spacing: 6) {
                Text(shop.name)
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(2)

                if let location = shop.location {
                    Text(location)
                        .font(ForMe.font(.medium, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }

                HStack(spacing: 0) {
                    GoldStar(size: 11)
                        .padding(.trailing, 4)

                    Text(ratingText)
                        .font(ForMe.font(size: 11))
                        .foregroundColor(ForMe.stone500)
                        .monospacedDigit()
                }
            }

            Spacer()
        }
        .padding(ForMe.space3)
    }

    private var ratingText: String {
        let r = shop.rating ?? 0
        return r == 0 ? "5.0" : String(format: "%.1f", r)
    }
}

// MARK: - Section Header (matches web SectionHeader)

struct SectionHeader: View {
    let title: String
    var onSeeAll: (() -> Void)? = nil

    var body: some View {
        HStack {
            Text(title)
                .font(ForMe.font(.bold, size: 18))
                .foregroundColor(ForMe.textPrimary)

            Spacer()

            if let action = onSeeAll {
                Button("See All", action: action)
                    .font(ForMe.font(.medium, size: 13))
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
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(2)

                if let location = listing.location {
                    Text(location)
                        .font(ForMe.font(.medium, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }

                // Rating | Price (matches web ListingCard)
                HStack(spacing: 0) {
                    GoldStar(size: 11)
                        .padding(.trailing, 4)

                    Text(ratingText)
                        .font(ForMe.font(size: 11))
                        .foregroundColor(ForMe.stone500)
                        .monospacedDigit()

                    if let price = listing.priceRange {
                        Text("|")
                            .font(ForMe.font(size: 11))
                            .foregroundColor(ForMe.stone300)
                            .padding(.horizontal, 6)
                        Text(price)
                            .font(ForMe.font(size: 11))
                            .foregroundColor(ForMe.textTertiary)
                            .monospacedDigit()
                    }
                }
            }

            Spacer()

            // Trailing 3-dot menu
            Menu {
                Button {
                    quickBook()
                } label: {
                    Label("Quick Book", systemImage: "calendar.badge.plus")
                }
                Button {
                    shareListing()
                } label: {
                    Label("Share", systemImage: "square.and.arrow.up")
                }
            } label: {
                HugeMoreHorizontal(size: 18, color: ForMe.textTertiary)
                    .frame(width: 36, height: 36)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .menuOrder(.fixed)
            .padding(.trailing, -8)
        }
        .padding(ForMe.space3)
    }

    private var listingPlaceholder: some View {
        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
            .fill(LinearGradient(colors: [ForMe.stone100, ForMe.stone200], startPoint: .topLeading, endPoint: .bottomTrailing))
    }

    private var ratingText: String {
        // Matches web: if rating is 0, show 5.0 (fresh listings default)
        let r = listing.rating ?? 0
        return r == 0 ? "5.0" : String(format: "%.1f", r)
    }

    private func quickBook() {
        // TODO: present BookingView for the first available service
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    private func shareListing() {
        let text = "\(listing.title) on ForMe"
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }
}

// MARK: - Provider Card (matches web WorkerCard)

// MARK: - Listing Full Width Card (edge-to-edge image, info below)

struct ListingFullWidthCard: View {
    let listing: Listing
    @State private var isFavorited = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image with icons overlay
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().aspectRatio(contentMode: .fill)
                    default:
                        Rectangle()
                            .fill(ForMe.stone100)
                            .overlay(
                                Image(systemName: listing.categoryIcon)
                                    .font(ForMe.font(size: 28))
                                    .foregroundColor(ForMe.stone300)
                            )
                    }
                }
                .frame(height: 200)
                .frame(maxWidth: .infinity)
                .clipped()

                // Heart + Share on image
                VStack(spacing: 10) {
                    Button {
                        toggleFavorite()
                    } label: {
                        Image(systemName: isFavorited ? "heart.fill" : "heart")
                            .font(ForMe.font(.medium, size: 20))
                            .foregroundColor(isFavorited ? .red : .white)
                            .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    }
                    Button {
                        shareListing()
                    } label: {
                        HugeIcon(paths: HugeIcon.sharePaths, size: 20, color: .white.opacity(0.85))
                            .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    }
                }
                .padding(ForMe.space4)
            }
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))

            // Info below
            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(ForMe.font(.bold, size: 18))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)

                // Location | ★ Rating | Price (matches web ListingCard)
                HStack(spacing: 0) {
                    if let location = listing.location {
                        Text(location)
                            .font(ForMe.font(size: 12))
                            .foregroundColor(ForMe.textTertiary)
                            .padding(.trailing, 6)
                    }

                    GoldStar(size: 12)
                        .padding(.trailing, 4)

                    Text(ratingText)
                        .font(ForMe.font(size: 12))
                        .foregroundColor(ForMe.stone500)
                        .monospacedDigit()

                    if let price = listing.priceRange {
                        Text("|")
                            .font(ForMe.font(size: 12))
                            .foregroundColor(ForMe.stone300)
                            .padding(.horizontal, 6)
                        Text(price)
                            .font(ForMe.font(size: 12))
                            .foregroundColor(ForMe.textTertiary)
                            .monospacedDigit()
                    }
                }
            }
            .padding(.top, 16)
        }
        .onAppear {
            // Could check from local cache if listing is favorited
        }
    }

    private func toggleFavorite() {
        isFavorited.toggle()
        Task {
            do {
                if isFavorited {
                    try await APIService.shared.addFavorite(listingId: listing.id)
                } else {
                    try await APIService.shared.removeFavorite(listingId: listing.id)
                }
            } catch {
                // Revert on error
                isFavorited.toggle()
            }
        }
    }

    private func shareListing() {
        let text = listing.title
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }

    private var ratingText: String {
        let r = listing.rating ?? 0
        return r == 0 ? "5.0" : String(format: "%.1f", r)
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
                                .font(ForMe.font(size: 24))
                                .foregroundColor(ForMe.stone300)
                        )
                }
            }
            .frame(width: 120, height: 120)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

            VStack(spacing: 3) {
                Text(listing.title)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)

                if let location = listing.location {
                    Text(location)
                        .font(ForMe.font(size: 11))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }

                HStack(spacing: 3) {
                    GoldStar(size: 9)
                    Text(String(format: "%.1f", listing.rating ?? 0))
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundColor(ForMe.textPrimary)
                    Circle()
                        .fill(ForMe.stone300)
                        .frame(width: 3, height: 3)
                    Text("\(listing.ratingCount ?? 0) reviews")
                        .font(ForMe.font(size: 11))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
        }
    }
}

// MARK: - Provider Row (horizontal layout matching ListingRow)

struct ProviderRow: View {
    let name: String
    let image: String?
    let listing: Listing

    init(user: CompactUser, listing: Listing) {
        self.name = user.name ?? "Provider"
        self.image = user.image
        self.listing = listing
    }

    var body: some View {
        HStack(spacing: 14) {
            // Avatar thumbnail (circle, aligns with ListingRow image bounds)
            AsyncImage(url: URL(string: image ?? "")) { phase in
                switch phase {
                case .success(let img):
                    img
                        .resizable()
                        .scaledToFill()
                        .frame(width: 96, height: 96, alignment: .center)
                        .clipped()
                case .failure, .empty:
                    placeholder
                @unknown default:
                    placeholder
                }
            }
            .frame(width: 96, height: 96)
            .clipShape(Circle())

            // Content
            VStack(alignment: .leading, spacing: 6) {
                Text(name)
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(2)

                if let location = listing.location {
                    Text(location)
                        .font(ForMe.font(.medium, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }

                // ★ Rating | Price (matches ListingRow)
                HStack(spacing: 0) {
                    GoldStar(size: 11)
                        .padding(.trailing, 4)

                    Text(ratingText)
                        .font(ForMe.font(size: 11))
                        .foregroundColor(ForMe.stone500)
                        .monospacedDigit()

                    if let price = listing.priceRange {
                        Text("|")
                            .font(ForMe.font(size: 11))
                            .foregroundColor(ForMe.stone300)
                            .padding(.horizontal, 6)
                        Text(price)
                            .font(ForMe.font(size: 11))
                            .foregroundColor(ForMe.textTertiary)
                            .monospacedDigit()
                    }
                }
            }

            Spacer()

            // 3-dot menu
            Menu {
                Button {
                    quickBook()
                } label: {
                    Label("Quick Book", systemImage: "calendar.badge.plus")
                }
                Button {
                    shareProfile()
                } label: {
                    Label("Share", systemImage: "square.and.arrow.up")
                }
            } label: {
                HugeMoreHorizontal(size: 18, color: ForMe.textTertiary)
                    .frame(width: 36, height: 36)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .menuOrder(.fixed)
            .padding(.trailing, -8)
        }
        .padding(ForMe.space3)
    }

    private var placeholder: some View {
        Circle()
            .fill(LinearGradient(colors: [ForMe.stone100, ForMe.stone200], startPoint: .topLeading, endPoint: .bottomTrailing))
            .overlay(
                Text(initials)
                    .font(.system(size: 28, weight: .semibold, design: .rounded))
                    .foregroundColor(ForMe.stone400)
            )
    }

    private var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    private var ratingText: String {
        let r = listing.rating ?? 0
        return r == 0 ? "5.0" : String(format: "%.1f", r)
    }

    private func quickBook() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    private func shareProfile() {
        let text = "\(name) on ForMe"
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }
}

struct ProviderCard: View {
    let name: String
    let image: String?
    let listing: Listing?

    init(user: User, listing: Listing? = nil) {
        self.name = user.name ?? "Provider"
        self.image = user.image
        self.listing = listing
    }

    init(user: CompactUser, listing: Listing? = nil) {
        self.name = user.name ?? "Provider"
        self.image = user.image
        self.listing = listing
    }

    var body: some View {
        VStack(spacing: 10) {
            DynamicAvatar(name: name, imageUrl: image, size: .extraLarge, showBorder: false)

            VStack(spacing: 3) {
                Text(name)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)

                // Job title / associated listing
                Text(subtitleText)
                    .font(ForMe.font(size: 11))
                    .foregroundColor(ForMe.textTertiary)
                    .lineLimit(1)

                // ★ Rating | Price (matches web ListingRow format)
                if listing != nil {
                    HStack(spacing: 0) {
                        GoldStar(size: 10)
                            .padding(.trailing, 3)

                        Text(ratingText)
                            .font(ForMe.font(size: 11))
                            .foregroundColor(ForMe.stone500)
                            .monospacedDigit()

                        if let price = listing?.priceRange {
                            Text("|")
                                .font(ForMe.font(size: 11))
                                .foregroundColor(ForMe.stone300)
                                .padding(.horizontal, 5)
                            Text(price)
                                .font(ForMe.font(size: 11))
                                .foregroundColor(ForMe.textTertiary)
                                .monospacedDigit()
                        }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var subtitleText: String {
        // Show the listing's location (city, state)
        if let location = listing?.location, !location.isEmpty { return location }
        if let display = listing?.displayLocation, !display.isEmpty { return display }
        return "Location"
    }

    private var ratingText: String {
        let r = listing?.rating ?? 0
        return r == 0 ? "5.0" : String(format: "%.1f", r)
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
                                .font(ForMe.font(.medium, size: 10))
                                .foregroundColor(ForMe.textTertiary)
                        )
                }

                // Text
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.displayTitle)
                        .font(ForMe.font(.medium, size: 14))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)
                    if let subtitle = item.subtitle {
                        Text(subtitle)
                            .font(ForMe.font(size: 12))
                            .foregroundColor(ForMe.textTertiary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                // Type badge
                Text(item.type)
                    .font(ForMe.font(.medium, size: 10))
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
