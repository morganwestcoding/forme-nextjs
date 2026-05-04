import SwiftUI

// MARK: - Create Menu (mirrors web CreateModal)
//
// Entry point for all creation flows. Parity with web:
//   • Post / Listing / Shop → open the corresponding flow directly.
//   • Product → require that the user has at least one shop. We hit
//     GET /shops?userId=X&limit=1 (matches web) and show an inline
//     "no shop yet" state with a CTA to create one when empty.
//   • Worker → same pattern, gated on at least one listing.
//
// The selected shop/listing id is handed to the flow via AppState so
// the ProductFlow/WorkerFlow can skip the picker on the common path.

struct CreateMenuView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var gateState: GateState = .menu
    @State private var checkingDestination: CreateDestination?

    enum GateState {
        case menu
        case noShop
        case noListing
    }

    private let items: [(label: String, description: String, destination: CreateDestination)] = [
        ("Post", "Share your work", .post),
        ("Listing", "Create a business", .listing),
        ("Shop", "Open a storefront", .shop),
        ("Product", "Add to your shop", .product),
        ("Worker", "Add a team member", .worker),
    ]

    enum CreateDestination {
        case post, listing, shop, product, worker
    }

    @ViewBuilder
    private func icon(for destination: CreateDestination) -> some View {
        switch destination {
        case .post:
            HugePostIcon(size: 22, color: ForMe.stone500, lineWidth: 1.5)
        case .listing:
            HugeIcon(paths: HugeIcon.gridViewPaths, size: 22, color: ForMe.stone500, lineWidth: 1.5)
        case .shop:
            HugeIcon(paths: HugeIcon.shopPaths, size: 22, color: ForMe.stone500, lineWidth: 1.5)
        case .product:
            HugeIcon(paths: HugeIcon.productPaths, size: 22, color: ForMe.stone500, lineWidth: 1.5)
        case .worker:
            HugeIcon(paths: HugeIcon.userAddPaths, size: 22, color: ForMe.stone500, lineWidth: 1.5)
        }
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("What would you like to create?")
                        .font(ForMe.font(.semibold, size: 16))
                        .foregroundColor(ForMe.textPrimary)
                    Text("Choose an option to get started")
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone400)
                }
                .padding(.horizontal, ForMe.space6)
                .padding(.top, ForMe.space4)
                .padding(.bottom, ForMe.space5)

                switch gateState {
                case .menu:
                    gridView
                case .noShop:
                    noResourceView(
                        title: "You don't have a shop yet",
                        subtitle: "Create a shop first to start adding products",
                        cta: "Create a shop"
                    ) {
                        gateState = .menu
                        handleNavigation(.shop)
                    }
                case .noListing:
                    noResourceView(
                        title: "You don't have a listing yet",
                        subtitle: "Create a listing first to start adding team members",
                        cta: "Create a listing"
                    ) {
                        gateState = .menu
                        handleNavigation(.listing)
                    }
                }

                Spacer()
            }
            .background(ForMe.background)
            .navigationTitle("Create")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    private var gridView: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 10),
            GridItem(.flexible(), spacing: 10),
            GridItem(.flexible(), spacing: 10),
        ], spacing: 10) {
            ForEach(items, id: \.label) { item in
                Button {
                    handleTap(item.destination)
                } label: {
                    VStack(spacing: 8) {
                        if checkingDestination == item.destination {
                            ProgressView()
                                .frame(width: 22, height: 22)
                        } else {
                            icon(for: item.destination)
                        }

                        VStack(spacing: 3) {
                            Text(item.label)
                                .font(ForMe.font(.medium, size: 12))
                                .foregroundColor(ForMe.stone600)
                            Text(item.description)
                                .font(ForMe.font(.regular, size: 10))
                                .foregroundColor(ForMe.stone400)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, ForMe.space5)
                    .padding(.horizontal, ForMe.space2)
                    .background(ForMe.stone50)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                            .stroke(ForMe.stone100, lineWidth: 1)
                    )
                    .opacity(checkingDestination != nil && checkingDestination != item.destination ? 0.5 : 1.0)
                }
                .buttonStyle(.plain)
                .disabled(checkingDestination != nil)
            }
        }
        .padding(.horizontal, ForMe.space6)
    }

    private func noResourceView(title: String, subtitle: String, cta: String, action: @escaping () -> Void) -> some View {
        VStack(spacing: 12) {
            Text(title)
                .font(ForMe.font(.semibold, size: 14))
                .foregroundColor(ForMe.textPrimary)
            Text(subtitle)
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.stone500)
                .multilineTextAlignment(.center)
                .padding(.horizontal, ForMe.space6)

            Button(action: action) {
                Text(cta)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(.white)
                    .padding(.horizontal, ForMe.space6)
                    .padding(.vertical, 12)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }
            .padding(.top, 8)

            Button("Go back") { gateState = .menu }
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.stone400)
                .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, ForMe.space6)
        .padding(.horizontal, ForMe.space6)
    }

    private func handleTap(_ destination: CreateDestination) {
        switch destination {
        case .post, .listing, .shop:
            handleNavigation(destination)
        case .product:
            checkShopAndProceed()
        case .worker:
            checkListingAndProceed()
        }
    }

    private func checkShopAndProceed() {
        guard let userId = authViewModel.currentUser?.id else { return }
        checkingDestination = .product
        Task {
            do {
                let shops = try await APIService.shared.getShopsForUser(userId: userId, limit: 1)
                checkingDestination = nil
                if let first = shops.first {
                    appState.productFlowShopId = first.id
                    handleNavigation(.product)
                } else {
                    gateState = .noShop
                }
            } catch {
                checkingDestination = nil
                gateState = .noShop
            }
        }
    }

    private func checkListingAndProceed() {
        guard let userId = authViewModel.currentUser?.id else { return }
        checkingDestination = .worker
        Task {
            do {
                let listings = try await APIService.shared.getListingsForUser(userId: userId, limit: 1)
                checkingDestination = nil
                if let first = listings.first {
                    appState.workerFlowListingId = first.id
                    handleNavigation(.worker)
                } else {
                    gateState = .noListing
                }
            } catch {
                checkingDestination = nil
                gateState = .noListing
            }
        }
    }

    private func handleNavigation(_ destination: CreateDestination) {
        dismiss()
        // Slight delay so the create menu closes before the next sheet rises,
        // otherwise iOS suppresses the second presentation.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            switch destination {
            case .post:    appState.showingPostFlow = true
            case .listing: appState.showingListingFlow = true
            case .shop:    appState.showingShopFlow = true
            case .product: appState.showingProductFlow = true
            case .worker:  appState.showingWorkerFlow = true
            }
        }
    }
}

#Preview {
    CreateMenuView()
        .environmentObject(AppState())
        .environmentObject(AuthViewModel())
}
