import SwiftUI
import PhotosUI

// MARK: - Add Product Flow (mirrors web ShopProductFormStep via POST /products)
//
// Web routes the Product click to /shops/[id]/edit pre-focused on the
// Products tab. iOS condenses that to a focused form that POSTs a
// single product to the current user's shop. If the user has multiple
// shops we let them pick; the common 1-shop path skips directly to
// the form (matching web's "use the first shop" heuristic).

struct ProductFlow: View {
    var shopId: String?

    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var step: ProductStep = .shop
    @State private var previousStepIndex: Int = 0
    @State private var isLoading = false
    @State private var isSubmitting = false
    @State private var error: String?

    @State private var userShops: [Shop] = []
    @State private var selectedShop: Shop?

    // Product form state
    @State private var name: String = ""
    @State private var price: String = ""
    @State private var description: String = ""
    @State private var category: String = ""
    @State private var sizes: [String] = []
    @State private var currentSize: String = ""
    @State private var imagePickers: [PhotosPickerItem?] = [nil, nil, nil]
    @State private var imageData: [Data?] = [nil, nil, nil]

    private let categoryOptions: [(String, String)] = [
        ("clothing", "Clothing"),
        ("accessories", "Accessories"),
        ("electronics", "Electronics"),
        ("home", "Home & Garden"),
        ("beauty", "Beauty & Personal Care"),
        ("sports", "Sports & Outdoors"),
        ("toys", "Toys & Games"),
        ("books", "Books & Media"),
    ]

    enum ProductStep: Int, CaseIterable {
        case shop = 0, form
    }

    private var effectiveSteps: [ProductStep] {
        if shopId != nil { return [.form] }
        return ProductStep.allCases
    }

    private var progress: CGFloat {
        guard let idx = effectiveSteps.firstIndex(of: step) else { return 0 }
        return CGFloat(idx + 1) / CGFloat(effectiveSteps.count)
    }

    private var canProceed: Bool {
        switch step {
        case .shop: return selectedShop != nil
        case .form: return !name.ws.isEmpty && !price.isEmpty && !description.ws.isEmpty
        }
    }

    private var direction: Int {
        step.rawValue >= previousStepIndex ? 1 : -1
    }

    private var isFirstStep: Bool { effectiveSteps.first == step }

    var body: some View {
        NavigationStack {
            FlowScaffold(
                title: step == .shop ? "Choose Shop" : "Add Product",
                progress: progress,
                stepIndex: step.rawValue,
                direction: direction,
                showBack: !isFirstStep,
                primaryLabel: step == .form ? "Add Product" : "Continue",
                canProceed: canProceed,
                isLoading: isSubmitting,
                onBack: { goBack() },
                onPrimary: { handlePrimary() },
                onClose: { dismiss() }
            ) {
                stepContent
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: { Text(error ?? "") }
            .task { await bootstrap() }
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        VStack(alignment: .leading, spacing: 22) {
            switch step {
            case .shop: shopStep
            case .form: formStep
            }
        }
    }

    // MARK: - Navigation

    private func goBack() {
        previousStepIndex = step.rawValue
        guard let idx = effectiveSteps.firstIndex(of: step), idx > 0 else {
            dismiss()
            return
        }
        withAnimation(.easeOut(duration: 0.28)) {
            step = effectiveSteps[idx - 1]
        }
    }

    private func handlePrimary() {
        if step == .form {
            Task { await submit() }
            return
        }
        previousStepIndex = step.rawValue
        guard let idx = effectiveSteps.firstIndex(of: step),
              idx + 1 < effectiveSteps.count else { return }
        withAnimation(.easeOut(duration: 0.28)) {
            step = effectiveSteps[idx + 1]
        }
    }

    // MARK: - Bootstrap

    private func bootstrap() async {
        if let shopId = shopId {
            isLoading = true
            if let uid = authViewModel.currentUser?.id {
                if let shops = try? await APIService.shared.getShopsForUser(userId: uid) {
                    selectedShop = shops.first { $0.id == shopId }
                }
            }
            step = .form
            isLoading = false
        } else {
            guard let uid = authViewModel.currentUser?.id else { return }
            isLoading = true
            do {
                userShops = try await APIService.shared.getShopsForUser(userId: uid)
                if userShops.count == 1 {
                    selectedShop = userShops.first
                    step = .form
                }
            } catch {
                self.error = "Couldn't load your shops"
            }
            isLoading = false
        }
    }

    // MARK: - Steps

    @ViewBuilder
    private var shopStep: some View {
        TypeformHeading(
            question: "Which shop?",
            subtitle: "Pick the storefront to add this product to"
        )

        if isLoading {
            HStack { Spacer(); ProgressView(); Spacer() }
                .padding(.top, 40)
        } else if userShops.isEmpty {
            Text("You don't have any shops yet.")
                .font(.system(size: 14))
                .foregroundColor(ForMe.stone400)
                .frame(maxWidth: .infinity)
                .padding(.top, 40)
        } else {
            VStack(spacing: 10) {
                ForEach(userShops) { shop in
                    shopRow(shop)
                }
            }
        }
    }

    private func shopRow(_ shop: Shop) -> some View {
        Button {
            selectedShop = shop
        } label: {
            HStack(spacing: 14) {
                AsyncImage(url: URL(string: shop.logo ?? shop.coverImage ?? "")) { phase in
                    switch phase {
                    case .success(let img):
                        img.resizable().aspectRatio(contentMode: .fill)
                    default:
                        RoundedRectangle(cornerRadius: 10)
                            .fill(ForMe.stone100)
                    }
                }
                .frame(width: 56, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                VStack(alignment: .leading, spacing: 2) {
                    Text(shop.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                    if let loc = shop.location {
                        Text(loc)
                            .font(.system(size: 13))
                            .foregroundColor(ForMe.stone500)
                    }
                }
                Spacer()
                if selectedShop?.id == shop.id {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(ForMe.textPrimary)
                }
            }
            .padding(14)
            .background(ForMe.inputBg)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(
                        selectedShop?.id == shop.id ? ForMe.textPrimary : ForMe.border,
                        lineWidth: selectedShop?.id == shop.id ? 1.5 : 1
                    )
            )
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var formStep: some View {
        TypeformHeading(
            question: "Add a product",
            subtitle: selectedShop.map { "to \($0.name)" } ?? "Enter your product details"
        )

        // 3-slot image gallery
        VStack(alignment: .leading, spacing: 10) {
            FlowLabel(text: "Product images")
            HStack(spacing: 12) {
                ForEach(0..<3, id: \.self) { i in
                    FlowProductImageSlot(
                        item: Binding(
                            get: { imagePickers[i] },
                            set: { imagePickers[i] = $0 }
                        ),
                        data: Binding(
                            get: { imageData[i] },
                            set: { imageData[i] = $0 }
                        ),
                        size: slotSize
                    )
                }
            }
        }

        HStack(spacing: 12) {
            FlowTextField(label: "Product name", text: $name, placeholder: "Product name")
            FlowTextField(label: "Price", text: $price, placeholder: "0.00", keyboardType: .decimalPad, autoCapitalization: .never)
        }

        FlowTextArea(label: "Description", text: $description, placeholder: "Describe your product…", minHeight: 90)

        FlowSelect(
            label: "Category",
            selection: $category,
            placeholder: "Select category",
            options: categoryOptions.map { (value: $0.0, label: $0.1) }
        )

        VStack(alignment: .leading, spacing: 10) {
            FlowLabel(text: "Sizes")
            HStack(spacing: 8) {
                TextField("Add size (S, M, L)", text: $currentSize)
                    .font(.system(size: 15))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(ForMe.inputBg)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(ForMe.border, lineWidth: 1)
                    )
                    .submitLabel(.done)
                    .onSubmit { addSize() }
                Button(action: addSize) {
                    Image(systemName: "plus")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                        .frame(width: 48, height: 48)
                        .background(ForMe.stone100)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .buttonStyle(.plain)
            }

            if !sizes.isEmpty {
                ChipFlow(spacing: 8) {
                    ForEach(sizes, id: \.self) { size in
                        FlowChip(text: size) {
                            sizes.removeAll { $0 == size }
                        }
                    }
                }
                .padding(.top, 4)
            }
        }
    }

    private var slotSize: CGFloat {
        let screen = UIScreen.main.bounds.width
        let available = screen - (20 * 2) - (12 * 2)
        return floor(available / 3)
    }

    private func addSize() {
        let trimmed = currentSize.ws
        guard !trimmed.isEmpty, !sizes.contains(trimmed) else { return }
        sizes.append(trimmed)
        currentSize = ""
    }

    // MARK: - Submit

    private func submit() async {
        guard let shop = selectedShop, let priceValue = Double(price) else { return }
        isSubmitting = true
        let request = CreateProductRequest(
            name: name.ws,
            description: description.ws,
            price: priceValue,
            category: category.isEmpty ? nil : category,
            image: "",
            images: [],
            sizes: sizes,
            shopId: shop.id
        )
        do {
            _ = try await APIService.shared.createProduct(request)
            isSubmitting = false
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

#Preview {
    ProductFlow(shopId: nil)
        .environmentObject(AppState())
        .environmentObject(AuthViewModel())
}
