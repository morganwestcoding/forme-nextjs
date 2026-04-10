import SwiftUI

struct CreateMenuView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var appState: AppState

    private let items: [(icon: String, label: String, description: String, destination: CreateDestination)] = [
        ("photo.on.rectangle.angled", "Post", "Share your work", .post),
        ("square.grid.2x2", "Listing", "Create a business", .listing),
        ("bag", "Shop", "Open a storefront", .shop),
        ("cube.box", "Product", "Add to your shop", .product),
        ("person.badge.plus", "Worker", "Add a team member", .worker),
    ]

    enum CreateDestination {
        case post, listing, shop, product, worker
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
                .padding(.horizontal, ForMe.space5)
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
                                Image(systemName: item.icon)
                                    .font(.system(size: 20))
                                    .foregroundColor(ForMe.stone500)

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
                .padding(.horizontal, ForMe.space5)

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
        // TODO: Navigate to respective typeflow
        switch destination {
        case .post: break    // PostFlow
        case .listing: break // ListingFlow
        case .shop: break    // ShopFlow
        case .product: break // ProductFlow
        case .worker: break  // WorkerFlow
        }
    }
}

#Preview {
    CreateMenuView()
        .environmentObject(AppState())
}
