import SwiftUI

@MainActor
class BookingViewModel: ObservableObject {
    @Published var selectedDate = Date()
    @Published var selectedTime: String?
    @Published var selectedEmployee: Employee?
    @Published var note = ""
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    var availableTimeSlots: [String] {
        // Generate time slots from 9 AM to 6 PM
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
        selectedTime != nil
    }

    func createBooking(listingId: String, serviceId: String) async -> Bool {
        guard let time = selectedTime else { return false }

        isLoading = true
        error = nil

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"

        do {
            _ = try await api.createReservation(CreateReservationRequest(
                listingId: listingId,
                serviceId: serviceId,
                employeeId: selectedEmployee?.id,
                date: dateFormatter.string(from: selectedDate),
                time: time,
                note: note.isEmpty ? nil : note
            ))
            isLoading = false
            return true
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            return false
        }
    }
}
