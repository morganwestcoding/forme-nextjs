import SwiftUI

struct PropertiesView: View {
    @StateObject private var viewModel = PropertiesViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    @State private var listingToDelete: Listing?
    @State private var showCreateListing = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Header
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 10) {
                            Text("My Listings")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(ForMe.textPrimary)

                            Text("\(viewModel.listings.count)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(ForMe.stone500)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(ForMe.stone100)
                                .clipShape(Capsule())
                        }
                        Text("Manage your businesses")
                            .font(.system(size: 13))
                            .foregroundColor(ForMe.stone400)
                    }

                    Spacer()

                    Button {
                        showCreateListing = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 36, height: 36)
                            .background(ForMe.stone900)
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal)
                .padding(.top, ForMe.space3)
                .padding(.bottom, ForMe.space5)

                // Content
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if viewModel.listings.isEmpty {
                    emptyState
                } else {
                    VStack(spacing: 30) {
                        ForEach(viewModel.listings) { listing in
                            PropertyCard(
                                listing: listing,
                                onEdit: {
                                    // TODO: open ListingFlow in edit mode
                                },
                                onDelete: {
                                    listingToDelete = listing
                                }
                            )
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.bottom, 100)
        }
        .background(ForMe.background)
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .confirmationDialog(
            "Delete this listing?",
            isPresented: .init(
                get: { listingToDelete != nil },
                set: { if !$0 { listingToDelete = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button("Delete", role: .destructive) {
                if let listing = listingToDelete {
                    Task { await viewModel.deleteListing(id: listing.id) }
                }
                listingToDelete = nil
            }
            Button("Cancel", role: .cancel) {
                listingToDelete = nil
            }
        }
        .task {
            await viewModel.loadListings()
        }
        .refreshable {
            await viewModel.loadListings()
        }
    }

    var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "square.grid.2x2")
                .font(.system(size: 48))
                .foregroundColor(ForMe.stone300)

            VStack(spacing: 6) {
                Text("No listings yet")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                Text("Create your first listing to start accepting bookings")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .multilineTextAlignment(.center)
            }

            Button {
                showCreateListing = true
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "plus")
                        .font(.system(size: 13, weight: .semibold))
                    Text("Create Listing")
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, ForMe.space5)
                .padding(.vertical, 12)
                .background(ForMe.stone900)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 80)
    }
}

// MARK: - Property Card

struct PropertyCard: View {
    let listing: Listing
    let onEdit: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image with action overlay
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
                                    .font(.system(size: 28))
                                    .foregroundColor(ForMe.stone300)
                            )
                    }
                }
                .frame(height: 200)
                .frame(maxWidth: .infinity)
                .clipped()

                // Edit + Delete buttons
                VStack(spacing: 8) {
                    Button(action: onEdit) {
                        Image(systemName: "pencil")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(width: 36, height: 36)
                            .background(.white)
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                    }
                    Button(action: onDelete) {
                        Image(systemName: "trash")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.statusCancelled)
                            .frame(width: 36, height: 36)
                            .background(.white)
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                    }
                }
                .padding(ForMe.space4)
            }
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))

            // Info
            HStack(alignment: .top) {
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

                        Text(listing.category)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(ForMe.textTertiary)
                    }

                    HStack(spacing: 12) {
                        statBadge(label: "\(listing.services?.count ?? 0)", suffix: "services")
                        statBadge(label: "\(listing.employees?.count ?? 0)", suffix: "team")
                        statBadge(label: "\(listing.followers?.count ?? 0)", suffix: "followers")
                    }
                    .padding(.top, 4)
                }
                Spacer()
            }
            .padding(.vertical, 14)
        }
    }

    func statBadge(label: String, suffix: String) -> some View {
        HStack(spacing: 3) {
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(ForMe.textPrimary)
            Text(suffix)
                .font(.system(size: 11))
                .foregroundColor(ForMe.stone400)
        }
    }
}

#Preview {
    NavigationStack {
        PropertiesView()
            .environmentObject(AuthViewModel())
            .environmentObject(AppState())
    }
}
