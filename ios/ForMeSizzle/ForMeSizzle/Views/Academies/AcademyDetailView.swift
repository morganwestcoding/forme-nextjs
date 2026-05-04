import SwiftUI

/// Per-academy admin surface: header (name/description/meta), Stripe Connect
/// status entry, services list with create/edit/delete. Entered from
/// `AcademiesAdminListView`. The web routes are admin-gated; this view is
/// reachable only from the admin entry, so we don't role-gate again here —
/// the API will reject anything misrouted.
struct AcademyDetailView: View {
    let academy: Academy

    @State private var services: [Service] = []
    @State private var isLoading = false
    @State private var error: String?
    @State private var activeSheet: ActiveSheet?
    @State private var deleteTarget: Service?

    private enum ActiveSheet: Identifiable {
        case stripeConnect
        case createService
        case editService(Service)

        var id: String {
            switch self {
            case .stripeConnect: return "stripe"
            case .createService: return "create"
            case .editService(let s): return "edit-\(s.id)"
            }
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                header
                payoutsCard
                servicesSection
                if let error {
                    Text(error)
                        .font(ForMe.font(.regular, size: 12))
                        .foregroundColor(ForMe.statusCancelled)
                }
            }
            .padding(.horizontal, ForMe.space5)
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space10)
        }
        .background(ForMe.background)
        .navigationTitle(academy.name)
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .refreshable { await load() }
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .stripeConnect:
                AcademyStripeConnectView(academy: academy)
            case .createService:
                AcademyServiceFormSheet(existing: nil) { name, price, category in
                    await createService(name: name, price: price, category: category)
                }
            case .editService(let service):
                AcademyServiceFormSheet(existing: service) { name, price, category in
                    await updateService(service, name: name, price: price, category: category)
                }
            }
        }
        .confirmationDialog(
            deleteTarget.map { "Delete \"\($0.serviceName)\"?" } ?? "Delete service?",
            isPresented: Binding(
                get: { deleteTarget != nil },
                set: { if !$0 { deleteTarget = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button("Delete", role: .destructive) {
                if let target = deleteTarget {
                    Task { await deleteService(target) }
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This removes the service from the academy listing and strips it from every active student's services.")
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 14) {
                logoView
                VStack(alignment: .leading, spacing: 4) {
                    Text(academy.name)
                        .font(ForMe.font(.bold, size: 20))
                        .foregroundColor(ForMe.textPrimary)
                    if let location = academy.location, !location.isEmpty {
                        Text(location)
                            .font(ForMe.font(.regular, size: 12))
                            .foregroundColor(ForMe.textSecondary)
                    }
                }
                Spacer()
            }

            if let description = academy.description, !description.isEmpty {
                Text(description)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.textSecondary)
            }

            metaRow
        }
    }

    @ViewBuilder
    private var logoView: some View {
        if let logo = academy.logoUrl, let url = URL(string: logo) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(ForMe.stone100)
                }
            }
            .frame(width: 56, height: 56)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
        } else {
            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                .fill(ForMe.stone100)
                .frame(width: 56, height: 56)
                .overlay(
                    Text(String(academy.name.prefix(1)))
                        .font(ForMe.font(.bold, size: 22))
                        .foregroundColor(ForMe.stone500)
                )
        }
    }

    private var metaRow: some View {
        HStack(spacing: 8) {
            if let duration = academy.duration, !duration.isEmpty {
                metaChip(icon: "clock", label: duration)
            }
            if let priceLabel = academy.priceLabel, !priceLabel.isEmpty {
                metaChip(icon: "dollarsign.circle", label: priceLabel)
            }
            if let rating = academy.rating {
                metaChip(icon: "star.fill", label: String(format: "%.1f", rating))
            }
        }
    }

    private func metaChip(icon: String, label: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 11))
            Text(label)
                .font(ForMe.font(.medium, size: 11))
        }
        .foregroundColor(ForMe.textSecondary)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(ForMe.surface)
        .clipShape(Capsule())
        .overlay(
            Capsule().stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    private var payoutsCard: some View {
        Button {
            Haptics.tap()
            activeSheet = .stripeConnect
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(ForMe.stone100)
                        .frame(width: 44, height: 44)
                    Image(systemName: "banknote")
                        .font(.system(size: 18))
                        .foregroundColor(ForMe.stone600)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text("Payouts")
                        .font(ForMe.font(.semibold, size: 14))
                        .foregroundColor(ForMe.textPrimary)
                    Text("Stripe Connect onboarding for this academy")
                        .font(ForMe.font(.regular, size: 11))
                        .foregroundColor(ForMe.stone400)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(ForMe.stone400)
            }
            .padding(ForMe.space4)
            .background(ForMe.surface)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                    .stroke(ForMe.borderLight, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var servicesSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            HStack {
                Text("Services")
                    .font(ForMe.font(.semibold, size: 17))
                    .foregroundColor(ForMe.textPrimary)
                if !services.isEmpty {
                    Text("(\(services.count))")
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone400)
                }
                Spacer()
                Button {
                    Haptics.tap()
                    activeSheet = .createService
                } label: {
                    Label("Add", systemImage: "plus")
                        .font(ForMe.font(.medium, size: 12))
                        .foregroundColor(ForMe.textPrimary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(ForMe.stone100)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)
            }

            if isLoading && services.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else if services.isEmpty {
                Text("No services yet. Add one to seed every active student's menu.")
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 32)
            } else {
                VStack(spacing: 8) {
                    ForEach(services) { service in
                        serviceRow(service)
                    }
                }
            }
        }
    }

    private func serviceRow(_ service: Service) -> some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text(service.serviceName)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                HStack(spacing: 6) {
                    Text(service.formattedPrice)
                        .font(ForMe.font(.medium, size: 12))
                        .foregroundColor(ForMe.textSecondary)
                    if let cat = service.category, !cat.isEmpty {
                        Text("·").foregroundColor(ForMe.stone400)
                        Text(cat)
                            .font(ForMe.font(.regular, size: 12))
                            .foregroundColor(ForMe.textTertiary)
                    }
                }
            }
            Spacer()
            Menu {
                Button {
                    Haptics.tap()
                    activeSheet = .editService(service)
                } label: {
                    Label("Edit", systemImage: "pencil")
                }
                Button(role: .destructive) {
                    Haptics.tap()
                    deleteTarget = service
                } label: {
                    Label("Delete", systemImage: "trash")
                }
            } label: {
                Image(systemName: "ellipsis")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(ForMe.stone500)
                    .frame(width: 32, height: 32)
                    .contentShape(Rectangle())
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

    // MARK: - Actions

    private func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            services = try await APIService.shared.getAcademyServices(academyId: academy.id)
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func createService(name: String, price: Double, category: String) async -> Bool {
        do {
            let new = try await APIService.shared.createAcademyService(
                academyId: academy.id,
                serviceName: name,
                price: price,
                category: category
            )
            // Server orders by name; insert and re-sort locally to match.
            services.append(new)
            services.sort { $0.serviceName.lowercased() < $1.serviceName.lowercased() }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    private func updateService(_ service: Service, name: String, price: Double, category: String) async -> Bool {
        do {
            let updated = try await APIService.shared.updateAcademyService(
                academyId: academy.id,
                serviceId: service.id,
                serviceName: name,
                price: price,
                category: category
            )
            if let idx = services.firstIndex(where: { $0.id == service.id }) {
                services[idx] = updated
            }
            services.sort { $0.serviceName.lowercased() < $1.serviceName.lowercased() }
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    private func deleteService(_ service: Service) async {
        do {
            try await APIService.shared.deleteAcademyService(
                academyId: academy.id,
                serviceId: service.id
            )
            services.removeAll { $0.id == service.id }
            Haptics.warning()
        } catch {
            self.error = error.localizedDescription
        }
        deleteTarget = nil
    }
}
