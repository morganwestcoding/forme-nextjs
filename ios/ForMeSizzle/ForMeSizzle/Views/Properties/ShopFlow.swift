import SwiftUI
import PhotosUI

// MARK: - Multi-step Shop Creation Flow (mirrors web ShopFlow.tsx)
//
// Step order & fields match web exactly (minus edit-mode jumper):
//   Category → Details(logo/name/desc) → Location → Products → Settings
//
// Image upload to Cloudinary is stubbed — matches how ListingFlow and
// PostFlow currently handle it (picked in UI but submitted as nil).

struct ShopFlow: View {
    @Environment(\.dismiss) private var dismiss
    @State private var step: ShopStep = .category
    @State private var previousStepIndex: Int = 0
    @State private var isSubmitting = false
    @State private var error: String?

    // Form state
    @State private var category: ForMe.Category? = nil
    @State private var name: String = ""
    @State private var description: String = ""
    @State private var logoItem: PhotosPickerItem?
    @State private var logoData: Data?
    // Location — separate state/city so the autocomplete composite can
    // drive each field individually (matches web LocationStep). The
    // submitted `location` string is rebuilt from "city, state".
    @State private var stateName: String = ""
    @State private var city: String = ""
    @State private var address: String = ""
    @State private var zipCode: String = ""
    @State private var isOnlineOnly: Bool = false
    @State private var storeUrl: String = ""
    @State private var shopEnabled: Bool = true
    @State private var products: [ProductDraft] = []

    // Nested product form
    @State private var showingProductForm = false
    @State private var editingProductIndex: Int? = nil

    enum ShopStep: Int, CaseIterable {
        case category = 0, details, location, products, settings
    }

    private var progress: CGFloat {
        CGFloat(step.rawValue + 1) / CGFloat(ShopStep.allCases.count)
    }

    private var canProceed: Bool {
        switch step {
        case .category: return category != nil
        case .details: return !name.ws.isEmpty && !description.ws.isEmpty
        case .location: return isOnlineOnly || (!stateName.isEmpty && !city.isEmpty && !address.isEmpty && !zipCode.isEmpty)
        case .products, .settings: return true
        }
    }

    private var navTitle: String {
        switch step {
        case .category: return "Category"
        case .details: return "Details"
        case .location: return "Location"
        case .products: return "Products"
        case .settings: return "Settings"
        }
    }

    private var direction: Int {
        step.rawValue >= previousStepIndex ? 1 : -1
    }

    var body: some View {
        NavigationStack {
            FlowScaffold(
                title: navTitle,
                progress: progress,
                stepIndex: step.rawValue,
                direction: direction,
                showBack: step != .category,
                primaryLabel: step == .settings ? "Create Shop" : "Continue",
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
            } message: {
                Text(error ?? "")
            }
            .sheet(isPresented: $showingProductForm) {
                ShopProductFormSheet(
                    initial: editingProductIndex.flatMap { products[safe: $0] },
                    onSave: { product in
                        if let idx = editingProductIndex {
                            products[idx] = product
                        } else {
                            products.append(product)
                        }
                        editingProductIndex = nil
                        showingProductForm = false
                    },
                    onCancel: {
                        editingProductIndex = nil
                        showingProductForm = false
                    }
                )
            }
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        VStack(alignment: .leading, spacing: 24) {
            switch step {
            case .category: categoryStep
            case .details: detailsStep
            case .location: locationStep
            case .products: productsStep
            case .settings: settingsStep
            }
        }
    }

    // MARK: - Navigation

    private func goBack() {
        previousStepIndex = step.rawValue
        if step == .category {
            dismiss()
        } else {
            withAnimation(.easeOut(duration: 0.28)) {
                step = ShopStep(rawValue: step.rawValue - 1) ?? .category
            }
        }
    }

    private func handlePrimary() {
        if step == .settings {
            Task { await submit() }
        } else {
            previousStepIndex = step.rawValue
            withAnimation(.easeOut(duration: 0.28)) {
                step = ShopStep(rawValue: step.rawValue + 1) ?? .settings
            }
        }
    }

    // MARK: - Steps

    @ViewBuilder
    private var categoryStep: some View {
        TypeformHeading(
            question: "What kind of shop?",
            subtitle: "Pick the category that fits your products"
        )

        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
            ForEach(ForMe.Category.allCases, id: \.self) { cat in
                Button {
                    category = cat
                } label: {
                    VStack(spacing: 10) {
                        Image("Category\(cat.rawValue)")
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 56, height: 56)
                            .clipShape(Circle())
                        Text(cat.rawValue)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(category == cat ? ForMe.stone100 : ForMe.inputBg)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(
                                category == cat ? ForMe.textPrimary : ForMe.border,
                                lineWidth: category == cat ? 1.5 : 1
                            )
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    @ViewBuilder
    private var detailsStep: some View {
        TypeformHeading(
            question: "Tell us about your shop",
            subtitle: "This is how clients will find you"
        )

        HStack {
            Spacer()
            FlowLogoUploader(item: $logoItem, data: $logoData)
            Spacer()
        }

        FlowTextField(label: "Shop name", text: $name, placeholder: "e.g., John's Hair Products")
        FlowTextArea(label: "Description", text: $description, placeholder: "Briefly describe your shop")
    }

    @ViewBuilder
    private var locationStep: some View {
        TypeformHeading(
            question: "Where is your shop located?",
            subtitle: "Or toggle online-only if you ship everywhere"
        )

        FlowToggleRow(
            title: "Online only",
            subtitle: "Hide the address — we ship everywhere",
            isOn: $isOnlineOnly
        )

        if !isOnlineOnly {
            FlowLocationFields(
                state: $stateName,
                city: $city,
                address: $address,
                zipCode: $zipCode
            )
        }

        FlowTextField(
            label: "Store URL (optional)",
            text: $storeUrl,
            placeholder: "https://example.com",
            keyboardType: .URL,
            autoCapitalization: .never
        )
    }

    @ViewBuilder
    private var productsStep: some View {
        TypeformHeading(
            question: "Add some products",
            subtitle: "Optional — you can add more later"
        )

        VStack(spacing: 10) {
            ForEach(Array(products.enumerated()), id: \.offset) { index, product in
                HStack(spacing: 12) {
                    if let firstData = product.imageData.first, let uiImage = UIImage(data: firstData) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 52, height: 52)
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    } else {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(ForMe.inputBg)
                            .frame(width: 52, height: 52)
                            .overlay(
                                Image(systemName: "photo")
                                    .foregroundColor(ForMe.stone400)
                            )
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(product.name)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                        Text(product.priceDisplay)
                            .font(.system(size: 13))
                            .foregroundColor(ForMe.stone500)
                    }
                    Spacer()
                    Button {
                        editingProductIndex = index
                        showingProductForm = true
                    } label: {
                        Image(systemName: "pencil")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(ForMe.stone500)
                            .padding(8)
                    }
                    Button {
                        products.remove(at: index)
                    } label: {
                        Image(systemName: "trash")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(ForMe.stone400)
                            .padding(8)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(ForMe.inputBg)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(ForMe.border, lineWidth: 1)
                )
            }

            Button {
                editingProductIndex = nil
                showingProductForm = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "plus")
                        .font(.system(size: 13, weight: .semibold))
                    Text("Add Product")
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundColor(ForMe.textPrimary)
                .padding(.vertical, 14)
                .frame(maxWidth: .infinity)
                .background(ForMe.inputBg)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(ForMe.border, style: StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
                )
            }
        }
    }

    @ViewBuilder
    private var settingsStep: some View {
        TypeformHeading(
            question: "Final settings",
            subtitle: "You can change these anytime"
        )

        FlowToggleRow(
            title: "Shop enabled",
            subtitle: "Customers can browse and purchase",
            isOn: $shopEnabled
        )
    }

    // MARK: - Submit

    private func submit() async {
        isSubmitting = true
        let composedLocation: String? = {
            guard !isOnlineOnly, !city.isEmpty, !stateName.isEmpty else { return nil }
            return "\(city), \(stateName)"
        }()
        let request = CreateShopRequest(
            name: name.ws,
            description: description.ws,
            category: category?.rawValue,
            logo: "",
            coverImage: nil,
            location: composedLocation,
            address: isOnlineOnly ? nil : address,
            zipCode: isOnlineOnly ? nil : zipCode,
            isOnlineOnly: isOnlineOnly,
            storeUrl: storeUrl.isEmpty ? nil : storeUrl,
            galleryImages: [],
            shopEnabled: shopEnabled,
            listingId: nil
        )

        do {
            let shop = try await APIService.shared.createShop(request)
            for product in products {
                let pReq = CreateProductRequest(
                    name: product.name,
                    description: product.description,
                    price: product.priceValue ?? 0,
                    category: product.category,
                    image: "",
                    images: [],
                    sizes: product.sizes,
                    shopId: shop.id
                )
                _ = try? await APIService.shared.createProduct(pReq)
            }
            isSubmitting = false
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

// MARK: - Product Draft

struct ProductDraft: Identifiable {
    let id = UUID()
    var name: String
    var price: String
    var description: String
    var category: String?
    var sizes: [String]
    var imageData: [Data]

    var priceValue: Double? { Double(price) }
    var priceDisplay: String {
        guard let v = priceValue else { return "—" }
        return v == v.rounded() ? "$\(Int(v))" : String(format: "$%.2f", v)
    }
}

// MARK: - Nested Product Form (mirrors web ShopProductFormStep.tsx)

struct ShopProductFormSheet: View {
    let initial: ProductDraft?
    let onSave: (ProductDraft) -> Void
    let onCancel: () -> Void

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

    private var canSave: Bool {
        !name.ws.isEmpty && !price.isEmpty && !description.ws.isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 22) {
                    TypeformHeading(
                        question: "Add a product",
                        subtitle: "Enter your product details"
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
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 40)
            }
            .background(ForMe.background)
            .navigationTitle(initial == nil ? "Add Product" : "Edit Product")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { onCancel() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") { save() }
                        .disabled(!canSave)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(canSave ? ForMe.textPrimary : ForMe.stone300)
                }
            }
            .onAppear { loadInitial() }
        }
    }

    private var slotSize: CGFloat {
        // Fit 3 slots inside the 20pt horizontal padding with 12pt gaps.
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

    private func save() {
        let draft = ProductDraft(
            name: name.ws,
            price: price,
            description: description.ws,
            category: category.isEmpty ? nil : category,
            sizes: sizes,
            imageData: imageData.compactMap { $0 }
        )
        onSave(draft)
    }

    private func loadInitial() {
        guard let initial = initial else { return }
        name = initial.name
        price = initial.price
        description = initial.description
        category = initial.category ?? ""
        sizes = initial.sizes
        for i in 0..<3 {
            imageData[i] = initial.imageData[safe: i]
        }
    }
}

// MARK: - Chip flow layout (wraps)

struct ChipFlow: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var rowWidth: CGFloat = 0
        var totalHeight: CGFloat = 0
        var rowHeight: CGFloat = 0

        for sub in subviews {
            let size = sub.sizeThatFits(.unspecified)
            if rowWidth + size.width > maxWidth, rowWidth > 0 {
                totalHeight += rowHeight + spacing
                rowWidth = 0
                rowHeight = 0
            }
            rowWidth += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        totalHeight += rowHeight
        return CGSize(width: maxWidth, height: totalHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0

        for sub in subviews {
            let size = sub.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX, x > bounds.minX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            sub.place(at: CGPoint(x: x, y: y), anchor: .topLeading, proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}

// MARK: - Small Conveniences

extension String {
    /// Shorthand for trimming whitespace/newlines — names kept short so
    /// call sites stay readable inside ternaries.
    var ws: String { trimmingCharacters(in: .whitespacesAndNewlines) }
}

extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

#Preview {
    ShopFlow()
}
