import SwiftUI

/// Create or edit an academy service. Pass `existing == nil` to create. The
/// caller (`AcademyDetailView`) handles the API call + list refresh — this
/// sheet is a dumb form that surfaces validation and emits the resolved
/// payload via `onSave`.
struct AcademyServiceFormSheet: View {
    let existing: Service?
    let onSave: (_ name: String, _ price: Double, _ category: String) async -> Bool

    @Environment(\.dismiss) private var dismiss

    @State private var serviceName: String = ""
    @State private var priceText: String = ""
    @State private var category: String = ForMe.Category.salon.rawValue
    @State private var saving = false
    @State private var seeded = false

    private var parsedPrice: Double? {
        let trimmed = priceText.trimmingCharacters(in: .whitespaces)
        return Double(trimmed).flatMap { $0 >= 0 ? $0 : nil }
    }

    private var isValid: Bool {
        !serviceName.trimmingCharacters(in: .whitespaces).isEmpty &&
        parsedPrice != nil &&
        !category.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: ForMe.space4) {
                    nameField
                    priceField
                    categoryField
                }
                .padding(.horizontal)
                .padding(.top, ForMe.space3)
                .padding(.bottom, 40)
            }
            .background(ForMe.background)
            .navigationTitle(existing == nil ? "New service" : "Edit service")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(saving ? "Saving…" : "Save") { submit() }
                        .disabled(!isValid || saving)
                }
            }
            .onAppear { seed() }
        }
    }

    private var nameField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Name")
                .font(ForMe.font(.medium, size: 13))
                .foregroundColor(ForMe.textPrimary)
            TextField("e.g. Men's haircut", text: $serviceName)
                .font(ForMe.font(.regular, size: 14))
                .foregroundColor(ForMe.textPrimary)
                .forMeInput()
        }
    }

    private var priceField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Price")
                .font(ForMe.font(.medium, size: 13))
                .foregroundColor(ForMe.textPrimary)
            HStack {
                Text("$")
                    .font(ForMe.font(.regular, size: 16))
                    .foregroundColor(ForMe.textSecondary)
                TextField("0", text: $priceText)
                    .keyboardType(.decimalPad)
                    .font(ForMe.font(.regular, size: 16))
                    .foregroundColor(ForMe.textPrimary)
            }
            .forMeInput()
            Text("Server stores prices as whole numbers — decimals get rounded.")
                .font(ForMe.font(.regular, size: 11))
                .foregroundColor(ForMe.stone400)
        }
    }

    private var categoryField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Category")
                .font(ForMe.font(.medium, size: 13))
                .foregroundColor(ForMe.textPrimary)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(ForMe.Category.allCases, id: \.self) { c in
                        Button {
                            category = c.rawValue
                        } label: {
                            Text(c.rawValue)
                                .font(ForMe.font(.medium, size: 13))
                                .foregroundColor(category == c.rawValue ? .white : ForMe.textPrimary)
                                .padding(.horizontal, ForMe.space4)
                                .padding(.vertical, 10)
                                .background(category == c.rawValue ? ForMe.stone900 : ForMe.surface)
                                .clipShape(Capsule())
                                .overlay(
                                    Capsule().stroke(category == c.rawValue ? .clear : ForMe.borderLight, lineWidth: 1)
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func seed() {
        guard !seeded else { return }
        seeded = true
        if let existing {
            serviceName = existing.serviceName
            priceText = existing.price == existing.price.rounded()
                ? "\(Int(existing.price))"
                : String(format: "%.2f", existing.price)
            if let cat = existing.category, !cat.isEmpty {
                category = cat
            }
        }
    }

    private func submit() {
        guard let price = parsedPrice else { return }
        let name = serviceName.trimmingCharacters(in: .whitespaces)
        let cat = category.trimmingCharacters(in: .whitespaces)
        saving = true
        Task {
            let ok = await onSave(name, price, cat)
            saving = false
            if ok {
                Haptics.success()
                dismiss()
            }
        }
    }
}
