import SwiftUI
import Combine

struct BookingSuccessView: View {
    let listing: Listing
    let service: Service
    let date: Date
    let time: String
    let employee: Employee?
    let onDismiss: () -> Void

    @State private var checkmarkScale: CGFloat = 0
    @State private var contentOpacity: Double = 0
    @State private var countdown = 5

    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: ForMe.space6) {
                // Animated checkmark
                ZStack {
                    Circle()
                        .fill(Color(hex: "DCFCE7"))
                        .frame(width: 100, height: 100)

                    Image(systemName: "checkmark")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(Color(hex: "22C55E"))
                        .scaleEffect(checkmarkScale)
                }

                // Title
                VStack(spacing: 8) {
                    Text("Reservation Confirmed!")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(ForMe.textPrimary)

                    Text("Thank you for your booking.\nWe've sent a confirmation to your email.")
                        .font(.system(size: 15))
                        .foregroundColor(ForMe.stone500)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                }

                // Booking details card
                VStack(spacing: 0) {
                    // Listing header
                    HStack(spacing: 14) {
                        AsyncImage(url: URL(string: listing.imageSrc ?? "")) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().aspectRatio(contentMode: .fill)
                            default:
                                RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                    .fill(ForMe.stone100)
                            }
                        }
                        .frame(width: 52, height: 52)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                        VStack(alignment: .leading, spacing: 3) {
                            Text(listing.title)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(ForMe.textPrimary)
                            Text(service.serviceName)
                                .font(.system(size: 13))
                                .foregroundColor(ForMe.stone500)
                        }

                        Spacer()
                    }
                    .padding(ForMe.space4)

                    Divider().padding(.horizontal)

                    // Details rows
                    detailRow(label: "Date", value: formatDate(date))
                    Divider().padding(.horizontal)
                    detailRow(label: "Time", value: time)
                    if let emp = employee {
                        Divider().padding(.horizontal)
                        detailRow(label: "Provider", value: emp.fullName)
                    }
                    Divider().padding(.horizontal)
                    detailRow(label: "Total", value: service.formattedPrice, isBold: true)
                }
                .background(ForMe.stone50)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )
                .padding(.horizontal, ForMe.space4)

                // Countdown
                Text("Redirecting in \(countdown)s...")
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)

                // Buttons
                HStack(spacing: 12) {
                    Button(action: onDismiss) {
                        Text("Done")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(ForMe.stone100)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    }

                    Button(action: onDismiss) {
                        Text("View Bookings")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(ForMe.stone900)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    }
                }
                .padding(.horizontal, ForMe.space4)
            }
            .opacity(contentOpacity)

            Spacer()
        }
        .background(ForMe.background)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.2)) {
                checkmarkScale = 1.0
            }
            withAnimation(.easeOut(duration: 0.5).delay(0.4)) {
                contentOpacity = 1.0
            }
        }
        .onReceive(timer) { _ in
            if countdown > 1 {
                countdown -= 1
            } else {
                onDismiss()
            }
        }
    }

    private func detailRow(label: String, value: String, isBold: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(ForMe.stone500)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: isBold ? .bold : .medium))
                .foregroundColor(ForMe.textPrimary)
        }
        .padding(.horizontal, ForMe.space4)
        .padding(.vertical, 13)
    }

    private func formatDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "EEEE, MMM d, yyyy"
        return f.string(from: date)
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
        onDismiss: {}
    )
}
