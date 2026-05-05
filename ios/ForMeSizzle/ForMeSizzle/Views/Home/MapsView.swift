import SwiftUI
import MapKit
import Combine

// MARK: - API response types
//
// The /listings/map endpoint returns two parallel arrays:
//   - listings: real storefronts (Listing model)
//   - workers:  independents, surfaced from their hidden shell listing's
//     geocode but never exposing the shell itself (see feedback memo).

struct MapWorker: Codable, Identifiable, Hashable {
    let id: String
    let userId: String?
    let fullName: String
    let jobTitle: String?
    let image: String?
    let location: String?
    let lat: Double?
    let lng: Double?
    let rating: Double?
    let ratingCount: Int?
}

struct MapItemsResponse: Codable {
    let listings: [Listing]
    let workers: [MapWorker]
}

// Unified pin/row model so map annotations and the result list both render
// from a single source. Routes split on `kind`: listings → ListingDetailView,
// workers → ProfileView.
enum MapItem: Identifiable, Hashable {
    case listing(Listing)
    case worker(MapWorker)

    var id: String {
        switch self {
        case .listing(let l): return "listing:\(l.id)"
        case .worker(let w): return "worker:\(w.id)"
        }
    }

    var title: String {
        switch self {
        case .listing(let l): return l.title
        case .worker(let w): return w.fullName
        }
    }

    var category: String {
        switch self {
        case .listing(let l): return l.category
        case .worker(let w): return w.jobTitle ?? "Independent"
        }
    }

    var imageSrc: String? {
        switch self {
        case .listing(let l): return l.imageSrc
        case .worker(let w): return w.image
        }
    }

    var location: String? {
        switch self {
        case .listing(let l): return l.address ?? l.location
        case .worker(let w): return w.location
        }
    }

    var lat: Double? {
        switch self {
        case .listing(let l): return l.lat
        case .worker(let w): return w.lat
        }
    }

    var lng: Double? {
        switch self {
        case .listing(let l): return l.lng
        case .worker(let w): return w.lng
        }
    }

    var rating: Double? {
        switch self {
        case .listing(let l): return l.rating
        case .worker(let w): return w.rating
        }
    }

    var ratingCount: Int? {
        switch self {
        case .listing(let l): return l.ratingCount
        case .worker(let w): return w.ratingCount
        }
    }

    var isWorker: Bool {
        if case .worker = self { return true }
        return false
    }
}

// MARK: - Filter state

enum MapSortOption: String, CaseIterable, Identifiable {
    case nearest, name
    var id: String { rawValue }
    var label: String {
        switch self {
        case .nearest: return "Nearest"
        case .name: return "Name"
        }
    }
}

private let kRadiusOptions: [Double] = [5, 10, 25, 50, 100]

// MARK: - MapsView

struct MapsView: View {
    @StateObject private var viewModel = MapsViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var showMessages = false
    @State private var position: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 34.0522, longitude: -118.2437),
            span: MKCoordinateSpan(latitudeDelta: 0.4, longitudeDelta: 0.4)
        )
    )
    @State private var selectedItemId: MapItem.ID?
    @State private var showCategorySheet = false
    @FocusState private var searchFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Top section — fixed (doesn't scroll with the results list below).
            VStack(spacing: 16) {
                headerSection
                searchBarSection
                filtersBar
            }
            .padding(.bottom, 12)

            mapLightbox
                .padding(.horizontal)

            resultsList
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .navigationDestination(for: ListingIdRoute.self) { route in
            ListingByIdLoader(id: route.id)
        }
        .navigationDestination(for: ProfileRoute.self) { route in
            ProfileView(userId: route.userId)
        }
        .sheet(isPresented: $showMessages) {
            NavigationStack { MessagesListView() }
        }
        .sheet(isPresented: $showCategorySheet) {
            CategoryFilterSheet(selected: $viewModel.selectedCategories)
                .presentationDetents([.medium, .large])
        }
        .task {
            await viewModel.load()
        }
    }

    // MARK: Header — matches Discover/Search
    private var headerSection: some View {
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
        .padding(.top, 8)
    }

    // MARK: Search bar — matches Discover/Search
    private var searchBarSection: some View {
        HStack(spacing: 0) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15))
                .foregroundColor(ForMe.textTertiary)
                .padding(.leading, ForMe.space4)

            TextField("Search businesses, categories…", text: $viewModel.search)
                .font(ForMe.font(.regular, size: 15))
                .foregroundColor(ForMe.textPrimary)
                .tint(ForMe.accent)
                .focused($searchFocused)
                .padding(.horizontal, 10)
                .submitLabel(.search)

            if !viewModel.search.isEmpty {
                Button {
                    viewModel.search = ""
                    searchFocused = false
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
                .stroke(searchFocused ? ForMe.borderHover : ForMe.border, lineWidth: 1)
        )
        .elevation(.level1)
        .padding(.horizontal)
    }

    // MARK: Filters bar — horizontal pills, mirror of web's Filters panel
    //
    // Single-value filters (sort/distance/rating) use Menu so the picker
    // stays inline. Categories is multi-select so it opens a bottom sheet
    // where the full chip grid has room to breathe.
    private var filtersBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                // Sort
                Menu {
                    ForEach(MapSortOption.allCases) { opt in
                        Button {
                            viewModel.sortOption = opt
                        } label: {
                            HStack {
                                Text(opt.label)
                                if viewModel.sortOption == opt {
                                    Spacer()
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    FilterMenuPill(
                        label: viewModel.sortOption.label,
                        leadingSystemImage: "arrow.up.arrow.down",
                        isActive: viewModel.sortOption != .nearest
                    )
                }

                // Categories
                Button {
                    showCategorySheet = true
                } label: {
                    FilterMenuPill(
                        label: categoryPillLabel,
                        leadingSystemImage: "square.grid.2x2",
                        isActive: !viewModel.selectedCategories.isEmpty
                    )
                }
                .buttonStyle(.plain)

                // Distance
                Menu {
                    Button {
                        viewModel.selectedRadius = nil
                    } label: {
                        HStack {
                            Text("Any distance")
                            if viewModel.selectedRadius == nil {
                                Spacer()
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                    ForEach(kRadiusOptions, id: \.self) { r in
                        Button {
                            viewModel.selectedRadius = r
                        } label: {
                            HStack {
                                Text("\(Int(r)) mi")
                                if viewModel.selectedRadius == r {
                                    Spacer()
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    FilterMenuPill(
                        label: distancePillLabel,
                        leadingSystemImage: "location.circle",
                        isActive: viewModel.selectedRadius != nil
                    )
                }

                // Min rating
                Menu {
                    Button {
                        viewModel.minRating = nil
                    } label: {
                        HStack {
                            Text("Any rating")
                            if viewModel.minRating == nil {
                                Spacer()
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                    ForEach([5, 4, 3, 2, 1], id: \.self) { n in
                        Button {
                            viewModel.minRating = Double(n)
                        } label: {
                            HStack {
                                Text("\(n)★ & up")
                                if viewModel.minRating == Double(n) {
                                    Spacer()
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    FilterMenuPill(
                        label: ratingPillLabel,
                        leadingSystemImage: "star",
                        isActive: viewModel.minRating != nil
                    )
                }

                if viewModel.activeFilterCount > 0 {
                    Button {
                        viewModel.clearFilters()
                    } label: {
                        Text("Clear")
                            .font(ForMe.font(.medium, size: 13))
                            .foregroundColor(ForMe.textTertiary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 7)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }

    private var categoryPillLabel: String {
        if viewModel.selectedCategories.isEmpty { return "All Categories" }
        if viewModel.selectedCategories.count == 1 { return viewModel.selectedCategories.first ?? "" }
        return "\(viewModel.selectedCategories.count) Categories"
    }

    private var distancePillLabel: String {
        if let r = viewModel.selectedRadius { return "\(Int(r)) mi" }
        return "Any Distance"
    }

    private var ratingPillLabel: String {
        if let r = viewModel.minRating { return "\(Int(r))★+" }
        return "Any Rating"
    }

    // MARK: Map lightbox — contained card, not edge-to-edge
    private var mapLightbox: some View {
        ZStack {
            Map(position: $position, selection: $selectedItemId) {
                ForEach(viewModel.visibleItems) { item in
                    if let lat = item.lat, let lng = item.lng {
                        Annotation(item.title, coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng)) {
                            MapPinView(item: item, isSelected: selectedItemId == item.id)
                        }
                        .tag(item.id)
                    }
                }
            }
            .mapStyle(.standard(pointsOfInterest: .excludingAll))
            .onChange(of: selectedItemId) { _, new in
                guard let new, let item = viewModel.visibleItems.first(where: { $0.id == new }),
                      let lat = item.lat, let lng = item.lng else { return }
                withAnimation(.easeInOut(duration: 0.4)) {
                    position = .region(MKCoordinateRegion(
                        center: CLLocationCoordinate2D(latitude: lat, longitude: lng),
                        span: MKCoordinateSpan(latitudeDelta: 0.04, longitudeDelta: 0.04)
                    ))
                }
            }

            // Selected popup
            if let id = selectedItemId,
               let item = viewModel.visibleItems.first(where: { $0.id == id }) {
                VStack {
                    Spacer()
                    selectedPopup(for: item)
                        .padding(.horizontal, 12)
                        .padding(.bottom, 12)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.spring(response: 0.35, dampingFraction: 0.85), value: selectedItemId)
            }

            // Empty state inside the map card when filters return zero pins.
            if viewModel.visibleItems.isEmpty && !viewModel.isLoading {
                VStack(spacing: 6) {
                    Image(systemName: "mappin.slash")
                        .font(.system(size: 24))
                        .foregroundColor(ForMe.textTertiary)
                    Text("No places match these filters")
                        .font(ForMe.font(.medium, size: 13))
                        .foregroundColor(ForMe.textSecondary)
                }
                .padding(14)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }

            if viewModel.isLoading && viewModel.allItems.isEmpty {
                ProgressView()
            }
        }
        .frame(height: 360)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .elevation(.level2)
    }

    // MARK: Results list — mirrors the sidebar list on web
    private var resultsList: some View {
        ScrollView {
            LazyVStack(spacing: 4) {
                if viewModel.visibleItems.isEmpty && !viewModel.isLoading {
                    VStack(spacing: 10) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 28))
                            .foregroundColor(ForMe.textTertiary)
                        Text(viewModel.search.isEmpty ? "No places match these filters" : "No matches for your search")
                            .font(ForMe.font(.medium, size: 13))
                            .foregroundColor(ForMe.textSecondary)
                        if viewModel.activeFilterCount > 0 {
                            Button {
                                viewModel.clearFilters()
                            } label: {
                                Text("Clear filters")
                                    .font(ForMe.font(.semibold, size: 12))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 7)
                                    .background(ForMe.textPrimary)
                                    .clipShape(Capsule())
                            }
                            .padding(.top, 4)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 36)
                } else {
                    HStack {
                        Text("\(viewModel.visibleItems.count) \(viewModel.visibleItems.count == 1 ? "result" : "results")")
                            .font(ForMe.font(.semibold, size: 13))
                            .foregroundColor(ForMe.textPrimary)
                        if viewModel.sortOption != .nearest {
                            Text("• sorted by \(viewModel.sortOption.label)")
                                .font(ForMe.font(.regular, size: 13))
                                .foregroundColor(ForMe.textTertiary)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 12)
                    .padding(.bottom, 4)

                    ForEach(viewModel.visibleItems) { item in
                        Button {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
                                selectedItemId = item.id
                            }
                        } label: {
                            MapResultRow(item: item, isSelected: selectedItemId == item.id)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 80)
        }
    }

    // Wraps the popup in a NavigationLink so taps push within the Maps tab's
    // own NavigationStack (the one in MainTabView's `case .maps`). Going through
    // appState.navigationPath here would push onto the *Home* tab's stack.
    @ViewBuilder
    private func selectedPopup(for item: MapItem) -> some View {
        switch item {
        case .listing(let l):
            NavigationLink(value: l) {
                SelectedMapItemCard(item: item, onClose: closePopup)
            }
            .buttonStyle(.plain)
        case .worker(let w):
            if let userId = w.userId {
                NavigationLink(value: ProfileRoute(userId: userId)) {
                    SelectedMapItemCard(item: item, onClose: closePopup)
                }
                .buttonStyle(.plain)
            } else {
                SelectedMapItemCard(item: item, onClose: closePopup)
            }
        }
    }

    private func closePopup() {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
            selectedItemId = nil
        }
    }
}

// MARK: - Filter pill (menu trigger)

private struct FilterMenuPill: View {
    let label: String
    let leadingSystemImage: String?
    let isActive: Bool

    var body: some View {
        HStack(spacing: 6) {
            if let sys = leadingSystemImage {
                Image(systemName: sys)
                    .font(.system(size: 12, weight: .medium))
            }
            Text(label)
                .font(ForMe.font(isActive ? .semibold : .medium, size: 13))
            Image(systemName: "chevron.down")
                .font(.system(size: 10, weight: .semibold))
                .opacity(0.7)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(isActive ? ForMe.textPrimary : Color(hex: "F7F7F6"))
        .foregroundColor(isActive ? .white : ForMe.textSecondary)
        .overlay(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .stroke(isActive ? Color.clear : ForMe.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}

// MARK: - Category multi-select sheet

private struct CategoryFilterSheet: View {
    @Binding var selected: Set<String>
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(
                    columns: [GridItem(.adaptive(minimum: 100), spacing: 8)],
                    spacing: 8
                ) {
                    ForEach(ForMe.Category.allCases, id: \.self) { cat in
                        let on = selected.contains(cat.rawValue)
                        Button {
                            if on { selected.remove(cat.rawValue) }
                            else { selected.insert(cat.rawValue) }
                        } label: {
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(cat.color)
                                    .frame(width: 10, height: 10)
                                Text(cat.rawValue)
                                    .font(ForMe.font(.medium, size: 13))
                                Spacer()
                                if on {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 11, weight: .bold))
                                }
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 10)
                            .background(on ? ForMe.textPrimary : Color(hex: "F7F7F6"))
                            .foregroundColor(on ? .white : ForMe.textPrimary)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(on ? Color.clear : ForMe.border, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
            .navigationTitle("Categories")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if !selected.isEmpty {
                        Button("Clear") { selected.removeAll() }
                            .foregroundColor(ForMe.textTertiary)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
    }
}

// MARK: - Map pin

private struct MapPinView: View {
    let item: MapItem
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                Circle()
                    .fill(isSelected ? ForMe.stone900 : .white)
                    .frame(width: 36, height: 36)
                    .elevation(.level2)

                if item.isWorker {
                    Image(systemName: "person.fill")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(isSelected ? .white : ForMe.stone900)
                } else {
                    Circle()
                        .fill(ForMe.categoryColor(item.category))
                        .frame(width: 12, height: 12)
                }
            }

            Triangle()
                .fill(isSelected ? ForMe.stone900 : .white)
                .frame(width: 10, height: 6)
                .offset(y: -1)
        }
        .scaleEffect(isSelected ? 1.15 : 1.0)
        .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isSelected)
    }
}

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: rect.midX, y: rect.maxY))
            p.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
            p.closeSubpath()
        }
    }
}

// MARK: - Selected popup

private struct SelectedMapItemCard: View {
    let item: MapItem
    let onClose: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: AssetURL.resolve(item.imageSrc)) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(ForMe.stone100)
                }
            }
            .frame(width: 56, height: 56)
            .clipShape(
                item.isWorker
                    ? AnyShape(Circle())
                    : AnyShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            )

            VStack(alignment: .leading, spacing: 3) {
                Text(item.title)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(.white)
                    .lineLimit(1)

                Text(item.category)
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(.white.opacity(0.7))
                    .lineLimit(1)

                HStack(spacing: 4) {
                    if let r = item.rating, r > 0 {
                        GoldStar(size: 10)
                        Text(String(format: "%.1f", r))
                            .font(ForMe.font(.medium, size: 11))
                            .foregroundColor(.white)
                    }
                    if let loc = item.location, !loc.isEmpty {
                        if (item.rating ?? 0) > 0 {
                            Text("·").foregroundColor(.white.opacity(0.4))
                        }
                        Text(loc)
                            .font(ForMe.font(.regular, size: 11))
                            .foregroundColor(.white.opacity(0.7))
                            .lineLimit(1)
                    }
                }
            }

            Spacer()

            Button(action: onClose) {
                Image(systemName: "xmark")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white.opacity(0.7))
                    .frame(width: 28, height: 28)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)
        }
        .padding(12)
        .background(Color.black.opacity(0.85))
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .elevation(.level3)
    }
}

// MARK: - Result row

private struct MapResultRow: View {
    let item: MapItem
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: AssetURL.resolve(item.imageSrc)) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(ForMe.stone100)
                }
            }
            .frame(width: 44, height: 44)
            .clipShape(
                item.isWorker
                    ? AnyShape(Circle())
                    : AnyShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            )

            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)
                Text(item.category)
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.textSecondary)
                    .lineLimit(1)
                if let loc = item.location, !loc.isEmpty {
                    Text(loc)
                        .font(ForMe.font(.regular, size: 11))
                        .foregroundColor(ForMe.textTertiary)
                        .lineLimit(1)
                }
            }

            Spacer()

            if let r = item.rating, r > 0 {
                HStack(spacing: 3) {
                    GoldStar(size: 10)
                    Text(String(format: "%.1f", r))
                        .font(ForMe.font(.medium, size: 11))
                        .foregroundColor(ForMe.textSecondary)
                        .monospacedDigit()
                }
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 9)
        .background(isSelected ? ForMe.stone100 : Color.clear)
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(isSelected ? ForMe.borderHover : Color.clear, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

// MARK: - ViewModel

@MainActor
class MapsViewModel: ObservableObject {
    @Published var search: String = ""
    @Published var sortOption: MapSortOption = .nearest
    @Published var selectedCategories: Set<String> = []
    @Published var selectedRadius: Double? = nil
    @Published var minRating: Double? = nil

    @Published var allItems: [MapItem] = []
    @Published var isLoading = false

    var activeFilterCount: Int {
        selectedCategories.count
            + (selectedRadius != nil ? 1 : 0)
            + (minRating != nil ? 1 : 0)
    }

    var visibleItems: [MapItem] {
        let q = search.trimmingCharacters(in: .whitespaces).lowercased()
        let filtered = allItems.filter { item in
            // Drop pins without coordinates — they can't render anyway.
            guard item.lat != nil, item.lng != nil else { return false }

            if !selectedCategories.isEmpty && !selectedCategories.contains(item.category) {
                return false
            }
            if let minRating, (item.rating ?? 0) < minRating {
                return false
            }
            // Distance radius needs the user's location to evaluate; until we
            // wire CLLocationManager, treat the filter as pass-through (UI
            // still shows the chip so the page reads identically to web).
            if !q.isEmpty {
                if !item.title.lowercased().contains(q) &&
                   !item.category.lowercased().contains(q) {
                    return false
                }
            }
            return true
        }

        return filtered.sorted { a, b in
            switch sortOption {
            case .name:
                return a.title.localizedCaseInsensitiveCompare(b.title) == .orderedAscending
            case .nearest:
                // Without user location we fall back to title sort for stable
                // ordering — beats a randomized list and keeps the pill
                // labelling honest about *why* the order is what it is.
                return a.title.localizedCaseInsensitiveCompare(b.title) == .orderedAscending
            }
        }
    }

    func clearFilters() {
        selectedCategories.removeAll()
        selectedRadius = nil
        minRating = nil
    }

    func load() async {
        guard allItems.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            let resp = try await APIService.shared.getMapItems()
            var items: [MapItem] = []
            items.append(contentsOf: resp.listings.map(MapItem.listing))
            items.append(contentsOf: resp.workers.map(MapItem.worker))
            allItems = items
        } catch {
            print("[MapsView] load error: \(error)")
        }
    }
}

#Preview {
    MapsView()
        .environmentObject(AppState())
        .environmentObject(AuthViewModel())
}
