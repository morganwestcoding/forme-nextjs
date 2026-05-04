import SwiftUI

/// Read-only dispute browser. Web has no dispute resolve/respond endpoint, so
/// this mirrors the SSR `/admin/disputes` table — list with status pills,
/// amount, customer + business + reason. Tap a row to expand details.
struct AdminDisputesView: View {
    @State private var disputes: [AdminDispute] = []
    @State private var isLoading = false
    @State private var error: String?
    @State private var expandedId: String?

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space3) {
                if let error {
                    Text(error)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.statusCancelled)
                        .padding(.horizontal, ForMe.space5)
                }

                if isLoading && disputes.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else if disputes.isEmpty {
                    Text("No disputes found.")
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone400)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else {
                    Text("\(disputes.count) recent disputes")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.stone400)
                        .padding(.horizontal, ForMe.space5)

                    VStack(spacing: 8) {
                        ForEach(disputes) { dispute in
                            row(dispute)
                        }
                    }
                    .padding(.horizontal, ForMe.space5)
                }
            }
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space10)
        }
        .background(ForMe.background)
        .navigationTitle("Disputes")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .refreshable { await load() }
    }

    private func row(_ dispute: AdminDispute) -> some View {
        let isExpanded = expandedId == dispute.id

        return Button {
            Haptics.tap()
            withAnimation(.easeInOut(duration: 0.18)) {
                expandedId = isExpanded ? nil : dispute.id
            }
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    statusPill(dispute.status)
                    Spacer()
                    Text(absoluteDate(dispute.createdAt))
                        .font(ForMe.font(.regular, size: 11))
                        .foregroundColor(ForMe.stone400)
                }

                HStack(alignment: .firstTextBaseline) {
                    Text(formatCents(dispute.amount, currency: dispute.currency))
                        .font(ForMe.font(.bold, size: 18))
                        .foregroundColor(ForMe.textPrimary)
                    Spacer()
                }

                if let reason = dispute.reason, !reason.isEmpty {
                    Text(reason.replacingOccurrences(of: "_", with: " ").capitalized)
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.textSecondary)
                }

                HStack(spacing: 6) {
                    Image(systemName: "person")
                        .font(.system(size: 11))
                        .foregroundColor(ForMe.stone400)
                    Text(dispute.customerName ?? "Unknown customer")
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.textSecondary)
                    if let business = dispute.listingTitle {
                        Text("·").foregroundColor(ForMe.stone400)
                        Text(business)
                            .font(ForMe.font(.regular, size: 12))
                            .foregroundColor(ForMe.textTertiary)
                    }
                }

                if isExpanded {
                    Divider()
                    VStack(alignment: .leading, spacing: 6) {
                        if let service = dispute.serviceName, !service.isEmpty {
                            detailRow(label: "Service", value: service)
                        }
                        if let email = dispute.customerEmail, !email.isEmpty {
                            detailRow(label: "Customer email", value: email)
                        }
                        if let reservationId = dispute.reservationId {
                            detailRow(label: "Reservation", value: reservationId)
                        }
                    }
                    .padding(.top, 4)
                }
            }
            .padding(ForMe.space4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private func detailRow(label: String, value: String) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .font(ForMe.font(.regular, size: 11))
                .foregroundColor(ForMe.stone400)
                .frame(width: 110, alignment: .leading)
            Text(value)
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.textSecondary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
            Spacer(minLength: 0)
        }
    }

    private func statusPill(_ status: String) -> some View {
        let (label, color): (String, Color) = {
            switch status {
            case "needs_response": return ("Needs response", ForMe.statusCancelled)
            case "under_review":   return ("Under review",   ForMe.statusPending)
            case "won":            return ("Won",            ForMe.statusConfirmed)
            case "lost":           return ("Lost",           ForMe.stone500)
            default:               return (status.replacingOccurrences(of: "_", with: " ").capitalized, ForMe.stone400)
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

    // MARK: - Actions

    private func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            disputes = try await APIService.shared.getAdminDisputes()
        } catch {
            self.error = error.localizedDescription
        }
    }

    /// Stripe disputes amounts arrive in the smallest currency unit.
    private func formatCents(_ cents: Int, currency: String) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = currency.uppercased()
        f.maximumFractionDigits = 2
        return f.string(from: NSNumber(value: Double(cents) / 100)) ?? "$\(Double(cents) / 100)"
    }

    private func absoluteDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .none
        return f.string(from: date)
    }
}
