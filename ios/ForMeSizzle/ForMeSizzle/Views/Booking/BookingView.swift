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
                                    .font(.headline)
                                Text(service.serviceName)
                                    .foregroundColor(.secondary)
                            }

                            Spacer()

                            Text("$\(service.price, specifier: "%.0f")")
                                .font(.title2.bold())
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                        // Date picker
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Select Date")
                                .font(.headline)

                            DatePicker(
                                "Date",
                                selection: $viewModel.selectedDate,
                                in: Date()...,
                                displayedComponents: .date
                            )
                            .datePickerStyle(.graphical)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        }

                        // Time slots
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Select Time")
                                .font(.headline)

                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 12) {
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

                            TextField("Any special requests?", text: $viewModel.note, axis: .vertical)
                                .lineLimit(3...6)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                        }
                    }
                    .padding()
                }

                // Book button
                VStack(spacing: 0) {
                    Divider()

                    HStack {
                        VStack(alignment: .leading) {
                            Text("Total")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("$\(service.price, specifier: "%.0f")")
                                .font(.title2.bold())
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
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Confirm Booking")
                            }
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 16)
                        .background(viewModel.canBook ? Color.primary : Color.gray)
                        .cornerRadius(12)
                        .disabled(!viewModel.canBook || viewModel.isLoading)
                    }
                    .padding()
                }
                .background(Color(.systemBackground))
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
                .font(.subheadline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(isSelected ? Color.primary : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(8)
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
                Circle()
                    .fill(Color(.systemGray4))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: "person.fill")
                            .foregroundColor(.white)
                    )

                Text(name)
                    .font(.caption)
                    .lineLimit(1)
            }
            .padding()
            .background(isSelected ? Color.primary.opacity(0.1) : Color(.systemGray6))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.primary : Color.clear, lineWidth: 2)
            )
            .cornerRadius(12)
        }
        .foregroundColor(.primary)
    }
}

#Preview {
    BookingView(
        listing: Listing(id: "1", title: "Sample", category: .hair, userId: "1"),
        service: Service(id: "1", serviceName: "Haircut", price: 50, listingId: "1")
    )
}
