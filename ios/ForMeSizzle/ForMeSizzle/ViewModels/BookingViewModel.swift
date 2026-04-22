import SwiftUI
import Combine

@MainActor
class BookingViewModel: ObservableObject {
    @Published var selectedDate = Date()
    @Published var selectedTime: String?
    @Published var selectedEmployee: Employee?
    @Published var note = ""
    @Published var isLoading = false
    @Published var error: String?
    @Published var checkoutURL: URL?
    @Published var bookingComplete = false

    private let api = APIService.shared

    var availableTimeSlots: [String] {
        var slots: [String] = []
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        var calendar = Calendar.current
        calendar.timeZone = .current

        var components = calendar.dateComponents([.year, .month, .day], from: selectedDate)
        components.hour = 9
        components.minute = 0

        while let date = calendar.date(from: components), components.hour ?? 0 < 18 {
            slots.append(formatter.string(from: date))
            components.minute = (components.minute ?? 0) + 30
            if (components.minute ?? 0) >= 60 {
                components.hour = (components.hour ?? 0) + 1
                components.minute = 0
            }
        }

        return slots
    }

    var canBook: Bool {
        selectedTime != nil && selectedEmployee != nil
    }

    /// Create reservation then initiate Stripe checkout
    func createBooking(listingId: String, serviceId: String, serviceName: String, price: Double, businessName: String?) async -> Bool {
        guard let time = selectedTime, let employee = selectedEmployee else { return false }

        isLoading = true
        error = nil

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateStr = dateFormatter.string(from: selectedDate)

        do {
            // Create Stripe checkout session. The reservation row itself is
            // created server-side by the Stripe webhook (and the verify
            // fallback) after payment succeeds — see
            // web/src/app/libs/createReservationFromCheckout.ts. Creating a
            // pending reservation up-front here would trip /api/checkout's
            // own overlap check ("This time slot is no longer available")
            // because it would look like an existing conflict.
            let checkout = try await api.createCheckoutSession(CheckoutRequest(
                totalPrice: price,
                date: dateStr,
                time: time,
                listingId: listingId,
                serviceId: serviceId,
                serviceName: serviceName,
                employeeId: employee.id,
                employeeName: employee.fullName,
                note: note.isEmpty ? nil : note,
                businessName: businessName,
                platform: "ios"
            ))

            // 3. Open Stripe checkout URL
            if let urlString = checkout.url, let url = URL(string: urlString) {
                checkoutURL = url
                isLoading = false
                return true
            } else {
                // No URL means Stripe Connect isn't set up — booking still created
                bookingComplete = true
                isLoading = false
                return true
            }
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            return false
        }
    }
}
