import SwiftUI

struct ListingDetailView: View {
    let listing: Listing
    @StateObject private var viewModel = ListingDetailViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showBooking = false
    @State private var showQR = false
    @State private var showReviewWrite = false
    @Environment(\.dismiss) private var dismiss

    private var services: [Service] {
        listing.services ?? viewModel.services
    }

    private var employees: [Employee] {
        listing.employees ?? []
    }

    private var storeHours: [StoreHours] {
        listing.storeHours ?? []
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                heroSection
                businessCard
                contentSections
            }
            .padding(.bottom, 100)
        }
        .background(ForMe.background)
        // Hide the system nav bar entirely — iOS 17+ toolbars wrap Menu in a
        // translucent capsule/chrome that can't be suppressed with buttonStyle
        // or menuStyle. A plain overlay HStack gives pixel parity with the
        // web's absolute-positioned top row and leaves us full control over
        // geometry and backgrounds.
        .navigationBarBackButtonHidden(true)
        .toolbar(.hidden, for: .navigationBar)
        .overlay(alignment: .top) {
            topBar
        }
        .sheet(isPresented: $showBooking) {
            if let service = viewModel.selectedService {
                BookingView(listing: listing, service: service)
            }
        }
        .sheet(isPresented: $showQR) {
            ListingQRSheet(listing: listing)
        }
        .sheet(isPresented: $showReviewWrite) {
            ReviewWriteSheet(
                title: listing.title,
                targetListingId: listing.id
            ) { review in
                viewModel.insert(review: review)
            }
        }
        .task {
            await viewModel.loadServices(for: listing.id)
            await viewModel.loadReviews(for: listing.id)
        }
    }

    private var topBar: some View {
        HStack {
            Button {
                dismiss()
            } label: {
                HugeIcon(paths: HugeIcon.arrowLeftPaths, size: 20, color: ForMe.stone500)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(.ultraThinMaterial))
                    .overlay(Circle().stroke(ForMe.stone200.opacity(0.6), lineWidth: 1))
                    .elevation(.level1)
            }
            .buttonStyle(.plain)

            Spacer()

            Menu {
                Button {
                    showQR = true
                } label: {
                    Label("View QR Code", systemImage: "qrcode")
                }
                if let ownerId = listing.userId {
                    Button {
                        Haptics.confirm()
                        Task { await viewModel.toggleFollow(userId: ownerId) }
                    } label: {
                        Label(
                            viewModel.isFollowing ? "Following" : "Follow",
                            systemImage: viewModel.isFollowing ? "person.badge.minus" : "person.badge.plus"
                        )
                    }
                }
                Button {
                    Haptics.confirm()
                    Task { await viewModel.toggleFavorite(listingId: listing.id) }
                } label: {
                    Label(
                        viewModel.isFavorite ? "Favorited" : "Favorite",
                        systemImage: viewModel.isFavorite ? "heart.fill" : "heart"
                    )
                }
                Button {
                    showReviewWrite = true
                } label: {
                    Label("Add Review", systemImage: "star")
                }
                Divider()
                Button {
                    shareListing()
                } label: {
                    Label("Share", systemImage: "square.and.arrow.up")
                }
            } label: {
                HugeMoreVertical(size: 20, color: ForMe.stone500)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(.ultraThinMaterial))
                    .overlay(Circle().stroke(ForMe.stone200.opacity(0.6), lineWidth: 1))
                    .elevation(.level1)
            }
            .menuOrder(.fixed)
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 12)
        .padding(.top, 8)
    }
}

// MARK: - Hero Image

private extension ListingDetailView {
    var heroSection: some View {
        Color.clear.frame(height: 20)
    }

    func shareListing() {
        let text = "\(listing.title) on ForMe"
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }
}

// MARK: - Business Card (matches web left column)

private extension ListingDetailView {
    var businessCard: some View {
        VStack(spacing: 0) {
            // Avatar overlapping hero
            AsyncImage(url: AssetURL.resolve(listing.imageSrc)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .fill(ForMe.stone200)
                }
            }
            .frame(width: 96, height: 96)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(.white, lineWidth: 3)
            )
            .elevation(.level2)
            .padding(.bottom, 12)

            // Title + verification
            HStack(spacing: 6) {
                Text(listing.title)
                    .font(ForMe.font(.semibold, size: 20))
                    .foregroundColor(ForMe.textPrimary)

                if listing.user?.verificationStatus == "verified" {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 16))
                        .foregroundColor(ForMe.accent)
                }
            }
            .padding(.top, ForMe.space2)

            // Location
            if let location = listing.address ?? listing.location {
                Text(location)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone400)
                    .padding(.top, 2)
            }

            // Open/Closed status
            operatingStatusView
                .padding(.top, 4)

            // Rating stars
            ratingView
                .padding(.top, ForMe.space3)
                .padding(.bottom, ForMe.space2)

            // Stats row
            statsRow
                .padding(.top, ForMe.space4)

            // Description
            if let desc = listing.description, !desc.isEmpty {
                Text(desc)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone500)
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, ForMe.space6)
                    .padding(.top, 28)
                    .lineLimit(4)
            }

            // Action buttons
            actionButtons
                .padding(.top, 28)
                .padding(.horizontal)
        }
        .padding(.bottom, ForMe.space4)
    }

    var operatingStatusView: some View {
        Group {
            if !storeHours.isEmpty {
                let today = todayHours
                if let hours = today {
                    HStack(spacing: 0) {
                        Text(hours.isClosed ? "Closed" : "Open")
                            .font(ForMe.font(.medium, size: 13))
                            .foregroundColor(hours.isClosed ? ForMe.statusCancelled : ForMe.statusConfirmed)
                        if !hours.isClosed, let close = hours.closeTime {
                            Text(" · Closes \(close)")
                                .font(ForMe.font(.regular, size: 13))
                                .foregroundColor(ForMe.stone400)
                        }
                    }
                }
            }
        }
    }

    var todayHours: StoreHours? {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        let today = formatter.string(from: Date())
        return storeHours.first { $0.dayOfWeek.lowercased() == today.lowercased() }
    }

    var ratingView: some View {
        // Mirrors web's ListingHead rating row: 14pt stars, same SVG path for
        // both filled (gold gradient) and empty (#e5e7eb) positions, with the
        // total review count in stone-400 to the right.
        HStack(spacing: 4) {
            ForEach(0..<5, id: \.self) { i in
                if i < Int((listing.rating ?? 0).rounded()) {
                    GoldStar(size: 14)
                } else {
                    GoldStar(size: 14, fillColor: Color(hex: "e5e7eb"))
                }
            }
            Text("\(listing.ratingCount ?? 0)")
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.stone400)
                .padding(.leading, 6)
        }
    }

    var statsRow: some View {
        HStack(spacing: 0) {
            statItem(value: "\(services.count)", label: "services")
            Divider().frame(height: 32)
            statItem(value: "\(listing.followers?.count ?? 0)", label: "followers")
            Divider().frame(height: 32)
            statItem(value: "\(listing.ratingCount ?? 0)", label: "reviews")
        }
        .padding(.horizontal, ForMe.space6)
    }

    func statItem(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(ForMe.textPrimary)
            Text(label)
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.stone400)
        }
        .frame(maxWidth: .infinity)
    }

    var actionButtons: some View {
        HStack(spacing: 10) {
            Button {
                if let first = services.first {
                    viewModel.selectedService = first
                    showBooking = true
                }
            } label: {
                Text("Reserve")
                    .font(ForMe.font(.semibold, size: 13))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }

            Button {
                if let ownerId = listing.userId {
                    Haptics.confirm()
                    Task { await viewModel.toggleFollow(userId: ownerId) }
                }
            } label: {
                Text(viewModel.isFollowing ? "Following" : "Follow")
                    .font(ForMe.font(.semibold, size: 13))
                    .foregroundColor(viewModel.isFollowing ? .white : ForMe.stone700)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(viewModel.isFollowing ? ForMe.stone700 : ForMe.stone50)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                            .stroke(viewModel.isFollowing ? Color.clear : ForMe.stone200, lineWidth: 1)
                    )
            }
            .disabled(listing.userId == nil)
        }
    }
}

// MARK: - Content Sections (matches web right column)

private extension ListingDetailView {
    var contentSections: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Services
            servicesSection

            // Team / Employees
            if !employees.isEmpty {
                employeesSection
            }

            // Reviews
            reviewsSection

            // Gallery
            if let gallery = listing.galleryImages, !gallery.isEmpty {
                gallerySection(images: gallery)
            }
        }
        .padding(.horizontal)
        .padding(.top, ForMe.space4)
    }

    var reviewsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            HStack(alignment: .firstTextBaseline) {
                SectionHeader(title: "Reviews")
                Spacer()
                Button {
                    showReviewWrite = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                            .font(.system(size: 11, weight: .semibold))
                        Text("Write")
                            .font(ForMe.font(.semibold, size: 12))
                    }
                    .foregroundColor(ForMe.textPrimary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(ForMe.stone100)
                    .clipShape(Capsule())
                }
                .buttonStyle(.plain)
            }

            if viewModel.reviews.isEmpty {
                HStack {
                    Spacer()
                    VStack(spacing: 6) {
                        Image(systemName: "star")
                            .font(.system(size: 24))
                            .foregroundColor(ForMe.stone300)
                        Text("No reviews yet")
                            .font(ForMe.font(.medium, size: 13))
                            .foregroundColor(ForMe.textTertiary)
                        Text("Be the first to review this listing.")
                            .font(ForMe.font(.regular, size: 12))
                            .foregroundColor(ForMe.textTertiary)
                    }
                    .padding(.vertical, ForMe.space5)
                    Spacer()
                }
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: ForMe.space3) {
                        ForEach(Array(viewModel.reviews.enumerated()), id: \.element.id) { index, review in
                            ReviewCardView(
                                review: review,
                                currentUserId: authViewModel.currentUser?.id
                            )
                            .staggeredFadeIn(index: index)
                        }
                    }
                    .padding(.vertical, 4)
                }
                .scrollClipDisabled()
            }
        }
    }

    var servicesSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            SectionHeader(title: "Book A Service")

            if viewModel.isLoading && services.isEmpty {
                ProgressView().frame(maxWidth: .infinity).padding()
            } else if services.isEmpty {
                Text("No services listed")
                    .font(ForMe.font(.regular, size: 14))
                    .foregroundColor(ForMe.textTertiary)
                    .padding()
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10)
                ], spacing: 10) {
                    ForEach(Array(services.enumerated()), id: \.element.id) { index, service in
                        ServiceRow(service: service) {
                            viewModel.selectedService = service
                            showBooking = true
                        }
                        .staggeredFadeIn(index: index)
                    }
                }
            }
        }
    }

    var employeesSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            Text("Meet Our Team")
                .font(ForMe.font(.bold, size: 18))
                .foregroundColor(ForMe.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Match Discover's employee layout: vertical list of ProviderRow,
            // one per row, keyed off the same CompactUser + Listing shape.
            LazyVStack(spacing: 4) {
                ForEach(employees) { employee in
                    if let user = employee.user {
                        ProviderRow(user: user, listing: listing, jobTitle: employee.jobTitle)
                    }
                }
            }
        }
    }

    var storeHoursSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            SectionHeader(title: "When We're Open")

            VStack(spacing: 8) {
                ForEach(storeHours) { hour in
                    HStack {
                        Text(hour.shortName)
                            .font(ForMe.font(.medium, size: 13))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(width: 40, alignment: .leading)

                        if hour.isClosed {
                            Text("Closed")
                                .font(ForMe.font(.regular, size: 13))
                                .foregroundColor(ForMe.statusCancelled)
                        } else if let open = hour.openTime, let close = hour.closeTime {
                            Text("\(open) – \(close)")
                                .font(ForMe.font(.regular, size: 13))
                                .foregroundColor(ForMe.stone500)
                        }

                        Spacer()
                    }
                }
            }
            .forMeCard()
        }
    }

    func gallerySection(images: [String]) -> some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            Text("A Peek Inside")
                .font(ForMe.font(.bold, size: 18))
                .foregroundColor(ForMe.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Only the grid bleeds edge-to-edge — headline stays at the same
            // horizontal inset as the other section titles.
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 1), count: 3), spacing: 1) {
                ForEach(images, id: \.self) { imageUrl in
                    AsyncImage(url: AssetURL.resolve(imageUrl)) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().aspectRatio(contentMode: .fill)
                        default:
                            Rectangle().fill(ForMe.stone100)
                        }
                    }
                    .frame(minHeight: 0)
                    .aspectRatio(1, contentMode: .fill)
                    .clipped()
                }
            }
            .padding(.horizontal, -ForMe.space4)
        }
    }
}

// MARK: - Service Row (matches web ServiceCard)

struct ServiceRow: View {
    let service: Service
    let onBook: () -> Void

    private var priceInt: Int { Int(service.price) }

    // Half-height port of the web's ServiceCard solidBackground+compact —
    // same gradient, border, watermark and bottom row, scaled proportionally
    // to 90pt so it reads like the web card but takes half the vertical room.
    var body: some View {
        Button(action: onBook) {
            ZStack {
                // Ghosted price watermark — explicitly aligned to top-right so it
                // doesn't drag the VStack with it (that was clipping the name).
                Text("\(priceInt)")
                    .font(ForMe.font(.bold, size: 40))
                    .foregroundColor(ForMe.stone100.opacity(0.8))
                    .tracking(-1)
                    .lineLimit(1)
                    .offset(x: 4, y: -8)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                    .allowsHitTesting(false)

                VStack(alignment: .leading, spacing: 0) {
                    Text(service.serviceName)
                        .font(ForMe.font(.bold, size: 14))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)
                        .tracking(-0.2)
                        .multilineTextAlignment(.leading)
                        .padding(.trailing, 22) // clear the watermark

                    // Web falls back to "60 min" when there's no duration — match that
                    // so every card has a meta line. Georgia italic 11pt stone-400,
                    // same treatment as ListingCard's category.
                    Text(service.duration == nil ? "60 min" : service.formattedDuration)
                        .font(.custom("Georgia", size: 11).italic())
                        .foregroundColor(ForMe.stone400)
                        .padding(.top, 2)

                    Spacer(minLength: 0)

                    HStack(alignment: .bottom) {
                        Text("$\(priceInt)")
                            .font(ForMe.font(.bold, size: 18))
                            .foregroundColor(ForMe.textPrimary)
                            .monospacedDigit()

                        Spacer()

                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 12, weight: .regular))
                            .foregroundColor(ForMe.stone300)
                    }
                }
                .padding(16)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
            .frame(height: 110)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(
                    colors: [.white, ForMe.stone50.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.stone200.opacity(0.8), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Previews

private let previewListing = Listing(
    id: "1",
    title: "John's Place",
    description: "Premium barbershop specializing in fresh cuts, clean fades, and classic grooming. Walk-ins welcome.",
    imageSrc: nil,
    category: "Barber",
    location: "Bullhead City, Arizona",
    address: "123 Main St, Bullhead City, AZ",
    services: [
        Service(id: "1", serviceName: "Haircut", price: 35, duration: 45, listingId: "1"),
        Service(id: "2", serviceName: "Beard Trim", price: 15, duration: 20, listingId: "1"),
        Service(id: "3", serviceName: "Hot Towel Shave", price: 25, duration: 30, listingId: "1"),
    ],
    employees: [
        Employee(id: "e1", fullName: "Marcus J.", jobTitle: "Senior Barber"),
        Employee(id: "e2", fullName: "Tim D.", jobTitle: "Barber"),
    ],
    storeHours: [
        StoreHours(id: "h1", dayOfWeek: "Monday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false),
        StoreHours(id: "h2", dayOfWeek: "Tuesday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false),
        StoreHours(id: "h3", dayOfWeek: "Wednesday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false),
        StoreHours(id: "h4", dayOfWeek: "Thursday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false),
        StoreHours(id: "h5", dayOfWeek: "Friday", openTime: "9:00 AM", closeTime: "7:00 PM", isClosed: false),
        StoreHours(id: "h6", dayOfWeek: "Saturday", openTime: "10:00 AM", closeTime: "4:00 PM", isClosed: false),
        StoreHours(id: "h7", dayOfWeek: "Sunday", isClosed: true),
    ],
    followers: ["a", "b", "c"],
    rating: 4.8,
    ratingCount: 124,
    userId: "1"
)

#Preview("Full Listing") {
    NavigationStack {
        ListingDetailView(listing: previewListing)
    }
}

#Preview("Service Cards") {
    LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
        ServiceRow(service: Service(id: "1", serviceName: "Haircut", price: 35, duration: 45, listingId: "1"), onBook: {})
        ServiceRow(service: Service(id: "2", serviceName: "Beard Trim", price: 15, duration: 20, listingId: "1"), onBook: {})
        ServiceRow(service: Service(id: "3", serviceName: "Hot Towel Shave", price: 25, duration: 30, listingId: "1"), onBook: {})
    }
    .padding()
    .background(ForMe.background)
}

#Preview("Minimal Listing") {
    NavigationStack {
        ListingDetailView(listing: Listing(
            id: "2",
            title: "Trixie Nails",
            category: "Nails",
            location: "Pasadena, California",
            userId: "2"
        ))
    }
}
