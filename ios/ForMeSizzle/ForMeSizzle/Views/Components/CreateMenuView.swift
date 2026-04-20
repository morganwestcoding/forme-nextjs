import SwiftUI

struct CreateMenuView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var appState: AppState

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
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                    Text("Choose an option to get started")
                        .font(.system(size: 13))
                        .foregroundColor(ForMe.stone400)
                }
                .padding(.horizontal, ForMe.space6)
                .padding(.top, ForMe.space4)
                .padding(.bottom, ForMe.space5)

                // Grid
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10),
                ], spacing: 10) {
                    ForEach(items, id: \.label) { item in
                        Button {
                            dismiss()
                            handleNavigation(item.destination)
                        } label: {
                            VStack(spacing: 8) {
                                icon(for: item.destination)

                                VStack(spacing: 3) {
                                    Text(item.label)
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(ForMe.stone600)
                                    Text(item.description)
                                        .font(.system(size: 10))
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
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, ForMe.space6)

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

    private func handleNavigation(_ destination: CreateDestination) {
        switch destination {
        case .post:
            // Slight delay so the create menu closes first
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                appState.showingPostFlow = true
            }
        case .listing: break // TODO: ListingFlow
        case .shop: break    // TODO: ShopFlow
        case .product: break // TODO: ProductFlow
        case .worker: break  // TODO: WorkerFlow
        }
    }
}

#Preview {
    CreateMenuView()
        .environmentObject(AppState())
}
