import SwiftUI

struct ListingDetailView: View {
    let listing: Listing
    @StateObject private var viewModel = ListingDetailViewModel()
    @State private var showBooking = false
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
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                HStack(spacing: 8) {
                    Button {
                        Task { await viewModel.toggleFavorite(listingId: listing.id) }
                    } label: {
                        Image(systemName: viewModel.isFavorite ? "heart.fill" : "heart")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(viewModel.isFavorite ? .red : ForMe.textPrimary)
                            .frame(width: 34, height: 34)
                            .background(.ultraThinMaterial)
                            .clipShape(Circle())
                    }
                    Button {
                        // TODO: share
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(width: 34, height: 34)
                            .background(.ultraThinMaterial)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .sheet(isPresented: $showBooking) {
            if let service = viewModel.selectedService {
                BookingView(listing: listing, service: service)
            }
        }
        .task {
            await viewModel.loadServices(for: listing.id)
        }
    }
}

// MARK: - Hero Image

private extension ListingDetailView {
    var heroSection: some View {
        Color.clear.frame(height: 20)
    }
}

// MARK: - Business Card (matches web left column)

private extension ListingDetailView {
    var businessCard: some View {
        VStack(spacing: 0) {
            // Avatar overlapping hero
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .fill(ForMe.stone200)
                }
            }
            .frame(width: 88, height: 88)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(.white, lineWidth: 3)
            )
            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)

            // Title + verification
            HStack(spacing: 6) {
                Text(listing.title)
                    .font(.system(size: 20, weight: .semibold))
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
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .padding(.top, 2)
            }

            // Open/Closed status
            operatingStatusView
                .padding(.top, 4)

            // Rating stars
            ratingView
                .padding(.top, ForMe.space3)

            // Stats row
            statsRow
                .padding(.top, ForMe.space4)

            // Description
            if let desc = listing.description, !desc.isEmpty {
                Text(desc)
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone500)
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, ForMe.space6)
                    .padding(.top, ForMe.space4)
                    .lineLimit(4)
            }

            // Action buttons
            actionButtons
                .padding(.top, ForMe.space4)
                .padding(.horizontal)
        }
        .padding(.bottom, ForMe.space4)
    }

    var operatingStatusView: some View {
        Group {
            if !storeHours.isEmpty {
                let today = todayHours
                if let hours = today {
                    HStack(spacing: 4) {
                        Circle()
                            .fill(hours.isClosed ? ForMe.statusCancelled : ForMe.statusConfirmed)
                            .frame(width: 6, height: 6)
                        Text(hours.isClosed ? "Closed" : "Open")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(hours.isClosed ? ForMe.statusCancelled : ForMe.statusConfirmed)
                        if !hours.isClosed, let close = hours.closeTime {
                            Text("· Closes \(close)")
                                .font(.system(size: 13))
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
        HStack(spacing: 3) {
            ForEach(0..<5, id: \.self) { i in
                Image(systemName: i < Int((listing.rating ?? 0).rounded()) ? "star.fill" : "star")
                    .font(.system(size: 13))
                    .foregroundColor(i < Int((listing.rating ?? 0).rounded()) ? Color(hex: "FBBF24") : ForMe.stone200)
            }
            Text("\(listing.ratingCount ?? 0)")
                .font(.system(size: 12))
                .foregroundColor(ForMe.stone400)
                .padding(.leading, 4)
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
                .font(.system(size: 12))
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
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 13)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }

            Button {
                // TODO: follow
            } label: {
                Text("Follow")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(ForMe.stone700)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 13)
                    .background(ForMe.stone50)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                            .stroke(ForMe.stone200, lineWidth: 1)
                    )
            }
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


            // Gallery
            if let gallery = listing.galleryImages, !gallery.isEmpty {
                gallerySection(images: gallery)
            }
        }
        .padding(.horizontal)
        .padding(.top, ForMe.space4)
    }

    var servicesSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            SectionHeader(title: "Services")

            if viewModel.isLoading && services.isEmpty {
                ProgressView().frame(maxWidth: .infinity).padding()
            } else if services.isEmpty {
                Text("No services listed")
                    .font(.system(size: 14))
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
        VStack(spacing: ForMe.space3) {
            Text("Team")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                ForEach(employees) { employee in
                    VStack(spacing: 10) {
                        DynamicAvatar(
                            name: employee.fullName,
                            imageUrl: employee.user?.image,
                            size: .large
                        )
                        VStack(spacing: 3) {
                            Text(employee.fullName)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(ForMe.textPrimary)
                                .lineLimit(1)
                            if let title = employee.jobTitle {
                                Text(title)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(ForMe.textTertiary)
                                    .lineLimit(1)
                            }
                        }
                    }
                }
            }
        }
    }

    var storeHoursSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            SectionHeader(title: "Hours")

            VStack(spacing: 8) {
                ForEach(storeHours) { hour in
                    HStack {
                        Text(hour.shortName)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(width: 40, alignment: .leading)

                        if hour.isClosed {
                            Text("Closed")
                                .font(.system(size: 13))
                                .foregroundColor(ForMe.statusCancelled)
                        } else if let open = hour.openTime, let close = hour.closeTime {
                            Text("\(open) – \(close)")
                                .font(.system(size: 13))
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
        VStack(spacing: ForMe.space3) {
            Text("Gallery")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 1), count: 3), spacing: 1) {
                ForEach(images, id: \.self) { imageUrl in
                    AsyncImage(url: URL(string: imageUrl)) { phase in
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
        }
        .padding(.horizontal, -ForMe.space4) // bleed edge to edge
    }
}

// MARK: - Service Row (matches web ServiceCard)

struct ServiceRow: View {
    let service: Service
    let onBook: () -> Void

    private var priceInt: Int { Int(service.price) }

    var body: some View {
        Button(action: onBook) {
            ZStack(alignment: .topTrailing) {
                // Price watermark
                Text("$\(priceInt)")
                    .font(.system(size: 64, weight: .black, design: .rounded))
                    .foregroundColor(ForMe.stone100.opacity(0.8))
                    .offset(x: 8, y: -8)

                // Content
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 20)

                    Text(service.serviceName)
                        .font(.system(size: 17, weight: .black))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(3)
                        .tracking(-0.2)

                    if let duration = service.duration {
                        Text(service.formattedDuration)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(ForMe.stone400)
                            .padding(.top, 4)
                    }

                    Spacer()

                    // Bottom row — price + arrow
                    HStack(alignment: .bottom) {
                        Text("$\(priceInt)")
                            .font(.system(size: 24, weight: .black, design: .rounded))
                            .foregroundColor(ForMe.textPrimary)

                        Spacer()

                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(ForMe.stone300)
                            .padding(.bottom, 4)
                    }
                }
                .padding(ForMe.space5)
            }
            .frame(height: 160)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(
                    colors: [.white, ForMe.stone50.opacity(0.8)],
                    startPoint: .top,
                    endPoint: .bottom
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
