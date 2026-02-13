import SwiftUI

struct BookingView: View {
    let listing: Listing
    let service: Service
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = BookingViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // Service summary
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(listing.title)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(ForMe.textPrimary)
                                Text(service.serviceName)
                                    .font(.caption)
                                    .foregroundColor(ForMe.textSecondary)
                            }

                            Spacer()

                            Text("$\(service.price, specifier: "%.0f")")
                                .font(.title2.bold())
                                .foregroundColor(ForMe.textPrimary)
                        }
                        .forMeCard()

                        // Date picker
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Select Date")
                                .font(.headline)
                                .foregroundColor(ForMe.textPrimary)

                            DatePicker(
                                "Date",
                                selection: $viewModel.selectedDate,
                                in: Date()...,
                                displayedComponents: .date
                            )
                            .datePickerStyle(.graphical)
                            .tint(ForMe.accent)
                            .forMeCard()
                        }

                        // Time slots
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Select Time")
                                .font(.headline)
                                .foregroundColor(ForMe.textPrimary)

                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 10) {
                                ForEach(viewModel.availableTimeSlots, id: \.self) { time in
                                    TimeSlotButton(
                                        time: time,
                                        isSelected: viewModel.selectedTime == time
                                    ) {
                                        viewModel.selectedTime = time
                                    }
                                }
                            }
                        }

                        // Employee selection (if applicable)
                        if let employees = listing.employees, !employees.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Select Provider")
                                    .font(.headline)
                                    .foregroundColor(ForMe.textPrimary)

                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 12) {
                                        EmployeeCard(
                                            name: "Any Available",
                                            isSelected: viewModel.selectedEmployee == nil
                                        ) {
                                            viewModel.selectedEmployee = nil
                                        }

                                        ForEach(employees) { employee in
                                            EmployeeCard(
                                                name: employee.fullName,
                                                isSelected: viewModel.selectedEmployee?.id == employee.id
                                            ) {
                                                viewModel.selectedEmployee = employee
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Notes
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Notes (optional)")
                                .font(.headline)
                                .foregroundColor(ForMe.textPrimary)

                            TextField("Any special requests?", text: $viewModel.note, axis: .vertical)
                                .lineLimit(3...6)
                                .forMeInput()
                        }
                    }
                    .padding()
                }

                // Book button
                VStack(spacing: 0) {
                    Divider()
                        .foregroundColor(ForMe.border)

                    HStack {
                        VStack(alignment: .leading) {
                            Text("Total")
                                .font(.caption)
                                .foregroundColor(ForMe.textSecondary)
                            Text("$\(service.price, specifier: "%.0f")")
                                .font(.title2.bold())
                                .foregroundColor(ForMe.textPrimary)
                        }

                        Spacer()

                        Button {
                            Task {
                                if await viewModel.createBooking(
                                    listingId: listing.id,
                                    serviceId: service.id
                                ) {
                                    dismiss()
                                }
                            }
                        } label: {
                            if viewModel.isLoading {
                                ForMeLoader(size: .small, color: .white)
                            } else {
                                Text("Confirm Booking")
                            }
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 16)
                        .background(viewModel.canBook ? ForMe.accent : ForMe.textTertiary)
                        .cornerRadius(12)
                        .disabled(!viewModel.canBook || viewModel.isLoading)
                    }
                    .padding()
                }
                .background(ForMe.background)
            }
            .navigationTitle("Book Appointment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Error", isPresented: .constant(viewModel.error != nil)) {
                Button("OK") { viewModel.error = nil }
            } message: {
                Text(viewModel.error ?? "")
            }
        }
    }
}

struct TimeSlotButton: View {
    let time: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(time)
                .font(.subheadline.weight(.medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(isSelected ? ForMe.accent : ForMe.surface)
                .foregroundColor(isSelected ? .white : ForMe.textPrimary)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(isSelected ? Color.clear : ForMe.border, lineWidth: 1)
                )
                .cornerRadius(10)
        }
    }
}

struct EmployeeCard: View {
    let name: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                DynamicAvatar(name: name, size: .medium)

                Text(name)
                    .font(.caption.weight(.medium))
                    .lineLimit(1)
                    .foregroundColor(ForMe.textPrimary)
            }
            .padding(12)
            .background(isSelected ? ForMe.accentLight : ForMe.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? ForMe.accent : ForMe.border, lineWidth: isSelected ? 2 : 1)
            )
            .cornerRadius(12)
        }
    }
}

#Preview {
    BookingView(
        listing: Listing(id: "1", title: "Sample", category: .hair, userId: "1"),
        service: Service(id: "1", serviceName: "Haircut", price: 50, listingId: "1")
    )
}
