import SwiftUI

// MARK: - Multi-step Booking Flow (matches web ReservationFlow)

struct BookingView: View {
    let listing: Listing
    let service: Service
    let fixedEmployee: Employee?
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = BookingViewModel()
    @State private var step: BookingStep

    init(listing: Listing, service: Service, fixedEmployee: Employee? = nil) {
        self.listing = listing
        self.service = service
        self.fixedEmployee = fixedEmployee
        // When the employee is already known (e.g. booking from that
        // employee's profile), skip the provider picker and start on date.
        _step = State(initialValue: fixedEmployee != nil ? .date : .provider)
    }

    enum BookingStep: Int, CaseIterable {
        case provider = 0, date, time, summary

        var title: String {
            switch self {
            case .provider: return "Select Provider"
            case .date: return "Select Date"
            case .time: return "Select Time"
            case .summary: return "Review & Confirm"
            }
        }
    }

    private var progress: CGFloat {
        if fixedEmployee != nil {
            // Three visible steps: date, time, summary (raw values 1..3)
            return CGFloat(step.rawValue) / 3.0
        }
        return CGFloat(step.rawValue + 1) / CGFloat(BookingStep.allCases.count)
    }

    private var isFirstStep: Bool {
        fixedEmployee != nil ? step == .date : step == .provider
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                FlowProgressBar(progress: progress)

                // Step content
                Group {
                    switch step {
                    case .provider: providerStep
                    case .date: dateStep
                    case .time: timeStep
                    case .summary: summaryStep
                    }
                }
                .transition(.move(edge: .trailing))

                // Bottom nav
                bottomBar
            }
            .navigationTitle(step.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        if isFirstStep {
                            dismiss()
                        } else {
                            withAnimation(.easeInOut(duration: 0.25)) {
                                step = BookingStep(rawValue: step.rawValue - 1) ?? step
                            }
                        }
                    } label: {
                        Image(systemName: isFirstStep ? "xmark" : "chevron.left")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
            .onAppear {
                if let emp = fixedEmployee, viewModel.selectedEmployee == nil {
                    viewModel.selectedEmployee = emp
                }
            }
            .alert("Error", isPresented: .constant(viewModel.error != nil)) {
                Button("OK") { viewModel.error = nil }
            } message: {
                Text(viewModel.error ?? "")
            }
            .sheet(isPresented: .init(
                get: { viewModel.checkoutURL != nil },
                set: { if !$0 { viewModel.checkoutURL = nil } }
            )) {
                if let url = viewModel.checkoutURL {
                    StripeCheckoutView(url: url) {
                        viewModel.checkoutURL = nil
                        viewModel.bookingComplete = true
                    }
                }
            }
            .fullScreenCover(isPresented: $viewModel.bookingComplete) {
                BookingSuccessView(
                    listing: listing,
                    service: service,
                    date: viewModel.selectedDate,
                    time: viewModel.selectedTime ?? "",
                    employee: viewModel.selectedEmployee,
                    onDismiss: { dismiss() },
                    onViewBookings: {
                        appState.pendingBookingRefresh = true
                        appState.selectedTab = .bookings
                        dismiss()
                    }
                )
            }
        }
    }
}

// MARK: - Provider Step

private extension BookingView {
    var providerStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Who would you like to book with?",
                    subtitle: "Select a professional"
                )
                .padding(.horizontal)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    if let employees = listing.employees {
                        ForEach(employees) { employee in
                            ProviderOption(
                                name: employee.fullName,
                                imageUrl: employee.user?.image,
                                subtitle: employee.jobTitle,
                                isSelected: viewModel.selectedEmployee?.id == employee.id
                            ) { viewModel.selectedEmployee = employee }
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, ForMe.space4)
        }
    }
}

// MARK: - Date Step

private extension BookingView {
    var dateStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "When would you like to come in?",
                    subtitle: "Pick a date for your appointment"
                )
                .padding(.horizontal)

                ForMeCalendar(selectedDate: $viewModel.selectedDate)
                    .padding(.horizontal)
            }
            .padding(.vertical, ForMe.space4)
        }
    }
}

// MARK: - Time Step

private extension BookingView {
    var timeStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "What time works best?",
                    subtitle: "Choose an available time slot"
                )
                .padding(.horizontal)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3), spacing: 10) {
                    ForEach(viewModel.availableTimeSlots, id: \.self) { time in
                        Button {
                            viewModel.selectedTime = time
                        } label: {
                            Text(time)
                                .font(ForMe.font(.medium, size: 14))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(viewModel.selectedTime == time ? ForMe.stone900 : ForMe.surface)
                                .foregroundColor(viewModel.selectedTime == time ? .white : ForMe.textPrimary)
                                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                        .stroke(viewModel.selectedTime == time ? .clear : ForMe.stone200, lineWidth: 1)
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
    }
}

// MARK: - Summary Step

private extension BookingView {
    var summaryStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: ForMe.space4) {
                // Listing info
                HStack(spacing: 14) {
                    AsyncImage(url: AssetURL.resolve(listing.imageSrc)) { phase in
                        switch phase {
                        case .success(let image): image.resizable().aspectRatio(contentMode: .fill)
                        default: RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous).fill(ForMe.stone100)
                        }
                    }
                    .frame(width: 60, height: 60)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))

                    VStack(alignment: .leading, spacing: 3) {
                        Text(listing.title)
                            .font(ForMe.font(.semibold, size: 16))
                            .foregroundColor(ForMe.textPrimary)
                        if let location = listing.location {
                            Text(location)
                                .font(ForMe.font(.regular, size: 13))
                                .foregroundColor(ForMe.textTertiary)
                        }
                    }
                    Spacer()
                }
                .forMeCard()

                // Booking details
                VStack(spacing: 0) {
                    summaryRow(label: "Service", value: service.serviceName)
                    Divider().padding(.horizontal)
                    summaryRow(label: "Date", value: formatDate(viewModel.selectedDate))
                    Divider().padding(.horizontal)
                    summaryRow(label: "Time", value: viewModel.selectedTime ?? "—")
                    if let employee = viewModel.selectedEmployee {
                        Divider().padding(.horizontal)
                        summaryRow(label: "Provider", value: employee.fullName)
                    }
                    Divider().padding(.horizontal)
                    summaryRow(label: "Price", value: service.formattedPrice, isBold: true)
                }
                .background(ForMe.surface)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )

                // Notes
                VStack(alignment: .leading, spacing: 8) {
                    Text("Notes (optional)")
                        .font(ForMe.font(.medium, size: 14))
                        .foregroundColor(ForMe.textSecondary)
                    TextField("Any special requests?", text: $viewModel.note, axis: .vertical)
                        .lineLimit(3...6)
                        .font(ForMe.font(.regular, size: 14))
                        .forMeInput()
                }
            }
            .padding()
        }
    }

    func summaryRow(label: String, value: String, isBold: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(ForMe.font(.regular, size: 14))
                .foregroundColor(ForMe.textSecondary)
            Spacer()
            Text(value)
                .font(ForMe.font(isBold ? .bold : .medium, size: 14))
                .foregroundColor(ForMe.textPrimary)
        }
        .padding(.horizontal, ForMe.space4)
        .padding(.vertical, 14)
    }

    func formatDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "EEEE, MMM d"
        return f.string(from: date)
    }
}

// MARK: - Bottom Bar

private extension BookingView {
    var bottomBar: some View {
        VStack(spacing: 0) {
            Divider()
            if step == .summary {
                Text("By booking, you agree to the [Terms of Service](https://forme.app/terms) and [Privacy Policy](https://forme.app/privacy).")
                    .font(ForMe.font(.regular, size: 11))
                    .foregroundColor(ForMe.textTertiary)
                    .multilineTextAlignment(.center)
                    .tint(ForMe.accent)
                    .padding(.horizontal)
                    .padding(.top, 10)
            }
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Total")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                    Text(service.formattedPrice)
                        .font(ForMe.font(.bold, size: 20))
                        .foregroundColor(ForMe.textPrimary)
                }

                Spacer()

                Button {
                    if step == .summary {
                        Haptics.impact()
                        Task {
                            _ = await viewModel.createBooking(
                                listingId: listing.id,
                                serviceId: service.id,
                                serviceName: service.serviceName,
                                price: service.price,
                                businessName: listing.title
                            )
                        }
                    } else {
                        Haptics.tap()
                        withAnimation(.easeInOut(duration: 0.25)) {
                            step = BookingStep(rawValue: step.rawValue + 1) ?? .summary
                        }
                    }
                } label: {
                    if viewModel.isLoading {
                        ForMeLoader(size: .small, color: .white)
                            .frame(width: 140)
                    } else {
                        Text(step == .summary ? "Reserve & Pay" : "Continue")
                            .font(ForMe.font(.semibold, size: 15))
                            .frame(width: 140)
                    }
                }
                .foregroundColor(.white)
                .padding(.vertical, 14)
                .background(canProceed ? ForMe.stone900 : ForMe.stone300)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                .disabled(!canProceed || viewModel.isLoading)
            }
            .padding()
        }
        .background(ForMe.background)
    }

    var canProceed: Bool {
        switch step {
        case .provider: return viewModel.selectedEmployee != nil
        case .date: return true
        case .time: return viewModel.selectedTime != nil
        case .summary: return viewModel.canBook
        }
    }
}

// MARK: - Provider Option (grid card for booking flow)

struct ProviderOption: View {
    let name: String
    var imageUrl: String? = nil
    var subtitle: String? = nil
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                DynamicAvatar(name: name, imageUrl: imageUrl, size: .medium)

                VStack(spacing: 2) {
                    Text(name)
                        .font(ForMe.font(.semibold, size: 13))
                        .foregroundColor(isSelected ? ForMe.textPrimary : ForMe.textSecondary)
                        .lineLimit(1)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(ForMe.font(.regular, size: 11))
                            .foregroundColor(ForMe.textTertiary)
                            .lineLimit(1)
                    }
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, ForMe.space3)
            .background(isSelected ? ForMe.stone50 : ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(isSelected ? ForMe.stone900 : ForMe.stone200, lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Employee Chip

struct EmployeeChip: View {
    let name: String
    var imageUrl: String? = nil
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                DynamicAvatar(name: name, imageUrl: imageUrl, size: .small)
                Text(name)
                    .font(ForMe.font(.medium, size: 13))
                    .foregroundColor(isSelected ? .white : ForMe.textPrimary)
            }
            .padding(.horizontal, ForMe.space3)
            .padding(.vertical, 8)
            .background(isSelected ? ForMe.stone900 : ForMe.surface)
            .clipShape(Capsule())
            .overlay(Capsule().stroke(isSelected ? .clear : ForMe.stone200, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Previews

#Preview("Booking Flow") {
    BookingView(
        listing: Listing(
            id: "1",
            title: "John's Place",
            category: "Barber",
            location: "Bullhead City, AZ",
            employees: [
                Employee(id: "e1", fullName: "Marcus J.", jobTitle: "Barber"),
                Employee(id: "e2", fullName: "Tim D.", jobTitle: "Barber"),
            ],
            userId: "1"
        ),
        service: Service(id: "1", serviceName: "Haircut", price: 35, duration: 45, listingId: "1")
    )
}
