import SwiftUI

// MARK: - Multi-step Booking Flow (matches web ReservationFlow)
//
// Always opens on the SERVICES step so the customer can pick one or more
// services in the same reservation — even when the caller already knows the
// listing/worker/independent. An `initialService` pre-checks one option but
// the step still appears so they can add more.

struct BookingView: View {
    let listing: Listing
    let initialService: Service?
    let fixedEmployee: Employee?
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = BookingViewModel()
    @State private var step: BookingStep = .service

    init(listing: Listing, initialService: Service? = nil, fixedEmployee: Employee? = nil) {
        self.listing = listing
        self.initialService = initialService
        self.fixedEmployee = fixedEmployee
    }

    enum BookingStep: Int, CaseIterable {
        case service = 0, provider, date, time, summary

        var title: String {
            switch self {
            case .service: return "Select Services"
            case .provider: return "Select Provider"
            case .date: return "Select Date"
            case .time: return "Select Time"
            case .summary: return "Review & Confirm"
            }
        }
    }

    // The actual ordered list of steps the user walks through. We omit
    // `.provider` when the booking already targets a specific employee
    // (e.g. tapping reserve on someone's profile) — picking again would be
    // redundant. Everything else (service, date, time, summary) is always shown.
    private var visibleSteps: [BookingStep] {
        fixedEmployee != nil
            ? [.service, .date, .time, .summary]
            : [.service, .provider, .date, .time, .summary]
    }

    private var currentIndex: Int {
        visibleSteps.firstIndex(of: step) ?? 0
    }

    private var progress: CGFloat {
        CGFloat(currentIndex + 1) / CGFloat(visibleSteps.count)
    }

    private var isFirstStep: Bool {
        step == visibleSteps.first
    }

    private var isLastStep: Bool {
        step == .summary
    }

    private func goNext() {
        guard currentIndex < visibleSteps.count - 1 else { return }
        withAnimation(.easeInOut(duration: 0.25)) {
            step = visibleSteps[currentIndex + 1]
        }
    }

    private func goBack() {
        guard currentIndex > 0 else { return }
        withAnimation(.easeInOut(duration: 0.25)) {
            step = visibleSteps[currentIndex - 1]
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                FlowProgressBar(progress: progress)

                // Step content
                Group {
                    switch step {
                    case .service: serviceStep
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
                            goBack()
                        }
                    } label: {
                        Image(systemName: isFirstStep ? "xmark" : "chevron.left")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
            .task {
                if let emp = fixedEmployee, viewModel.selectedEmployee == nil {
                    viewModel.selectedEmployee = emp
                }
                await viewModel.loadServicesIfNeeded(for: listing)

                // Pre-check the seed service the caller passed in — but only
                // on the first time through so the user's later toggles aren't
                // overwritten when this task re-runs.
                if let initial = initialService,
                   viewModel.selectedServices.isEmpty,
                   viewModel.availableServices.contains(where: { $0.id == initial.id }) {
                    viewModel.selectedServices = [initial]
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
                    services: viewModel.selectedServices,
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

// MARK: - Service Step (multi-select)

private extension BookingView {
    var serviceStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "What are you booking?",
                    subtitle: viewModel.serviceCount > 0
                        ? "Add more services or continue"
                        : "Select one or more to continue"
                )
                .padding(.horizontal)

                if viewModel.isLoadingServices && viewModel.availableServices.isEmpty {
                    HStack {
                        Spacer()
                        ForMeLoader(size: .medium)
                        Spacer()
                    }
                    .padding(.vertical, ForMe.space6)
                } else if viewModel.availableServices.isEmpty {
                    Text("This business hasn't listed any services yet.")
                        .font(ForMe.font(.regular, size: 14))
                        .foregroundColor(ForMe.textTertiary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, ForMe.space6)
                } else {
                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)],
                        spacing: 10
                    ) {
                        ForEach(viewModel.availableServices) { service in
                            ServiceMultiSelectCard(
                                service: service,
                                isSelected: viewModel.isSelected(service)
                            ) {
                                Haptics.tap()
                                viewModel.toggleService(service)
                            }
                        }
                    }
                    .padding(.horizontal)
                }

                if viewModel.serviceCount > 0 {
                    Text("\(viewModel.serviceCount) service\(viewModel.serviceCount == 1 ? "" : "s") selected — \(formatPrice(viewModel.subtotal)) total")
                        .font(ForMe.font(.medium, size: 13))
                        .foregroundColor(ForMe.textSecondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 4)
                }
            }
            .padding(.vertical, ForMe.space4)
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
                    // Multi-service: emit a row per service so the user sees
                    // exactly what they're paying for. Single-service just
                    // shows one row labelled "Service" — same as before.
                    if viewModel.selectedServices.count == 1, let only = viewModel.selectedServices.first {
                        summaryRow(label: "Service", value: only.serviceName)
                    } else {
                        ForEach(Array(viewModel.selectedServices.enumerated()), id: \.element.id) { _, svc in
                            summaryRow(
                                label: "Service",
                                value: "\(svc.serviceName) — \(svc.formattedPrice)"
                            )
                            Divider().padding(.horizontal)
                        }
                    }
                    if viewModel.selectedServices.count == 1 {
                        Divider().padding(.horizontal)
                    }
                    summaryRow(label: "Date", value: formatDate(viewModel.selectedDate))
                    Divider().padding(.horizontal)
                    summaryRow(label: "Time", value: viewModel.selectedTime ?? "—")
                    if let employee = viewModel.selectedEmployee {
                        Divider().padding(.horizontal)
                        summaryRow(label: "Provider", value: employee.fullName)
                    }
                    Divider().padding(.horizontal)
                    summaryRow(label: "Total", value: formatPrice(viewModel.subtotal), isBold: true)
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

// MARK: - Helpers

private extension BookingView {
    func formatPrice(_ value: Double) -> String {
        value == value.rounded() ? "$\(Int(value))" : String(format: "$%.2f", value)
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
                    Text(viewModel.serviceCount > 1 ? "Subtotal" : "Total")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                    Text(formatPrice(viewModel.subtotal))
                        .font(ForMe.font(.bold, size: 20))
                        .foregroundColor(ForMe.textPrimary)
                }

                Spacer()

                Button {
                    if isLastStep {
                        Haptics.impact()
                        Task {
                            _ = await viewModel.createBooking(listing: listing)
                        }
                    } else {
                        Haptics.tap()
                        goNext()
                    }
                } label: {
                    if viewModel.isLoading {
                        ForMeLoader(size: .small, color: .white)
                            .frame(width: 140)
                    } else {
                        Text(isLastStep ? "Reserve & Pay" : "Continue")
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
        case .service: return !viewModel.selectedServices.isEmpty
        case .provider: return viewModel.selectedEmployee != nil
        case .date: return true
        case .time: return viewModel.selectedTime != nil
        case .summary: return viewModel.canBook
        }
    }
}

// MARK: - Service Multi-Select Card

struct ServiceMultiSelectCard: View {
    let service: Service
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .top, spacing: 6) {
                    Text(service.serviceName)
                        .font(ForMe.font(.semibold, size: 14))
                        .foregroundColor(ForMe.textPrimary)
                        .multilineTextAlignment(.leading)
                        .lineLimit(2)

                    Spacer(minLength: 0)

                    // Checkbox-style indicator. Black when selected so the
                    // multi-select affordance reads at a glance.
                    ZStack {
                        RoundedRectangle(cornerRadius: 6, style: .continuous)
                            .stroke(isSelected ? ForMe.stone900 : ForMe.stone300, lineWidth: 1.5)
                            .background(
                                RoundedRectangle(cornerRadius: 6, style: .continuous)
                                    .fill(isSelected ? ForMe.stone900 : Color.clear)
                            )
                            .frame(width: 18, height: 18)

                        if isSelected {
                            Image(systemName: "checkmark")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                }

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
            services: [
                Service(id: "s1", serviceName: "Haircut", price: 35, duration: 45, listingId: "1"),
                Service(id: "s2", serviceName: "Beard Trim", price: 20, duration: 20, listingId: "1"),
                Service(id: "s3", serviceName: "Hot Towel Shave", price: 40, duration: 30, listingId: "1"),
            ],
            employees: [
                Employee(id: "e1", fullName: "Marcus J.", jobTitle: "Barber"),
                Employee(id: "e2", fullName: "Tim D.", jobTitle: "Barber"),
            ],
            userId: "1"
        )
    )
}
