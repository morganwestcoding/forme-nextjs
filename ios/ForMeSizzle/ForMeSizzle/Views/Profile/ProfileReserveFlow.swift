import SwiftUI

// Reserve entry point launched from another user's profile.
// If the profile owner works at multiple listings, ask which one first;
// then pick a service; then hand off to BookingView with the employee
// fixed to the profile owner (so the provider-picker step is skipped).
struct ProfileReserveFlow: View {
    let profileUser: User
    let listings: [Listing]
    let services: [Service]

    @Environment(\.dismiss) private var dismiss
    @State private var selectedListing: Listing?
    @State private var selectedService: Service?

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

    var body: some View {
        if let listing = selectedListing,
           let service = selectedService,
           let employee = employeeForSelectedListing {
            BookingView(listing: listing, service: service, fixedEmployee: employee)
        } else {
            NavigationStack {
                Group {
                    if selectedListing == nil {
                        listingStep
                    } else {
                        serviceStep
                    }
                }
                .navigationTitle(selectedListing == nil ? "Select Shop" : "Select Service")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button {
                            if selectedListing != nil && bookableListings.count > 1 {
                                selectedListing = nil
                            } else {
                                dismiss()
                            }
                        } label: {
                            Image(systemName: (selectedListing != nil && bookableListings.count > 1) ? "chevron.left" : "xmark")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(ForMe.textPrimary)
                        }
                    }
                }
                .background(ForMe.background)
            }
            .onAppear {
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
            AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
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

    var serviceStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "What are you booking?",
                    subtitle: "Select a service"
                )
                .padding(.horizontal)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                    ForEach(servicesForSelectedListing) { service in
                        Button {
                            selectedService = service
                        } label: {
                            serviceCard(service)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, ForMe.space4)
        }
    }

    func serviceCard(_ service: Service) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(service.serviceName)
                .font(ForMe.font(.semibold, size: 14))
                .foregroundColor(ForMe.textPrimary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            HStack(spacing: 6) {
                Text(service.formattedPrice)
                    .font(ForMe.font(.semibold, size: 13))
                    .foregroundColor(ForMe.textPrimary)

                if !service.formattedDuration.isEmpty {
                    Text("·")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                    Text(service.formattedDuration)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }
}
