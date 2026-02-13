import SwiftUI

struct ListingDetailView: View {
    let listing: Listing
    @StateObject private var viewModel = ListingDetailViewModel()
    @State private var showBooking = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Hero Image
                ZStack(alignment: .bottom) {
                    AsyncImage(url: URL(string: listing.imageSrc ?? "")) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [ForMe.categoryColor(listing.category.rawValue).opacity(0.3), ForMe.cardBottom],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                Image(systemName: listing.category.icon)
                                    .font(.system(size: 48))
                                    .foregroundColor(ForMe.categoryColor(listing.category.rawValue).opacity(0.5))
                            )
                    }
                    .frame(height: 300)
                    .clipped()

                    // Bottom gradient fade
                    LinearGradient(
                        colors: [.clear, ForMe.background],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 80)
                }

                // Info Card
                VStack(alignment: .leading, spacing: 20) {
                    // Title + badge + category
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 8) {
                            Text(listing.title)
                                .font(.title2.bold())
                                .foregroundColor(ForMe.textPrimary)

                            if listing.user?.verificationStatus == .verified {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundColor(ForMe.accent)
                                    .font(.body)
                            }
                        }

                        HStack(spacing: 12) {
                            // Category badge
                            Text(listing.category.rawValue)
                                .font(.caption.weight(.medium))
                                .foregroundColor(ForMe.categoryColor(listing.category.rawValue))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(ForMe.categoryColor(listing.category.rawValue).opacity(0.1))
                                .cornerRadius(8)

                            if let location = listing.location {
                                HStack(spacing: 4) {
                                    Image(systemName: "mappin")
                                        .font(.caption2)
                                    Text(location)
                                }
                                .font(.caption)
                                .foregroundColor(ForMe.textSecondary)
                            }

                            if let rating = listing.rating, let count = listing.ratingCount {
                                HStack(spacing: 3) {
                                    ForEach(0..<5, id: \.self) { i in
                                        Image(systemName: i < Int(rating.rounded()) ? "star.fill" : "star")
                                            .font(.caption2)
                                            .foregroundColor(.yellow)
                                    }
                                    Text("(\(count))")
                                        .font(.caption)
                                        .foregroundColor(ForMe.textTertiary)
                                }
                            }
                        }
                    }
                    .staggeredFadeIn(index: 0)

                    // Reserve button
                    Button {
                        if let firstService = listing.services?.first ?? viewModel.services.first {
                            viewModel.selectedService = firstService
                            showBooking = true
                        }
                    } label: {
                        Text("Reserve")
                    }
                    .buttonStyle(ForMeAccentButtonStyle())
                    .staggeredFadeIn(index: 1)

                    // Location & Contact card
                    VStack(alignment: .leading, spacing: 12) {
                        if let location = listing.location {
                            HStack(spacing: 12) {
                                Image(systemName: "mappin.circle.fill")
                                    .foregroundColor(ForMe.accent)
                                Text(location)
                                    .foregroundColor(ForMe.textPrimary)
                            }
                        }

                        if let address = listing.address {
                            HStack(spacing: 12) {
                                Image(systemName: "building.2")
                                    .foregroundColor(ForMe.textTertiary)
                                Text(address)
                                    .foregroundColor(ForMe.textSecondary)
                            }
                        }

                        if let phone = listing.phoneNumber {
                            HStack(spacing: 12) {
                                Image(systemName: "phone.fill")
                                    .foregroundColor(ForMe.statusConfirmed)
                                Text(phone)
                                    .foregroundColor(ForMe.textPrimary)
                            }
                        }
                    }
                    .font(.subheadline)
                    .forMeCard()
                    .staggeredFadeIn(index: 2)

                    // About
                    if let description = listing.description, !description.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("About")
                                .font(.headline)
                                .foregroundColor(ForMe.textPrimary)
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(ForMe.textSecondary)
                                .lineSpacing(4)
                        }
                        .staggeredFadeIn(index: 3)
                    }

                    // Services
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Services")
                            .font(.headline)
                            .foregroundColor(ForMe.textPrimary)

                        if let services = listing.services, !services.isEmpty {
                            ForEach(Array(services.enumerated()), id: \.element.id) { index, service in
                                ServiceRow(service: service) {
                                    viewModel.selectedService = service
                                    showBooking = true
                                }
                                .staggeredFadeIn(index: index + 4)
                            }
                        } else if viewModel.isLoading {
                            ForMeLoader(size: .small)
                                .frame(maxWidth: .infinity)
                                .padding()
                        } else if !viewModel.services.isEmpty {
                            ForEach(Array(viewModel.services.enumerated()), id: \.element.id) { index, service in
                                ServiceRow(service: service) {
                                    viewModel.selectedService = service
                                    showBooking = true
                                }
                                .staggeredFadeIn(index: index + 4)
                            }
                        } else {
                            Text("No services listed")
                                .font(.subheadline)
                                .foregroundColor(ForMe.textTertiary)
                                .padding()
                        }
                    }

                    // Store Hours
                    if let hours = listing.storeHours, !hours.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Hours")
                                .font(.headline)
                                .foregroundColor(ForMe.textPrimary)

                            VStack(spacing: 8) {
                                ForEach(hours) { hour in
                                    HStack {
                                        Text(hour.dayName)
                                            .font(.subheadline)
                                            .foregroundColor(ForMe.textPrimary)
                                            .frame(width: 100, alignment: .leading)

                                        if hour.isClosed {
                                            Text("Closed")
                                                .font(.subheadline)
                                                .foregroundColor(ForMe.statusCancelled)
                                        } else if let open = hour.openTime, let close = hour.closeTime {
                                            Text("\(open) - \(close)")
                                                .font(.subheadline)
                                                .foregroundColor(ForMe.statusConfirmed)
                                        }

                                        Spacer()
                                    }
                                }
                            }
                            .forMeCard()
                        }
                    }

                    // Gallery
                    if let gallery = listing.galleryImages, !gallery.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Gallery")
                                .font(.headline)
                                .foregroundColor(ForMe.textPrimary)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 10) {
                                    ForEach(gallery, id: \.self) { imageUrl in
                                        AsyncImage(url: URL(string: imageUrl)) { image in
                                            image
                                                .resizable()
                                                .aspectRatio(contentMode: .fill)
                                        } placeholder: {
                                            RoundedRectangle(cornerRadius: 10)
                                                .fill(ForMe.cardBottom)
                                        }
                                        .frame(width: 120, height: 120)
                                        .clipShape(RoundedRectangle(cornerRadius: 10))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(ForMe.border, lineWidth: 1)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 24)
            }
        }
        .background(ForMe.background)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    Task { await viewModel.toggleFavorite(listingId: listing.id) }
                } label: {
                    Image(systemName: viewModel.isFavorite ? "heart.fill" : "heart")
                        .foregroundColor(viewModel.isFavorite ? .red : ForMe.textPrimary)
                        .padding(8)
                        .background(.ultraThinMaterial)
                        .clipShape(Circle())
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

// MARK: - Service Row

struct ServiceRow: View {
    let service: Service
    let onBook: () -> Void

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(service.serviceName)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(ForMe.textPrimary)

                if let duration = service.duration {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text("\(duration) min")
                    }
                    .font(.caption)
                    .foregroundColor(ForMe.textSecondary)
                }
            }

            Spacer()

            Text("$\(service.price, specifier: "%.0f")")
                .font(.subheadline.bold())
                .foregroundColor(ForMe.textPrimary)

            Button("Book") {
                onBook()
            }
            .font(.subheadline.bold())
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(ForMe.accent)
            .cornerRadius(20)
        }
        .forMeCard()
    }
}

#Preview {
    NavigationStack {
        ListingDetailView(listing: Listing(
            id: "1",
            title: "Sample Salon",
            description: "A great salon",
            category: .hair,
            userId: "1"
        ))
    }
}
