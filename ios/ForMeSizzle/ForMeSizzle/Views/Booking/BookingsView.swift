import SwiftUI

// Mirrors the web tabs in ReservationsClient.tsx — outgoing splits into
// Upcoming/Past by date, while incoming is its own pile that also covers
// past requests (matches web behavior: the Incoming tab doesn't split by
// time, so completed/declined requests still appear under it).
enum BookingTab: Int, CaseIterable {
    case upcoming, past, incoming

    var title: String {
        switch self {
        case .upcoming: return "Upcoming"
        case .past: return "Past"
        case .incoming: return "Incoming"
        }
    }
}

struct BookingsView: View {
    @StateObject private var viewModel = BookingsListViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedTab: BookingTab = .upcoming
    @State private var showMessages = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack(alignment: .center) {
                    Text("Bookings")
                        .font(ForMe.font(.bold, size: 24))
                        .foregroundColor(ForMe.textPrimary)

                    Spacer()

                    HStack(spacing: 12) {
                        HeaderIconButton(icon: "AlertBell") {
                            appState.showingNotifications = true
                        }
                        HeaderIconButton(icon: "HeaderChat") {
                            showMessages = true
                        }
                        Button {
                            appState.showingProfile = true
                        } label: {
                            DynamicAvatar(
                                name: authViewModel.currentUser?.name ?? "User",
                                imageUrl: authViewModel.currentUser?.image,
                                size: .smallMedium
                            )
                        }
                    }
                }
                .padding(.horizontal)

                // Toggle
                SlidingToggle(
                    selectedTab: $selectedTab,
                    pendingIncomingCount: viewModel.pendingIncomingCount
                )
                .padding(.horizontal)

                if viewModel.isLoading {
                    ProgressView()
                        .padding(.top, 60)
                } else if currentBookings.isEmpty {
                    VStack(spacing: 8) {
                        Image("TabBooking")
                            .renderingMode(.template)
                            .resizable()
                            .frame(width: 40, height: 40)
                            .foregroundColor(ForMe.textTertiary)
                            .padding(.bottom, 4)
                        Text(emptyTitle)
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(ForMe.textSecondary)
                        Text(emptySubtitle)
                            .font(.caption)
                            .foregroundColor(ForMe.textTertiary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, UIScreen.main.bounds.height * 0.2)
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(Array(currentBookings.enumerated()), id: \.element.id) { index, reservation in
                            // Incoming bucket is the source of truth — the
                            // server already knows whether the user is the
                            // listing owner OR an assigned employee, so we
                            // trust its split rather than re-deriving from
                            // listing.userId (which misses the employee case).
                            let isIncoming = selectedTab == .incoming
                            BookingCard(
                                reservation: reservation,
                                isIncoming: isIncoming,
                                onCancel: {
                                    Task { await viewModel.cancelReservation(id: reservation.id) }
                                },
                                onAccept: {
                                    Task { await viewModel.updateReservationStatus(id: reservation.id, status: "confirmed") }
                                },
                                onReject: {
                                    Task { await viewModel.updateReservationStatus(id: reservation.id, status: "cancelled") }
                                },
                                onRefund: {
                                    Task { _ = await viewModel.refundReservation(id: reservation.id) }
                                }
                            )
                            .staggeredFadeIn(index: index)
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .background(ForMe.background)
        .navigationBarHidden(true)
        .refreshable {
            await viewModel.loadReservations()
        }
        .task {
            // If we just completed a booking, retry a few times — the
            // Stripe webhook may not have inserted the reservation yet.
            if appState.pendingBookingRefresh {
                appState.pendingBookingRefresh = false
                await viewModel.loadWithPostBookingRetry()
            } else {
                await viewModel.loadReservations()
            }
        }
        .sheet(isPresented: $showMessages) {
            NavigationStack {
                MessagesListView()
            }
        }
    }

    var currentBookings: [Reservation] {
        // Reservation.date is midnight UTC of the booking day (time is a
        // separate string field). Compare at day granularity in the user's
        // local calendar so a booking for "today" stays under Upcoming all
        // day instead of flipping to Past at local midnight UTC offsets.
        let todayStart = Calendar.current.startOfDay(for: Date())
        switch selectedTab {
        case .upcoming:
            return viewModel.outgoing.filter { r in
                guard let day = reservationDay(from: r.date) else { return true }
                return day >= todayStart
            }
        case .past:
            return viewModel.outgoing.filter { r in
                guard let day = reservationDay(from: r.date) else { return false }
                return day < todayStart
            }
        case .incoming:
            // Web doesn't split incoming by time — pending requests for past
            // dates still need to be visible (e.g. a no-show to refund).
            return viewModel.incoming
        }
    }

    private var emptyTitle: String {
        switch selectedTab {
        case .upcoming: return "Nothing scheduled yet"
        case .past: return "No past visits"
        case .incoming: return "No incoming requests"
        }
    }

    private var emptySubtitle: String {
        switch selectedTab {
        case .upcoming: return "Book a service and it'll show up here"
        case .past: return "Your completed bookings will appear here"
        case .incoming: return "When customers book your services, you'll see them here"
        }
    }

    private func reservationDay(from dateStr: String?) -> Date? {
        guard let s = dateStr, s.count >= 10 else { return nil }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.timeZone = .current
        return f.date(from: String(s.prefix(10)))
    }
}

struct BookingCard: View {
    let reservation: Reservation
    let isIncoming: Bool
    let onCancel: () -> Void
    var onAccept: (() -> Void)? = nil
    var onReject: (() -> Void)? = nil
    var onRefund: (() -> Void)? = nil

    @State private var showCancelConfirm = false
    @State private var showRejectConfirm = false
    @State private var showRefundConfirm = false

    // Parsed booking date (from reservation.date ISO string) in the user's
    // local calendar. Nil if the string can't be parsed.
    private var bookingDate: Date? {
        guard let s = reservation.date else { return nil }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = iso.date(from: s) { return d }
        let simple = DateFormatter()
        simple.dateFormat = "yyyy-MM-dd"
        simple.timeZone = .current
        return simple.date(from: String(s.prefix(10)))
    }

    private var employeeName: String? {
        guard let empId = reservation.employeeId,
              let employees = reservation.listing?.employees else { return nil }
        return employees.first(where: { $0.id == empId })?.fullName
    }

    private var customerName: String { reservation.user?.name ?? "Customer" }

    private var isToday: Bool {
        guard let d = bookingDate else { return false }
        return Calendar.current.isDateInToday(d)
    }

    private var isPast: Bool {
        guard let d = bookingDate else { return false }
        return d < Calendar.current.startOfDay(for: Date())
    }

    private var showAcceptDeclineBar: Bool {
        isIncoming && reservation.status == .pending && !isPast
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                dateBlock

                // Hairline vertical divider with gradient fade.
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [ForMe.stone200.opacity(0), ForMe.stone200.opacity(0.8), ForMe.stone200.opacity(0)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: 1)

                mainContent
            }

            if showAcceptDeclineBar { acceptDeclineBar }
        }
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(ForMe.surface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(ForMe.stone200.opacity(0.7), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .elevation(.level2)
        .confirmationDialog("Cancel Booking?", isPresented: $showCancelConfirm) {
            Button("Cancel Booking", role: .destructive, action: onCancel)
            Button("Keep Booking", role: .cancel) {}
        }
        .confirmationDialog("Decline this booking?", isPresented: $showRejectConfirm) {
            Button("Decline", role: .destructive) { onReject?() }
            Button("Keep", role: .cancel) {}
        }
        .confirmationDialog(refundDialogTitle, isPresented: $showRefundConfirm, titleVisibility: .visible) {
            Button(isIncoming ? "Issue Refund" : "Request Refund", role: .destructive) { onRefund?() }
            Button("Keep", role: .cancel) {}
        } message: {
            Text(refundDialogMessage)
        }
    }

    private var refundDialogTitle: String {
        isIncoming ? "Issue refund?" : "Request a refund?"
    }

    private var refundDialogMessage: String {
        isIncoming
            ? "This will refund the customer's payment via Stripe immediately."
            : "The business owner will be notified and can approve your refund."
    }

    // MARK: Date block (left column)

    private var dateBlock: some View {
        ZStack {
            LinearGradient(
                colors: [ForMe.stone50.opacity(0.8), ForMe.surface],
                startPoint: .top,
                endPoint: .bottom
            )
            VStack(spacing: 0) {
                Text(monthLabel)
                    .font(ForMe.font(.medium, size: 11))
                    .foregroundColor(ForMe.stone400)
                Text(dayLabel)
                    .font(ForMe.font(.semibold, size: 34))
                    .foregroundColor(ForMe.textPrimary)
                    .monospacedDigit()
                    .padding(.top, 6)
                Text(weekdayLabel)
                    .font(ForMe.font(.medium, size: 11))
                    .foregroundColor(ForMe.stone400)
                    .padding(.top, 8)
            }
            .padding(.vertical, 24)
        }
        .frame(width: 96)
        .frame(maxHeight: .infinity)
    }

    // MARK: Main content (right column)

    private var mainContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Top row — status + title on left, price + time on right.
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 6) {
                        Text(statusLabel)
                            .font(.system(size: 11, design: .serif))
                            .italic()
                            .foregroundColor(statusTextColor)
                        if isToday && !isPast {
                            Text("· Today")
                                .font(.system(size: 11, design: .serif))
                                .italic()
                                .foregroundColor(Color(hex: "D97706")) // amber-600
                        }
                    }

                    Text(reservation.serviceName ?? "Service")
                        .font(ForMe.font(.semibold, size: 18))
                        .tracking(-0.27)
                        .foregroundColor(ForMe.textPrimary)
                        .lineLimit(1)

                    Text(subtitleText)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.stone500)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .trailing, spacing: 4) {
                    Text(priceText)
                        .font(ForMe.font(.bold, size: 26))
                        .tracking(-0.5)
                        .monospacedDigit()
                        .foregroundColor(isRefunded ? ForMe.stone400 : ForMe.textPrimary)
                        .strikethrough(isRefunded, color: ForMe.stone400)
                    if let time = reservation.time {
                        Text(formatTime(time))
                            .font(ForMe.font(.medium, size: 11))
                            .foregroundColor(ForMe.stone400)
                    }
                }
            }

            // Bottom row — avatar + "with {employee}" / address / listing.
            HStack(spacing: 12) {
                avatar
                Text(bottomRowText)
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.stone500)
                    .lineLimit(1)
                Spacer(minLength: 0)

                if let badge = refundBadgeText {
                    Text(badge)
                        .font(ForMe.font(.semibold, size: 10))
                        .tracking(0.5)
                        .textCase(.uppercase)
                        .foregroundColor(ForMe.stone500)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(ForMe.stone100))
                } else if showRefundButton {
                    Button {
                        Haptics.warning()
                        showRefundConfirm = true
                    } label: {
                        Text("Refund")
                            .font(ForMe.font(.semibold, size: 11))
                            .foregroundColor(ForMe.stone600)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(
                                Capsule().stroke(ForMe.stone200, lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                }

                // Outgoing flow still needs a way to cancel — small chevron
                // opens the confirm dialog. Incoming+pending uses the full
                // accept/decline bar below instead.
                if showOutgoingCancel {
                    Button {
                        showCancelConfirm = true
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(ForMe.stone400)
                            .frame(width: 28, height: 28)
                            .background(
                                Circle()
                                    .stroke(ForMe.stone200, lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.top, 8)
            .overlay(alignment: .top) {
                Rectangle()
                    .fill(ForMe.stone100)
                    .frame(height: 1)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 20)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var avatar: some View {
        AsyncImage(url: AssetURL.resolve(reservation.listing?.imageSrc)) { phase in
            switch phase {
            case .success(let image):
                image.resizable().aspectRatio(contentMode: .fill)
            default:
                Rectangle().fill(ForMe.stone100)
                    .overlay(
                        Image(systemName: reservation.listing?.categoryIcon ?? "sparkles")
                            .font(.system(size: 12))
                            .foregroundColor(ForMe.stone400)
                    )
            }
        }
        .frame(width: 32, height: 32)
        .clipShape(Circle())
        .overlay(Circle().stroke(ForMe.stone200.opacity(0.6), lineWidth: 1))
    }

    // MARK: Accept / Decline bar (incoming pending only)

    private var acceptDeclineBar: some View {
        HStack(spacing: 8) {
            Button {
                showRejectConfirm = true
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "xmark")
                        .font(.system(size: 11, weight: .bold))
                    Text("Decline")
                        .font(ForMe.font(.semibold, size: 12))
                }
                .foregroundColor(ForMe.stone600)
                .frame(maxWidth: .infinity)
                .frame(height: 32)
                .background(
                    Capsule()
                        .fill(ForMe.surface)
                        .overlay(Capsule().stroke(ForMe.stone200, lineWidth: 1))
                )
            }
            .buttonStyle(.plain)

            Button {
                onAccept?()
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .bold))
                    Text("Accept")
                        .font(ForMe.font(.semibold, size: 12))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 32)
                .background(
                    Capsule().fill(
                        LinearGradient(
                            colors: [Color(hex: "10B981"), Color(hex: "059669")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                )
                .overlay(
                    Capsule().stroke(Color(hex: "10B981").opacity(0.6), lineWidth: 1)
                )
                .shadow(color: Color(hex: "10B981").opacity(0.45), radius: 6, y: 2)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(
            LinearGradient(
                colors: [Color(hex: "FFFBEB").opacity(0.4), ForMe.surface],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .overlay(alignment: .top) {
            Rectangle().fill(ForMe.stone100).frame(height: 1)
        }
    }

    // MARK: Computed labels

    private var monthLabel: String { format(bookingDate, "MMM") }
    private var dayLabel: String   { format(bookingDate, "d") }
    private var weekdayLabel: String { format(bookingDate, "EEE") }

    private func format(_ date: Date?, _ pattern: String) -> String {
        guard let date = date else { return "" }
        let f = DateFormatter()
        f.dateFormat = pattern
        return f.string(from: date)
    }

    // Times are stored as either "HH:mm" (24h) or "h:mm AM/PM" depending
    // on how the reservation was created — normalize to "h:mm AM/PM".
    private func formatTime(_ time: String) -> String {
        let trimmed = time.trimmingCharacters(in: .whitespaces)
        if trimmed.uppercased().contains("AM") || trimmed.uppercased().contains("PM") {
            return trimmed
        }
        let in24 = DateFormatter()
        in24.dateFormat = "HH:mm"
        let out = DateFormatter()
        out.dateFormat = "h:mm a"
        if let d = in24.date(from: trimmed) { return out.string(from: d) }
        return trimmed
    }

    private var subtitleText: String {
        let title = reservation.listing?.title ?? ""
        return isIncoming ? "\(customerName) · \(title)" : title
    }

    private var bottomRowText: String {
        if !isIncoming, let name = employeeName { return "with \(name)" }
        if !isIncoming, let address = reservation.listing?.address { return address }
        if isIncoming, let name = reservation.user?.name { return name }
        return reservation.listing?.title ?? ""
    }

    private var priceText: String {
        guard let p = reservation.totalPrice else { return "$0" }
        return p == p.rounded() ? "$\(Int(p))" : String(format: "$%.2f", p)
    }

    private var isRefunded: Bool {
        reservation.paymentStatus == "refunded"
    }

    /// "Refund" pill shows only for paid bookings that haven't already been
    /// refunded or have a pending request. Both customer (request) and
    /// listing-owner (immediate) can press it; the server branches by role.
    private var showRefundButton: Bool {
        guard reservation.paymentStatus == "completed" else { return false }
        guard reservation.refundStatus != "completed" else { return false }
        guard reservation.refundStatus != "requested" else { return false }
        return onRefund != nil
    }

    private var refundBadgeText: String? {
        switch reservation.refundStatus {
        case "completed": return "Refunded"
        case "requested": return "Refund pending"
        default: return nil
        }
    }

    private var showOutgoingCancel: Bool {
        !isIncoming && (reservation.status == .pending
                        || reservation.status == .confirmed
                        || reservation.status == .accepted)
            && !isPast
    }

    // MARK: Status styling

    private var statusLabel: String {
        switch reservation.status {
        case .confirmed, .accepted: return "Confirmed"
        case .pending: return "Pending"
        case .declined: return "Declined"
        case .cancelled: return "Cancelled"
        case .completed: return "Completed"
        case .unknown: return "—"
        }
    }

    // Matches web's ROW_TEXT_COLORS — italic serif status label is tinted
    // by the reservation state.
    private var statusTextColor: Color {
        switch reservation.status {
        case .confirmed, .accepted: return Color(hex: "047857")  // emerald-700
        case .pending:              return Color(hex: "B45309")  // amber-700
        case .declined:             return ForMe.stone500
        case .cancelled:            return ForMe.stone400
        case .completed:            return Color(hex: "1D4ED8")  // blue-700
        case .unknown:              return ForMe.stone400
        }
    }
}

struct StatusBadge: View {
    let status: ReservationStatus?

    var body: some View {
        Text(status?.rawValue.capitalized ?? "Unknown")
            .font(.caption2.bold())
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                LinearGradient(
                    colors: [statusColor.opacity(0.15), statusColor.opacity(0.08)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(statusColor)
            .cornerRadius(6)
    }

    var statusColor: Color {
        switch status {
        case .confirmed, .accepted: return ForMe.statusConfirmed
        case .pending: return ForMe.statusPending
        case .declined, .cancelled: return ForMe.statusCancelled
        case .completed: return ForMe.statusCompleted
        case .unknown: return ForMe.statusClosed
        case nil: return ForMe.statusClosed
        }
    }
}

private struct SlidingToggle: View {
    @Binding var selectedTab: BookingTab
    let pendingIncomingCount: Int
    @Namespace private var toggleNamespace

    var body: some View {
        HStack(spacing: 4) {
            ForEach(BookingTab.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = tab
                    }
                } label: {
                    HStack(spacing: 6) {
                        Text(tab.title)
                            .font(ForMe.font(selectedTab == tab ? .semibold : .medium, size: 13))
                            .foregroundColor(selectedTab == tab ? .white : ForMe.textSecondary)

                        // Pending-incoming badge on the Incoming tab — same
                        // signal web uses (an "Action needed" cue that draws
                        // the worker back into the queue).
                        if tab == .incoming && pendingIncomingCount > 0 {
                            Text("\(pendingIncomingCount)")
                                .font(ForMe.font(.semibold, size: 11))
                                .foregroundColor(selectedTab == tab ? .white : Color(hex: "B45309"))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(
                                    Capsule().fill(
                                        selectedTab == tab
                                            ? Color.white.opacity(0.22)
                                            : Color(hex: "FEF3C7")
                                    )
                                )
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 13)
                    .background {
                        if selectedTab == tab {
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .fill(ForMe.textPrimary)
                                .matchedGeometryEffect(id: "toggle", in: toggleNamespace)
                        }
                    }
                }
            }
        }
        .padding(4)
        .background(Color(hex: "F7F7F6"))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL))
        .elevation(.level1)
    }
}

#Preview {
    BookingsView()
}
