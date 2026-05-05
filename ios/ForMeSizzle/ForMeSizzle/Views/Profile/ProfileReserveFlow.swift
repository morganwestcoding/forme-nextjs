import SwiftUI

// Reserve entry point launched from another user's profile.
//
// If the profile owner works at multiple listings, ask which one first;
// otherwise hand off straight to BookingView with the employee fixed to the
// profile owner. BookingView itself always shows a multi-select services step,
// so we no longer pick a single service here — that lives one screen later
// where the user can pick more than one.
struct ProfileReserveFlow: View {
    let profileUser: User
    let listings: [Listing]
    let services: [Service]

    @Environment(\.dismiss) private var dismiss
    @State private var selectedListing: Listing?

    private var bookableListings: [Listing] {
        listings.filter { listing in
            (listing.employees?.contains { $0.userId == profileUser.id } ?? false)
                && services.contains { $0.listingId == listing.id }
        }
    }

    private var employeeForSelectedListing: Employee? {
        selectedListing?.employees?.first { $0.userId == profileUser.id }
    }

    private var servicesForSelectedListing: [Service] {
        guard let listing = selectedListing else { return [] }
        return services.filter { $0.listingId == listing.id }
    }

    // Re-attach the scoped services to the listing so BookingView's services
    // step has them on hand without an extra fetch round trip. Only needed
    // when the embedded `listing.services` is empty (e.g. profile bundle).
    private func listingWithServices(_ listing: Listing) -> Listing {
        var out = listing
        if (out.services?.isEmpty ?? true) {
            out.services = servicesForSelectedListing
        }
        return out
    }

    var body: some View {
        if let listing = selectedListing,
           let employee = employeeForSelectedListing {
            BookingView(
                listing: listingWithServices(listing),
                fixedEmployee: employee
            )
        } else {
            NavigationStack {
                listingStep
                    .navigationTitle("Select Shop")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button {
                                dismiss()
                            } label: {
                                Image(systemName: "xmark")
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundColor(ForMe.textPrimary)
                            }
                        }
                    }
                    .background(ForMe.background)
            }
            .onAppear {
                // Fast-path: a single bookable listing skips this picker entirely.
                if selectedListing == nil, bookableListings.count == 1 {
                    selectedListing = bookableListings.first
                }
            }
        }
    }
}

// MARK: - Steps

private extension ProfileReserveFlow {
    var listingStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Which shop would you like to book at?",
                    subtitle: "\(profileUser.name ?? "This provider") works at multiple locations"
                )
                .padding(.horizontal)

                VStack(spacing: 10) {
                    ForEach(bookableListings) { listing in
                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                selectedListing = listing
                            }
                        } label: {
                            listingRow(listing)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, ForMe.space4)
        }
    }

    func listingRow(_ listing: Listing) -> some View {
        HStack(spacing: 14) {
            AsyncImage(url: AssetURL.resolve(listing.imageSrc)) { phase in
                switch phase {
                case .success(let image): image.resizable().aspectRatio(contentMode: .fill)
                default: RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous).fill(ForMe.stone100)
                }
            }
            .frame(width: 56, height: 56)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

            VStack(alignment: .leading, spacing: 3) {
                Text(listing.title)
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                if let location = listing.location {
                    Text(location)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(ForMe.stone300)
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }
}
