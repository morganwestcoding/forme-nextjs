import SwiftUI

@MainActor
class MemberPayDetailViewModel: ObservableObject {
    let member: TeamMember
    let isOwner: Bool
    let isSelf: Bool

    @Published var agreement: TeamPayAgreement?
    @Published var balance: PayBalance?
    @Published var periods: [PayPeriod] = []
    @Published var payouts: [Payout] = []
    @Published var stripePayoutsEnabled = false
    @Published var isLoading = false
    @Published var actionInFlight = false
    @Published var errorMessage: String?

    private let api = APIService.shared

    init(member: TeamMember, isOwner: Bool, isSelf: Bool) {
        self.member = member
        self.isOwner = isOwner
        self.isSelf = isSelf
        self.agreement = member.payAgreement
    }

    /// Pending payouts the owner can act on. Sorted oldest-first so the
    /// queue acts like FIFO when there are several.
    var pendingPayouts: [Payout] {
        payouts.filter { $0.status == "pending" }.sorted { $0.requestedAt < $1.requestedAt }
    }

    /// Whether the employee can submit a payout request right now. Server
    /// requires `stripeConnectPayoutsEnabled` on the user, so we mirror that
    /// gate here. `member.stripeConnectSetup` from team/data may be missing,
    /// so the live `getStripeConnectStatus` fetch in `load()` is the source
    /// of truth.
    var canRequestPayout: Bool {
        guard isSelf else { return false }
        guard agreement != nil else { return false }
        guard stripePayoutsEnabled else { return false }
        return (balance?.availableBalance ?? 0) > 0
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }

        // Fetch agreement, balance, periods, payouts in parallel. Failures
        // on individual slices shouldn't blank the whole sheet — best-effort
        // each.
        async let agreementTask: TeamPayAgreement? = {
            do { return try await api.getPayAgreement(employeeId: member.id) }
            catch { return nil }
        }()
        async let balanceTask: PayBalance? = {
            do { return try await api.getPayBalance(employeeId: member.id) }
            catch { return nil }
        }()
        async let periodsTask: [PayPeriod] = {
            do { return try await api.getPayPeriods(employeeId: member.id) }
            catch { return [] }
        }()
        async let payoutsTask: [Payout] = {
            do { return try await api.getPayouts(employeeId: member.id) }
            catch { return [] }
        }()
        // Employee viewing their own pay: also fetch live Stripe Connect
        // status so the "Request payout" button gates correctly. Owner
        // viewing an employee can't initiate payouts, so this is skipped.
        async let stripeTask: Bool = {
            guard isSelf else { return false }
            do {
                let status = try await api.getStripeConnectStatus()
                return status.payoutsEnabled
            } catch {
                return false
            }
        }()

        let (a, b, p, po, s) = await (agreementTask, balanceTask, periodsTask, payoutsTask, stripeTask)
        agreement = a ?? agreement
        balance = b
        periods = p
        payouts = po
        stripePayoutsEnabled = s
    }

    /// Owner-only. Save or replace the pay agreement.
    func saveAgreement(
        type: String,
        splitPercent: Double?,
        rentalAmount: Double?,
        rentalFrequency: String?,
        autoApprovePayout: Bool
    ) async -> Bool {
        actionInFlight = true
        defer { actionInFlight = false }
        do {
            let updated = try await api.setPayAgreement(
                employeeId: member.id,
                type: type,
                splitPercent: splitPercent,
                rentalAmount: rentalAmount,
                rentalFrequency: rentalFrequency,
                autoApprovePayout: autoApprovePayout
            )
            agreement = updated
            // Balance depends on agreement (commission split changes earnings),
            // so refetch it.
            balance = try? await api.getPayBalance(employeeId: member.id)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    /// Owner-only. Generate a new pay period (chair_rental only).
    func generatePeriod() async -> Bool {
        actionInFlight = true
        defer { actionInFlight = false }
        do {
            let new = try await api.generatePayPeriod(employeeId: member.id)
            periods.insert(new, at: 0)
            balance = try? await api.getPayBalance(employeeId: member.id)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    /// Owner-only. Waive or recharge a period.
    func actOnPeriod(_ period: PayPeriod, action: String, reason: String? = nil) async -> Bool {
        actionInFlight = true
        defer { actionInFlight = false }
        do {
            let result = try await api.updatePayPeriodStatus(periodId: period.id, action: action, reason: reason)
            if let idx = periods.firstIndex(where: { $0.id == period.id }) {
                let p = periods[idx]
                let isWaived = result.status == "waived"
                periods[idx] = PayPeriod(
                    id: p.id,
                    periodStart: p.periodStart,
                    periodEnd: p.periodEnd,
                    feeAmount: p.feeAmount,
                    status: result.status,
                    waivedAt: isWaived ? Date() : nil,
                    waivedReason: isWaived ? reason : nil
                )
            }
            balance = try? await api.getPayBalance(employeeId: member.id)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    /// Owner-only. Approve or deny a pending payout.
    func decidePayout(_ payout: Payout, action: String, note: String? = nil) async -> Bool {
        actionInFlight = true
        defer { actionInFlight = false }
        do {
            let result = try await api.decidePayout(payoutId: payout.id, action: action, note: note)
            if let idx = payouts.firstIndex(where: { $0.id == payout.id }) {
                let p = payouts[idx]
                payouts[idx] = Payout(
                    id: p.id,
                    amount: p.amount,
                    status: result.status,
                    note: note ?? p.note,
                    requestedAt: p.requestedAt,
                    processedAt: Date()
                )
            }
            balance = try? await api.getPayBalance(employeeId: member.id)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    /// Employee-only. Submit a payout request.
    func requestPayout(amount: Double, note: String?) async -> Bool {
        actionInFlight = true
        defer { actionInFlight = false }
        do {
            let response = try await api.requestPayout(employeeId: member.id, amount: amount, note: note)
            let new = Payout(
                id: response.id,
                amount: response.amount,
                status: response.status,
                note: note,
                requestedAt: Date(),
                processedAt: response.status == "completed" ? Date() : nil
            )
            payouts.insert(new, at: 0)
            balance = try? await api.getPayBalance(employeeId: member.id)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
