import SwiftUI
import Combine

@MainActor
class BookingViewModel: ObservableObject {
    // Multi-service selection — mirrors web ReservationFlow's selectedServices.
    // The user can toggle as many as they like before continuing; an
    // initialService passed by the caller is treated as a pre-checked seed.
    @Published var selectedServices: [Service] = []
    @Published var availableServices: [Service] = []
    @Published var isLoadingServices = false

    @Published var selectedDate = Date()
    @Published var selectedTime: String?
    @Published var selectedEmployee: Employee?
    @Published var note = ""
    @Published var isLoading = false
    @Published var error: String?
    @Published var checkoutURL: URL?
    @Published var bookingComplete = false

    private let api = APIService.shared

    var subtotal: Double {
        selectedServices.map(\.price).reduce(0, +)
    }

    var serviceCount: Int { selectedServices.count }

    /// Stripe / receipt label — "X services" when more than one was chosen so the
    /// hosted checkout page reflects what's being booked. Single-service paths
    /// still show the service name as before.
    func leadServiceLabel(fallback: String? = nil) -> String {
        if selectedServices.count > 1 { return "\(selectedServices.count) services" }
        return selectedServices.first?.serviceName ?? fallback ?? "Service booking"
    }

    func toggleService(_ service: Service) {
        if let idx = selectedServices.firstIndex(where: { $0.id == service.id }) {
            selectedServices.remove(at: idx)
        } else {
            selectedServices.append(service)
        }
    }

    func isSelected(_ service: Service) -> Bool {
        selectedServices.contains(where: { $0.id == service.id })
    }

    /// Hydrate the SERVICES step's grid. Use the listing's embedded services
    /// when present; otherwise fall back to /listings/<id>/services.
    func loadServicesIfNeeded(for listing: Listing) async {
        guard availableServices.isEmpty else { return }

        if let svcs = listing.services, !svcs.isEmpty {
            availableServices = svcs
            return
        }

        isLoadingServices = true
        defer { isLoadingServices = false }
        do {
            availableServices = try await api.getListingServices(listingId: listing.id)
        } catch {
            // Non-fatal — the step renders an empty state and the user can
            // back out without a hard error.
        }
    }

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
        !selectedServices.isEmpty && selectedTime != nil && selectedEmployee != nil
    }

    /// Create reservation then initiate Stripe checkout. Sends the canonical
    /// `serviceIds` array plus a "lead" `serviceId` so older code paths and
    /// the web's existing checkout endpoint both stay happy.
    func createBooking(listing: Listing) async -> Bool {
        guard !selectedServices.isEmpty,
              let time = selectedTime,
              let employee = selectedEmployee
        else { return false }

        isLoading = true
        error = nil

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateStr = dateFormatter.string(from: selectedDate)

        let lead = selectedServices[0]
        let label = leadServiceLabel(fallback: lead.serviceName)

        do {
            // Reservation rows are still created server-side by the Stripe
            // webhook (see web/src/app/libs/createReservationFromCheckout.ts);
            // creating one up-front would trip /api/checkout's overlap check.
            let checkout = try await api.createCheckoutSession(CheckoutRequest(
                totalPrice: subtotal,
                date: dateStr,
                time: time,
                listingId: listing.id,
                serviceId: lead.id,
                serviceIds: selectedServices.map(\.id),
                serviceName: label,
                employeeId: employee.id,
                employeeName: employee.fullName,
                note: note.isEmpty ? nil : note,
                businessName: listing.title,
                platform: "ios"
            ))

            if let urlString = checkout.url, let url = URL(string: urlString) {
                checkoutURL = url
                isLoading = false
                return true
            } else {
                // No URL means Stripe Connect isn't set up — booking still created.
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
