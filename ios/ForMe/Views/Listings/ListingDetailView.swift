import SwiftUI

struct ListingDetailView: View {
    let listing: Listing
    @StateObject private var viewModel = ListingDetailViewModel()
    @State private var showBooking = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header Image
                AsyncImage(url: URL(string: listing.imageSrc ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color(.systemGray5))
                }
                .frame(height: 250)
                .clipped()

                VStack(alignment: .leading, spacing: 20) {
                    // Title and rating
                    VStack(alignment: .leading, spacing: 8) {
                        Text(listing.title)
                            .font(.title.bold())

                        HStack(spacing: 16) {
                            if let rating = listing.rating, let count = listing.ratingCount {
                                HStack(spacing: 4) {
                                    Image(systemName: "star.fill")
                                        .foregroundColor(.yellow)
                                    Text(String(format: "%.1f", rating))
                                        .fontWeight(.semibold)
                                    Text("(\(count) reviews)")
                                        .foregroundColor(.secondary)
                                }
                            }

                            Text(listing.category.rawValue)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 4)
                                .background(Color(.systemGray6))
                                .cornerRadius(16)
                        }
                        .font(.subheadline)
                    }

                    Divider()

                    // Location & Contact
                    VStack(alignment: .leading, spacing: 12) {
                        if let location = listing.location {
                            HStack(spacing: 12) {
                                Image(systemName: "mappin.circle.fill")
                                    .foregroundColor(.red)
                                Text(location)
                            }
                        }

                        if let address = listing.address {
                            HStack(spacing: 12) {
                                Image(systemName: "building.2")
                                    .foregroundColor(.secondary)
                                Text(address)
                                    .foregroundColor(.secondary)
                            }
                        }

                        if let phone = listing.phoneNumber {
                            HStack(spacing: 12) {
                                Image(systemName: "phone.fill")
                                    .foregroundColor(.green)
                                Text(phone)
                            }
                        }
                    }
                    .font(.subheadline)

                    if let description = listing.description, !description.isEmpty {
                        Divider()

                        VStack(alignment: .leading, spacing: 8) {
                            Text("About")
                                .font(.headline)
                            Text(description)
                                .foregroundColor(.secondary)
                        }
                    }

                    Divider()

                    // Services
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Services")
                            .font(.headline)

                        if let services = listing.services, !services.isEmpty {
                            ForEach(services) { service in
                                ServiceRow(service: service) {
                                    viewModel.selectedService = service
                                    showBooking = true
                                }
                            }
                        } else if viewModel.isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .padding()
                        } else {
                            Text("No services listed")
                                .foregroundColor(.secondary)
                                .padding()
                        }
                    }

                    // Store Hours
                    if let hours = listing.storeHours, !hours.isEmpty {
                        Divider()

                        VStack(alignment: .leading, spacing: 12) {
                            Text("Hours")
                                .font(.headline)

                            ForEach(hours) { hour in
                                HStack {
                                    Text(hour.dayOfWeek.name)
                                        .frame(width: 100, alignment: .leading)

                                    if hour.isClosed {
                                        Text("Closed")
                                            .foregroundColor(.secondary)
                                    } else if let open = hour.openTime, let close = hour.closeTime {
                                        Text("\(open) - \(close)")
                                    }
                                }
                                .font(.subheadline)
                            }
                        }
                    }

                    // Gallery
                    if let gallery = listing.galleryImages, !gallery.isEmpty {
                        Divider()

                        VStack(alignment: .leading, spacing: 12) {
                            Text("Gallery")
                                .font(.headline)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(gallery, id: \.self) { imageUrl in
                                        AsyncImage(url: URL(string: imageUrl)) { image in
                                            image
                                                .resizable()
                                                .aspectRatio(contentMode: .fill)
                                        } placeholder: {
                                            Rectangle()
                                                .fill(Color(.systemGray5))
                                        }
                                        .frame(width: 120, height: 120)
                                        .clipShape(RoundedRectangle(cornerRadius: 8))
                                    }
                                }
                            }
                        }
                    }
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    Task { await viewModel.toggleFavorite(listingId: listing.id) }
                } label: {
                    Image(systemName: viewModel.isFavorite ? "heart.fill" : "heart")
                        .foregroundColor(viewModel.isFavorite ? .red : .primary)
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

struct ServiceRow: View {
    let service: Service
    let onBook: () -> Void

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(service.serviceName)
                    .font(.subheadline.bold())

                if let duration = service.duration {
                    Text("\(duration) min")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            Text("$\(service.price, specifier: "%.0f")")
                .font(.subheadline.bold())

            Button("Book") {
                onBook()
            }
            .font(.subheadline.bold())
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.primary)
            .cornerRadius(20)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
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
