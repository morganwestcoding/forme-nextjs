import SwiftUI

/// Per-member pay details: agreement editor, balance breakdown, pay-period
/// list (chair-rental only), and payout history. Owners see everything;
/// employees see read-only summary + a "Request payout" entry when their
/// agreement and Stripe Connect are both ready.
struct MemberPayDetailSheet: View {
    @StateObject private var viewModel: MemberPayDetailViewModel
    let onDismissed: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var activeSheet: ActiveSheet?

    /// One enum drives all child sheets so we don't stack three `.sheet`
    /// modifiers on the same view (a historical flake source in SwiftUI).
    private enum ActiveSheet: Identifiable {
        case editAgreement
        case requestPayout
        case denyPayout(Payout)

        var id: String {
            switch self {
            case .editAgreement: return "edit-agreement"
            case .requestPayout: return "request-payout"
            case .denyPayout(let p): return "deny-\(p.id)"
            }
        }
    }

    /// The VM is constructed inside `init` via `_viewModel = StateObject(...)`
    /// rather than passed in, so that re-renders of the presenter (TeamView)
    /// don't recreate the VM and lose loaded state mid-sheet.
    init(member: TeamMember, isOwner: Bool, isSelf: Bool, onDismissed: @escaping () -> Void) {
        _viewModel = StateObject(
            wrappedValue: MemberPayDetailViewModel(member: member, isOwner: isOwner, isSelf: isSelf)
        )
        self.onDismissed = onDismissed
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: ForMe.space4) {
                    header

                    if viewModel.isLoading && viewModel.balance == nil {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 60)
                    } else {
                        agreementCard
                        balanceCard

                        if viewModel.isOwner, !viewModel.pendingPayouts.isEmpty {
                            pendingPayoutsSection
                        }

                        if (viewModel.agreement?.type ?? "") == "chair_rental" {
                            periodsSection
                        }

                        payoutHistorySection
                    }
                }
                .padding(.horizontal)
                .padding(.top, ForMe.space3)
                .padding(.bottom, 40)
            }
            .background(ForMe.background)
            .navigationTitle(viewModel.member.fullName.split(separator: " ").first.map(String.init) ?? viewModel.member.fullName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        onDismissed()
                        dismiss()
                    }
                }
            }
            .sheet(item: $activeSheet) { sheet in
                switch sheet {
                case .editAgreement:
                    PayAgreementEditorSheet(viewModel: viewModel)
                case .requestPayout:
                    RequestPayoutSheet(viewModel: viewModel)
                case .denyPayout(let payout):
                    DenyPayoutSheet(payout: payout) { reason in
                        Task {
                            let ok = await viewModel.decidePayout(payout, action: "deny", note: reason)
                            // Dismiss regardless so an error alert (if any)
                            // surfaces on the parent — alerts attached to a
                            // dismissed sheet don't render.
                            activeSheet = nil
                            if ok { Haptics.warning() }
                        }
                    }
                }
            }
            .task { await viewModel.load() }
            .alert("Couldn't update pay", isPresented: Binding(
                get: { viewModel.errorMessage != nil },
                set: { if !$0 { viewModel.errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: ForMe.space3) {
            DynamicAvatar(
                name: viewModel.member.fullName,
                imageUrl: viewModel.member.user?.image,
                size: .medium
            )
            VStack(alignment: .leading, spacing: 2) {
                Text(viewModel.member.fullName)
                    .font(ForMe.font(.semibold, size: 16))
                    .foregroundColor(ForMe.textPrimary)
                if let title = viewModel.member.jobTitle {
                    Text(title)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textTertiary)
                }
            }
            Spacer()
        }
    }

    // MARK: - Agreement card

    private var agreementCard: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            HStack {
                Text("Pay agreement")
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                if viewModel.isOwner {
                    Button {
                        Haptics.tap()
                        activeSheet = .editAgreement
                    } label: {
                        Text(viewModel.agreement == nil ? "Set up" : "Edit")
                            .font(ForMe.font(.medium, size: 12))
                            .foregroundColor(ForMe.textPrimary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(ForMe.stone100)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }

            if let agreement = viewModel.agreement {
                VStack(alignment: .leading, spacing: 6) {
                    Text(agreementSummary(agreement))
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.textSecondary)
                    if agreement.autoApprovePayout {
                        Label("Auto-approve payouts", systemImage: "bolt.fill")
                            .font(ForMe.font(.medium, size: 11))
                            .foregroundColor(ForMe.statusConfirmed)
                    }
                }
            } else {
                Text(viewModel.isOwner
                     ? "Tap Set up to define how this team member is paid."
                     : "No pay agreement set up. Message your manager to configure pay.")
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.stone400)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .forMeCard()
    }

    private func agreementSummary(_ a: TeamPayAgreement) -> String {
        switch a.type {
        case "commission":
            let pct = a.splitPercent.map { Int($0) } ?? 0
            return "\(pct)% commission split"
        case "chair_rental":
            let amt = a.rentalAmount.map { String(format: "%.2f", $0) } ?? "0"
            let freq = a.rentalFrequency ?? "weekly"
            return "$\(amt) per \(freq) chair rental"
        default:
            return a.type
        }
    }

    // MARK: - Balance card

    @ViewBuilder
    private var balanceCard: some View {
        if let balance = viewModel.balance {
            VStack(alignment: .leading, spacing: ForMe.space3) {
                Text("Balance")
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)

                HStack(alignment: .firstTextBaseline) {
                    Text(currency(balance.availableBalance))
                        .font(ForMe.font(.bold, size: 32))
                        .foregroundColor(ForMe.textPrimary)
                    Text("available")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.stone400)
                }

                VStack(spacing: 8) {
                    breakdownRow("Total revenue", balance.totalRevenue)
                    if balance.commissionTaken > 0 {
                        breakdownRow("Commission to shop", -balance.commissionTaken)
                    }
                    if balance.totalRentalFees > 0 {
                        breakdownRow("Rental fees charged", -balance.totalRentalFees)
                    }
                    if balance.pendingRentalFees > 0 {
                        breakdownRow("Rental fees pending", -balance.pendingRentalFees, isPending: true)
                    }
                    if balance.totalPaidOut > 0 {
                        breakdownRow("Already paid out", -balance.totalPaidOut)
                    }
                    if balance.totalPendingPayouts > 0 {
                        breakdownRow("Pending payouts", -balance.totalPendingPayouts, isPending: true)
                    }
                }
                .padding(.top, 4)

                if viewModel.isSelf {
                    Button {
                        Haptics.tap()
                        activeSheet = .requestPayout
                    } label: {
                        Text("Request payout")
                    }
                    .buttonStyle(ForMeAccentButtonStyle())
                    .disabled(!viewModel.canRequestPayout)
                    .padding(.top, 4)

                    if !viewModel.canRequestPayout {
                        Text(payoutGateReason)
                            .font(ForMe.font(.regular, size: 11))
                            .foregroundColor(ForMe.stone400)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .forMeCard()
        }
    }

    private var payoutGateReason: String {
        if viewModel.agreement == nil {
            return "Pay agreement is not set up yet."
        }
        if !viewModel.stripePayoutsEnabled {
            return "Set up your payout account in Settings → Payouts first."
        }
        return "No funds available right now."
    }

    private func breakdownRow(_ label: String, _ value: Double, isPending: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(isPending ? ForMe.stone400 : ForMe.textSecondary)
            Spacer()
            Text(currency(value))
                .font(ForMe.font(.medium, size: 12))
                .foregroundColor(value < 0 ? ForMe.statusCancelled : ForMe.textPrimary)
        }
    }

    // MARK: - Pending payouts (owner)

    private var pendingPayoutsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            Text("Pending approvals")
                .font(ForMe.font(.semibold, size: 14))
                .foregroundColor(ForMe.textPrimary)

            VStack(spacing: 8) {
                ForEach(viewModel.pendingPayouts) { payout in
                    pendingPayoutRow(payout)
                }
            }
        }
    }

    private func pendingPayoutRow(_ payout: Payout) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(currency(payout.amount))
                    .font(ForMe.font(.semibold, size: 16))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                Text(relativeTime(payout.requestedAt))
                    .font(ForMe.font(.regular, size: 11))
                    .foregroundColor(ForMe.stone400)
            }
            if let note = payout.note, !note.isEmpty {
                Text(note)
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.textSecondary)
            }
            HStack(spacing: 8) {
                Button {
                    Haptics.confirm()
                    Task {
                        let ok = await viewModel.decidePayout(payout, action: "approve")
                        if ok { Haptics.success() }
                    }
                } label: {
                    Text("Approve")
                }
                .buttonStyle(ForMeAccentButtonStyle())
                .disabled(viewModel.actionInFlight)

                Button {
                    Haptics.tap()
                    activeSheet = .denyPayout(payout)
                } label: {
                    Text("Deny")
                }
                .buttonStyle(ForMeSecondaryButtonStyle())
                .disabled(viewModel.actionInFlight)
            }
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.statusPending.opacity(0.4), lineWidth: 1)
        )
    }

    // MARK: - Pay periods (chair rental)

    private var periodsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            HStack {
                Text("Rental periods")
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                if viewModel.isOwner {
                    Button {
                        Haptics.tap()
                        Task {
                            let ok = await viewModel.generatePeriod()
                            if ok { Haptics.success() }
                        }
                    } label: {
                        Text("Generate")
                            .font(ForMe.font(.medium, size: 12))
                            .foregroundColor(ForMe.textPrimary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(ForMe.stone100)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .disabled(viewModel.actionInFlight)
                }
            }

            if viewModel.periods.isEmpty {
                Text("No rental periods yet")
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 24)
            } else {
                VStack(spacing: 8) {
                    ForEach(viewModel.periods) { period in
                        periodRow(period)
                    }
                }
            }
        }
    }

    private func periodRow(_ period: PayPeriod) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(periodRange(period))
                    .font(ForMe.font(.medium, size: 13))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                Text(currency(period.feeAmount))
                    .font(ForMe.font(.semibold, size: 13))
                    .foregroundColor(period.status == "waived" ? ForMe.stone400 : ForMe.textPrimary)
                    .strikethrough(period.status == "waived")
            }
            HStack(spacing: 8) {
                periodStatusPill(period.status)
                if let reason = period.waivedReason, period.status == "waived" {
                    Text(reason)
                        .font(ForMe.font(.regular, size: 11))
                        .foregroundColor(ForMe.stone400)
                        .lineLimit(1)
                }
                Spacer()
                if viewModel.isOwner {
                    if period.status == "charged" {
                        Button {
                            Haptics.tap()
                            Task {
                                let ok = await viewModel.actOnPeriod(period, action: "waive")
                                if ok { Haptics.confirm() }
                            }
                        } label: {
                            Text("Waive")
                                .font(ForMe.font(.medium, size: 11))
                                .foregroundColor(ForMe.textSecondary)
                        }
                        .buttonStyle(.plain)
                        .disabled(viewModel.actionInFlight)
                    } else if period.status == "waived" {
                        Button {
                            Haptics.tap()
                            Task {
                                let ok = await viewModel.actOnPeriod(period, action: "charge")
                                if ok { Haptics.confirm() }
                            }
                        } label: {
                            Text("Recharge")
                                .font(ForMe.font(.medium, size: 11))
                                .foregroundColor(ForMe.textSecondary)
                        }
                        .buttonStyle(.plain)
                        .disabled(viewModel.actionInFlight)
                    }
                }
            }
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    private func periodStatusPill(_ status: String) -> some View {
        let (label, color): (String, Color) = {
            switch status {
            case "charged": return ("Charged", ForMe.statusCancelled)
            case "waived": return ("Waived", ForMe.statusConfirmed)
            case "pending": return ("Pending", ForMe.statusPending)
            default: return (status.capitalized, ForMe.stone400)
            }
        }()
        return Text(label)
            .font(ForMe.font(.medium, size: 10))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    // MARK: - Payout history

    private var payoutHistorySection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            Text("Payout history")
                .font(ForMe.font(.semibold, size: 14))
                .foregroundColor(ForMe.textPrimary)

            let history = viewModel.payouts.filter { $0.status != "pending" || !viewModel.isOwner }
            if history.isEmpty {
                Text("No payouts yet")
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 24)
            } else {
                VStack(spacing: 8) {
                    ForEach(history) { payout in
                        payoutHistoryRow(payout)
                    }
                }
            }
        }
    }

    private func payoutHistoryRow(_ payout: Payout) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(currency(payout.amount))
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                payoutStatusPill(payout.status)
            }
            HStack(spacing: 6) {
                Text(absoluteDate(payout.requestedAt))
                    .font(ForMe.font(.regular, size: 11))
                    .foregroundColor(ForMe.stone400)
                if let note = payout.note, !note.isEmpty {
                    Text("·").foregroundColor(ForMe.stone400)
                    Text(note)
                        .font(ForMe.font(.regular, size: 11))
                        .foregroundColor(ForMe.textSecondary)
                        .lineLimit(1)
                }
            }
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    private func payoutStatusPill(_ status: String) -> some View {
        let (label, color): (String, Color) = {
            switch status {
            case "completed": return ("Completed", ForMe.statusConfirmed)
            case "approved", "processing": return ("Processing", ForMe.statusPending)
            case "denied": return ("Denied", ForMe.statusCancelled)
            case "pending": return ("Pending", ForMe.statusPending)
            default: return (status.capitalized, ForMe.stone400)
            }
        }()
        return Text(label)
            .font(ForMe.font(.medium, size: 10))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    // MARK: - Formatting helpers

    private func currency(_ value: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = "USD"
        f.maximumFractionDigits = 2
        return f.string(from: NSNumber(value: value)) ?? "$\(value)"
    }

    private func periodRange(_ period: PayPeriod) -> String {
        let f = DateFormatter()
        f.dateFormat = "MMM d"
        return "\(f.string(from: period.periodStart)) – \(f.string(from: period.periodEnd))"
    }

    private func absoluteDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .none
        return f.string(from: date)
    }

    private func relativeTime(_ date: Date) -> String {
        let f = RelativeDateTimeFormatter()
        f.unitsStyle = .short
        return f.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Pay agreement editor

struct PayAgreementEditorSheet: View {
    @ObservedObject var viewModel: MemberPayDetailViewModel

    @Environment(\.dismiss) private var dismiss
    @State private var type: String = "commission"
    @State private var splitPercent: Double = 60
    @State private var rentalAmount: String = ""
    @State private var rentalFrequency: String = "weekly"
    @State private var autoApprovePayout: Bool = false
    @State private var seeded = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: ForMe.space4) {
                    typePicker

                    if type == "commission" {
                        commissionEditor
                    } else {
                        rentalEditor
                    }

                    Toggle(isOn: $autoApprovePayout) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Auto-approve payouts")
                                .font(ForMe.font(.medium, size: 13))
                                .foregroundColor(ForMe.textPrimary)
                            Text("Payouts process immediately without manual approval.")
                                .font(ForMe.font(.regular, size: 11))
                                .foregroundColor(ForMe.stone400)
                        }
                    }
                    .tint(ForMe.accent)
                    .padding(ForMe.space4)
                    .background(ForMe.surface)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
                }
                .padding(.horizontal)
                .padding(.top, ForMe.space3)
                .padding(.bottom, 40)
            }
            .background(ForMe.background)
            .navigationTitle("Pay agreement")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(viewModel.actionInFlight ? "Saving…" : "Save") { save() }
                        .disabled(!isValid || viewModel.actionInFlight)
                }
            }
            .onAppear { seed() }
        }
    }

    private var typePicker: some View {
        Picker("Type", selection: $type) {
            Text("Commission").tag("commission")
            Text("Chair rental").tag("chair_rental")
        }
        .pickerStyle(.segmented)
    }

    private var commissionEditor: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            HStack(alignment: .firstTextBaseline) {
                Text("Employee keeps")
                    .font(ForMe.font(.medium, size: 13))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                Text("\(Int(splitPercent))%")
                    .font(ForMe.font(.bold, size: 24))
                    .foregroundColor(ForMe.textPrimary)
            }
            Slider(value: $splitPercent, in: 0...100, step: 1)
                .tint(ForMe.accent)
            Text("Shop keeps \(100 - Int(splitPercent))%")
                .font(ForMe.font(.regular, size: 11))
                .foregroundColor(ForMe.stone400)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .forMeCard()
    }

    private var rentalEditor: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Amount")
                    .font(ForMe.font(.medium, size: 13))
                    .foregroundColor(ForMe.textPrimary)
                HStack {
                    Text("$")
                        .font(ForMe.font(.regular, size: 16))
                        .foregroundColor(ForMe.textSecondary)
                    TextField("0.00", text: $rentalAmount)
                        .keyboardType(.decimalPad)
                        .font(ForMe.font(.regular, size: 16))
                        .foregroundColor(ForMe.textPrimary)
                }
                .forMeInput()
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Frequency")
                    .font(ForMe.font(.medium, size: 13))
                    .foregroundColor(ForMe.textPrimary)
                Picker("Frequency", selection: $rentalFrequency) {
                    Text("Daily").tag("daily")
                    Text("Weekly").tag("weekly")
                    Text("Monthly").tag("monthly")
                }
                .pickerStyle(.segmented)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .forMeCard()
    }

    private var isValid: Bool {
        if type == "commission" {
            return splitPercent >= 0 && splitPercent <= 100
        }
        guard let value = Double(rentalAmount), value > 0 else { return false }
        return ["daily", "weekly", "monthly"].contains(rentalFrequency)
    }

    private func seed() {
        guard !seeded else { return }
        seeded = true
        if let a = viewModel.agreement {
            type = a.type
            splitPercent = a.splitPercent ?? 60
            if let amt = a.rentalAmount {
                rentalAmount = String(format: "%.2f", amt)
            }
            rentalFrequency = a.rentalFrequency ?? "weekly"
            autoApprovePayout = a.autoApprovePayout
        }
    }

    private func save() {
        Task {
            let ok: Bool
            if type == "commission" {
                ok = await viewModel.saveAgreement(
                    type: "commission",
                    splitPercent: splitPercent,
                    rentalAmount: nil,
                    rentalFrequency: nil,
                    autoApprovePayout: autoApprovePayout
                )
            } else {
                let amt = Double(rentalAmount) ?? 0
                ok = await viewModel.saveAgreement(
                    type: "chair_rental",
                    splitPercent: nil,
                    rentalAmount: amt,
                    rentalFrequency: rentalFrequency,
                    autoApprovePayout: autoApprovePayout
                )
            }
            if ok {
                Haptics.success()
                dismiss()
            }
        }
    }
}

// MARK: - Request payout (employee)

struct RequestPayoutSheet: View {
    @ObservedObject var viewModel: MemberPayDetailViewModel

    @Environment(\.dismiss) private var dismiss
    @State private var amount: String = ""
    @State private var note: String = ""

    private var available: Double {
        viewModel.balance?.availableBalance ?? 0
    }

    private var parsedAmount: Double? {
        Double(amount).flatMap { $0 > 0 ? $0 : nil }
    }

    private var isValid: Bool {
        guard let value = parsedAmount else { return false }
        return value <= available
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: ForMe.space4) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Available")
                            .font(ForMe.font(.regular, size: 12))
                            .foregroundColor(ForMe.stone400)
                        Text(currency(available))
                            .font(ForMe.font(.bold, size: 28))
                            .foregroundColor(ForMe.textPrimary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .forMeCard()

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Amount")
                            .font(ForMe.font(.medium, size: 13))
                            .foregroundColor(ForMe.textPrimary)
                        HStack {
                            Text("$")
                                .font(ForMe.font(.regular, size: 16))
                                .foregroundColor(ForMe.textSecondary)
                            TextField("0.00", text: $amount)
                                .keyboardType(.decimalPad)
                                .font(ForMe.font(.regular, size: 16))
                                .foregroundColor(ForMe.textPrimary)
                        }
                        .forMeInput()
                        if let value = parsedAmount, value > available {
                            Text("Exceeds available balance.")
                                .font(ForMe.font(.regular, size: 11))
                                .foregroundColor(ForMe.statusCancelled)
                        }
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Note (optional)")
                            .font(ForMe.font(.medium, size: 13))
                            .foregroundColor(ForMe.textPrimary)
                        TextField("e.g. Weekly payout", text: $note)
                            .font(ForMe.font(.regular, size: 14))
                            .foregroundColor(ForMe.textPrimary)
                            .forMeInput()
                    }
                }
                .padding(.horizontal)
                .padding(.top, ForMe.space3)
                .padding(.bottom, 40)
            }
            .background(ForMe.background)
            .navigationTitle("Request payout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(viewModel.actionInFlight ? "Sending…" : "Request") { submit() }
                        .disabled(!isValid || viewModel.actionInFlight)
                }
            }
        }
    }

    private func submit() {
        guard let value = parsedAmount else { return }
        Task {
            let ok = await viewModel.requestPayout(
                amount: value,
                note: note.trimmingCharacters(in: .whitespaces).isEmpty ? nil : note
            )
            if ok {
                Haptics.success()
                dismiss()
            }
        }
    }

    private func currency(_ value: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = "USD"
        f.maximumFractionDigits = 2
        return f.string(from: NSNumber(value: value)) ?? "$\(value)"
    }
}

// MARK: - Deny payout sheet

private struct DenyPayoutSheet: View {
    let payout: Payout
    let onDeny: (String?) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var reason: String = ""

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: ForMe.space4) {
                Text("Deny this payout?")
                    .font(ForMe.font(.semibold, size: 16))
                    .foregroundColor(ForMe.textPrimary)
                Text("The team member will be notified. You can include a reason below.")
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.textSecondary)
                TextField("Optional reason", text: $reason, axis: .vertical)
                    .font(ForMe.font(.regular, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(3...6)
                    .forMeInput()
                Spacer()
            }
            .padding()
            .background(ForMe.background)
            .navigationTitle("Deny payout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Deny", role: .destructive) {
                        let trimmed = reason.trimmingCharacters(in: .whitespaces)
                        onDeny(trimmed.isEmpty ? nil : trimmed)
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }
}
