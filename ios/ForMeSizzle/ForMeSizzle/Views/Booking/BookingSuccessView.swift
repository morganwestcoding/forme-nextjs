import SwiftUI

struct BookingSuccessView: View {
    let listing: Listing
    let service: Service
    let date: Date
    let time: String
    let employee: Employee?
    let onDismiss: () -> Void
    let onViewBookings: () -> Void

    @State private var checkmarkScale: CGFloat = 0
    @State private var ringScale: CGFloat = 0.4
    @State private var ringOpacity: Double = 0
    @State private var ring2Scale: CGFloat = 0.4
    @State private var ring2Opacity: Double = 0
    @State private var cardOffset: CGFloat = 40
    @State private var cardOpacity: Double = 0
    @State private var titleOpacity: Double = 0
    @State private var buttonOpacity: Double = 0

    private let successGreen = Color(hex: "10B981")
    private let successTint = Color(hex: "DCFCE7")

    var body: some View {
        ZStack {
            // Ambient gradient backdrop — soft green wash at the top that
            // melts into the app background behind the details card.
            LinearGradient(
                colors: [
                    successTint.opacity(0.7),
                    successTint.opacity(0.25),
                    ForMe.background
                ],
                startPoint: .top,
                endPoint: .center
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        hero
                            .padding(.top, ForMe.space6)
                            .padding(.bottom, ForMe.space6)

                        titleBlock
                            .padding(.horizontal, ForMe.space6)
                            .padding(.bottom, ForMe.space6)

                        detailsCard
                            .padding(.horizontal, ForMe.space4)
                            .padding(.bottom, ForMe.space4)
                            .offset(y: cardOffset)
                            .opacity(cardOpacity)
                    }
                }

                buttons
                    .padding(.horizontal, ForMe.space4)
                    .padding(.top, ForMe.space2)
                    .padding(.bottom, ForMe.space4)
                    .background(ForMe.background.opacity(0.0))
                    .opacity(buttonOpacity)
            }
        }
        .onAppear(perform: runEntranceAnimation)
    }
}

// MARK: - Sections

private extension BookingSuccessView {
    var hero: some View {
        ZStack {
            // Double ripple rings — each does a single expand + fade on mount.
            // Sequenced so they stagger like a water drop.
            Circle()
                .stroke(successGreen.opacity(0.35), lineWidth: 2)
                .frame(width: 150, height: 150)
                .scaleEffect(ringScale)
                .opacity(ringOpacity)

            Circle()
                .stroke(successGreen.opacity(0.25), lineWidth: 2)
                .frame(width: 190, height: 190)
                .scaleEffect(ring2Scale)
                .opacity(ring2Opacity)

            // Solid success disc with a soft green halo.
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "22C55E"), Color(hex: "059669")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 104, height: 104)
                .shadow(color: successGreen.opacity(0.45), radius: 24, x: 0, y: 10)

            Image(systemName: "checkmark")
                .font(.system(size: 44, weight: .bold))
                .foregroundColor(.white)
                .scaleEffect(checkmarkScale)
        }
    }

    var titleBlock: some View {
        VStack(spacing: 10) {
            Text("You're all set!")
                .font(.system(size: 30, weight: .bold))
                .foregroundColor(ForMe.textPrimary)
                .tracking(-0.5)

            Text("Your reservation is confirmed. A receipt is on the way to your inbox.")
                .font(.system(size: 14))
                .foregroundColor(ForMe.stone500)
                .multilineTextAlignment(.center)
                .lineSpacing(3)
                .padding(.horizontal, ForMe.space4)
        }
        .opacity(titleOpacity)
    }

    var detailsCard: some View {
        VStack(spacing: 0) {
            // Listing + service header
            HStack(spacing: 14) {
                AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().aspectRatio(contentMode: .fill)
                    default:
                        RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                            .fill(ForMe.stone100)
                            .overlay(
                                Image(systemName: listing.categoryIcon)
                                    .font(.system(size: 20))
                                    .foregroundColor(ForMe.stone400)
                            )
                    }
                }
                .frame(width: 56, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                VStack(alignment: .leading, spacing: 3) {
                    Text(listing.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)
                    Text(service.serviceName)
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone500)
                        .lineLimit(1)
                }
                Spacer()

                // Small confirmed pill, echoes status badges elsewhere
                Text("Confirmed")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(0.4)
                    .textCase(.uppercase)
                    .foregroundColor(successGreen)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(successTint))
            }
            .padding(ForMe.space4)

            divider

            VStack(spacing: 0) {
                detailRow(icon: "calendar", label: "Date", value: formatDate(date))
                inlineDivider
                detailRow(icon: "clock", label: "Time", value: time)
                if let emp = employee {
                    inlineDivider
                    detailRow(icon: "person", label: "Provider", value: emp.fullName)
                }
            }

            divider

            HStack {
                Text("Total paid")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone500)
                Spacer()
                Text(service.formattedPrice)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(ForMe.textPrimary)
            }
            .padding(.horizontal, ForMe.space4)
            .padding(.vertical, ForMe.space4)
        }
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.06), radius: 20, x: 0, y: 8)
    }

    var buttons: some View {
        VStack(spacing: 10) {
            Button(action: onViewBookings) {
                Text("View My Bookings")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    .shadow(color: .black.opacity(0.15), radius: 10, x: 0, y: 4)
            }

            Button(action: onDismiss) {
                Text("Done")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(ForMe.stone500)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
            }
        }
    }

    var divider: some View {
        Rectangle()
            .fill(ForMe.borderLight)
            .frame(height: 1)
    }

    var inlineDivider: some View {
        Rectangle()
            .fill(ForMe.borderLight)
            .frame(height: 1)
            .padding(.leading, ForMe.space4 + 32) // align under icon+label
    }

    func detailRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(successGreen)
                .frame(width: 20)
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(ForMe.stone500)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)
        }
        .padding(.horizontal, ForMe.space4)
        .padding(.vertical, 14)
    }

    func formatDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "EEE, MMM d"
        return f.string(from: date)
    }

    func runEntranceAnimation() {
        // Checkmark "pops" in with spring
        withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.1)) {
            checkmarkScale = 1.0
        }

        // Inner ring — fades in, then scales out and disappears.
        withAnimation(.easeOut(duration: 0.2).delay(0.0)) {
            ringOpacity = 1.0
        }
        withAnimation(.easeOut(duration: 1.0).delay(0.15)) {
            ringScale = 1.3
            ringOpacity = 0
        }

        // Outer ring — same effect, staggered.
        withAnimation(.easeOut(duration: 0.2).delay(0.2)) {
            ring2Opacity = 1.0
        }
        withAnimation(.easeOut(duration: 1.2).delay(0.35)) {
            ring2Scale = 1.3
            ring2Opacity = 0
        }

        withAnimation(.easeOut(duration: 0.5).delay(0.35)) {
            titleOpacity = 1.0
        }

        withAnimation(.spring(response: 0.6, dampingFraction: 0.85).delay(0.5)) {
            cardOffset = 0
            cardOpacity = 1.0
        }

        withAnimation(.easeOut(duration: 0.4).delay(0.75)) {
            buttonOpacity = 1.0
        }
    }
}

// MARK: - Previews

#Preview("Success") {
    BookingSuccessView(
        listing: Listing(
            id: "1",
            title: "Trixie Nails",
            imageSrc: nil,
            category: "Nails",
            location: "Pasadena, CA",
            userId: "1"
        ),
        service: Service(id: "1", serviceName: "Manicure", price: 45, duration: 60, listingId: "1"),
        date: Date(),
        time: "2:00 PM",
        employee: Employee(id: "e1", fullName: "Amanda Knocke", jobTitle: "Nail Tech"),
        onDismiss: {},
        onViewBookings: {}
    )
}
