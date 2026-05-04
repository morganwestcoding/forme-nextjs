import SwiftUI
import PhotosUI

// MARK: - Multi-step Listing Creation/Edit Flow

struct ListingFlow: View {
    var existingListing: Listing? = nil  // nil = create mode

    @Environment(\.dismiss) private var dismiss
    @State private var step: ListingStep = .category
    @State private var previousStepIndex: Int = 0
    @State private var isSubmitting = false
    @State private var error: String?

    // Form state
    @State private var category: ForMe.Category? = nil
    // Location — state/city kept separate so the autocomplete composite
    // can drive each field; the server `location` string is composed at
    // submit time from "city, state".
    @State private var stateName: String = ""
    @State private var city: String = ""
    @State private var address: String = ""
    @State private var zipCode: String = ""
    @State private var title: String = ""
    @State private var description: String = ""
    @State private var imagePickerItem: PhotosPickerItem?
    @State private var imageData: Data?
    @State private var galleryItems: [PhotosPickerItem] = []
    @State private var galleryDataList: [Data] = []
    @State private var services: [ServiceDraft] = []
    @State private var hours: [DayHours] = DayHours.defaultWeek

    enum ListingStep: Int, CaseIterable {
        case category = 0, location, details, services, gallery, hours, review
    }

    private var progress: CGFloat {
        CGFloat(step.rawValue + 1) / CGFloat(ListingStep.allCases.count)
    }

    private var canProceed: Bool {
        switch step {
        case .category: return category != nil
        case .location: return !stateName.isEmpty && !city.isEmpty && !address.isEmpty && !zipCode.isEmpty
        case .details: return !title.isEmpty && !description.isEmpty
        case .services, .gallery, .hours, .review: return true
        }
    }

    private var navTitle: String {
        switch step {
        case .category: return "Category"
        case .location: return "Location"
        case .details: return "Details"
        case .services: return "Services"
        case .gallery: return "Gallery"
        case .hours: return "Hours"
        case .review: return "Review"
        }
    }

    private var direction: Int {
        step.rawValue >= previousStepIndex ? 1 : -1
    }

    private var primaryLabel: String {
        step == .review ? (existingListing == nil ? "Create Listing" : "Save Changes") : "Continue"
    }

    var body: some View {
        NavigationStack {
            FlowScaffold(
                title: navTitle,
                progress: progress,
                stepIndex: step.rawValue,
                direction: direction,
                showBack: step != .category,
                primaryLabel: primaryLabel,
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
            .onAppear {
                loadFromExisting()
            }
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        VStack(alignment: .leading, spacing: 24) {
            switch step {
            case .category: categoryStep
            case .location: locationStep
            case .details: detailsStep
            case .services: servicesStep
            case .gallery: galleryStep
            case .hours: hoursStep
            case .review: reviewStep
            }
        }
    }

    private func goBack() {
        previousStepIndex = step.rawValue
        if step == .category {
            dismiss()
        } else {
            withAnimation(.easeOut(duration: 0.28)) {
                step = ListingStep(rawValue: step.rawValue - 1) ?? .category
            }
        }
    }

    private func handlePrimary() {
        if step == .review {
            Task { await submit() }
        } else {
            previousStepIndex = step.rawValue
            withAnimation(.easeOut(duration: 0.28)) {
                step = ListingStep(rawValue: step.rawValue + 1) ?? .review
            }
        }
    }

    // MARK: - Steps

    @ViewBuilder
    private var categoryStep: some View {
        TypeformHeading(
            question: "What kind of business?",
            subtitle: "Pick the category that fits best"
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
                            .font(ForMe.font(.semibold, size: 14))
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
    private var locationStep: some View {
        TypeformHeading(
            question: "Where is your business located?",
            subtitle: "Help customers find you"
        )

        FlowLocationFields(
            state: $stateName,
            city: $city,
            address: $address,
            zipCode: $zipCode
        )
    }

    @ViewBuilder
    private var detailsStep: some View {
        TypeformHeading(
            question: "Tell us about it",
            subtitle: "Add a name, photo, and description"
        )

        HStack {
            Spacer()
            FlowLogoUploader(item: $imagePickerItem, data: $imageData, width: 220, height: 220)
            Spacer()
        }

        FlowTextField(label: "Business Name", text: $title, placeholder: "John's Place")
        FlowTextArea(label: "Description", text: $description, placeholder: "Tell clients what makes your business special")
    }

    @ViewBuilder
    private var servicesStep: some View {
        TypeformHeading(
            question: "What services do you offer?",
            subtitle: "Add services customers can book"
        )

        VStack(spacing: 10) {
            ForEach($services) { $service in
                VStack(spacing: 0) {
                    HStack {
                        TextField("Service name", text: $service.name)
                            .font(ForMe.font(.medium, size: 15))
                        Spacer()
                        Button {
                            services.removeAll { $0.id == service.id }
                        } label: {
                            Image(systemName: "trash")
                                .font(.system(size: 14))
                                .foregroundColor(ForMe.stone400)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    Rectangle()
                        .fill(ForMe.border)
                        .frame(height: 1)
                    HStack(spacing: 0) {
                        TextField("Price", text: $service.price)
                            .keyboardType(.decimalPad)
                            .font(ForMe.font(.regular, size: 15))
                        Rectangle()
                            .fill(ForMe.border)
                            .frame(width: 1, height: 22)
                            .padding(.horizontal, 12)
                        TextField("Duration (min)", text: $service.duration)
                            .keyboardType(.numberPad)
                            .font(ForMe.font(.regular, size: 15))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                }
                .background(ForMe.inputBg)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(ForMe.border, lineWidth: 1)
                )
            }

            Button {
                services.append(ServiceDraft(name: "", price: "", duration: ""))
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "plus")
                        .font(.system(size: 13, weight: .semibold))
                    Text("Add Service")
                        .font(ForMe.font(.semibold, size: 14))
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
    private var galleryStep: some View {
        TypeformHeading(
            question: "Show off your space",
            subtitle: "Add photos to your gallery"
        )

        LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
            ForEach(Array(galleryDataList.enumerated()), id: \.offset) { index, data in
                if let uiImage = UIImage(data: data) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .aspectRatio(1, contentMode: .fill)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(alignment: .topTrailing) {
                            Button {
                                galleryDataList.remove(at: index)
                            } label: {
                                Image(systemName: "xmark")
                                    .font(.system(size: 10, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(width: 22, height: 22)
                                    .background(Color.black.opacity(0.5))
                                    .clipShape(Circle())
                            }
                            .buttonStyle(.plain)
                            .padding(6)
                        }
                }
            }

            PhotosPicker(selection: $galleryItems, maxSelectionCount: 10, matching: .images) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(ForMe.inputBg)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(ForMe.border, style: StrokeStyle(lineWidth: 2, dash: [6, 4]))
                        )
                    ZStack {
                        Circle()
                            .fill(ForMe.surface)
                            .frame(width: 36, height: 36)
                            .elevation(.level1)
                            .overlay(Circle().stroke(ForMe.border, lineWidth: 1))
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .regular))
                            .foregroundColor(ForMe.stone400)
                    }
                }
                .aspectRatio(1, contentMode: .fit)
            }
        }
        .onChange(of: galleryItems) { _, newItems in
            Task {
                var newData: [Data] = []
                for item in newItems {
                    if let data = try? await item.loadTransferable(type: Data.self) {
                        newData.append(data)
                    }
                }
                galleryDataList = newData
            }
        }
    }

    @ViewBuilder
    private var hoursStep: some View {
        TypeformHeading(
            question: "When are you open?",
            subtitle: "Set your hours for each day"
        )

        VStack(spacing: 0) {
            ForEach($hours) { $day in
                HStack(spacing: 12) {
                    Text(day.day)
                        .font(ForMe.font(.semibold, size: 14))
                        .foregroundColor(ForMe.textPrimary)
                        .frame(width: 88, alignment: .leading)

                    Spacer(minLength: 0)

                    if day.isClosed {
                        Text("Closed")
                            .font(ForMe.font(.regular, size: 13))
                            .foregroundColor(ForMe.stone400)
                    } else {
                        HStack(spacing: 6) {
                            TextField("9 am", text: $day.openTime)
                                .font(ForMe.font(.regular, size: 13))
                                .frame(width: 64)
                                .padding(.vertical, 6)
                                .padding(.horizontal, 8)
                                .multilineTextAlignment(.center)
                                .background(ForMe.inputBg)
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                                        .stroke(ForMe.border, lineWidth: 1)
                                )
                            Text("–")
                                .foregroundColor(ForMe.stone400)
                            TextField("5 pm", text: $day.closeTime)
                                .font(ForMe.font(.regular, size: 13))
                                .frame(width: 64)
                                .padding(.vertical, 6)
                                .padding(.horizontal, 8)
                                .multilineTextAlignment(.center)
                                .background(ForMe.inputBg)
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                                        .stroke(ForMe.border, lineWidth: 1)
                                )
                        }
                    }

                    Toggle("", isOn: Binding(
                        get: { !day.isClosed },
                        set: { day.isClosed = !$0 }
                    ))
                    .labelsHidden()
                    .tint(ForMe.stone900)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)

                if day.id != hours.last?.id {
                    Rectangle().fill(ForMe.border).frame(height: 1).padding(.horizontal, 16)
                }
            }
        }
        .background(ForMe.inputBg)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
    }

    @ViewBuilder
    private var reviewStep: some View {
        TypeformHeading(
            question: "Looks good?",
            subtitle: "Review your listing before publishing"
        )

        VStack(spacing: 0) {
            if let data = imageData, let uiImage = UIImage(data: data) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(height: 180)
                    .frame(maxWidth: .infinity)
                    .clipped()
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(title.isEmpty ? "Untitled" : title)
                    .font(ForMe.font(.bold, size: 18))
                    .foregroundColor(ForMe.textPrimary)
                if let cat = category {
                    Text(cat.rawValue)
                        .font(ForMe.font(.medium, size: 12))
                        .foregroundColor(ForMe.stone500)
                }
                if !city.isEmpty || !stateName.isEmpty {
                    Text("\(city), \(stateName)")
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone400)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(ForMe.inputBg)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )

        summaryRow(label: "Services", value: "\(services.count)")
        summaryRow(label: "Gallery", value: "\(galleryDataList.count) photos")
        summaryRow(label: "Hours", value: "\(hours.filter { !$0.isClosed }.count) days open")
    }

    private func summaryRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(ForMe.font(.regular, size: 13))
                .foregroundColor(ForMe.stone500)
            Spacer()
            Text(value)
                .font(ForMe.font(.semibold, size: 14))
                .foregroundColor(ForMe.textPrimary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(ForMe.inputBg)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
    }

    private func loadFromExisting() {
        guard let listing = existingListing else { return }
        category = ForMe.Category(rawValue: listing.category)
        let parts = (listing.location ?? "").split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        city = parts.first ?? ""
        stateName = parts.count > 1 ? parts[1] : ""
        address = listing.address ?? ""
        zipCode = listing.zipCode ?? ""
        title = listing.title
        description = listing.description ?? ""
        services = (listing.services ?? []).map {
            ServiceDraft(name: $0.serviceName, price: "\(Int($0.price))", duration: "\($0.duration ?? 60)")
        }
    }

    private func submit() async {
        isSubmitting = true
        do {
            var coverURL: String? = nil
            if let data = imageData, let image = UIImage(data: data) {
                coverURL = try await CloudinaryService.shared.uploadImage(
                    image,
                    folder: .listings,
                    targetWidth: 1200,
                    targetHeight: 900
                )
            }

            var galleryURLs: [String] = []
            for data in galleryDataList {
                if let image = UIImage(data: data) {
                    let url = try await CloudinaryService.shared.uploadImage(
                        image,
                        folder: .listingsGallery,
                        targetWidth: 1200,
                        targetHeight: 900
                    )
                    galleryURLs.append(url)
                }
            }

            let composedLocation = "\(city), \(stateName)"
            let request = CreateListingRequest(
                title: title,
                description: description,
                category: category?.rawValue ?? "",
                location: composedLocation,
                address: address,
                zipCode: zipCode,
                imageSrc: coverURL,
                galleryImages: galleryURLs.isEmpty ? nil : galleryURLs
            )

            _ = try await APIService.shared.createListing(request)
            isSubmitting = false
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

// MARK: - Helper Models

struct ServiceDraft: Identifiable {
    let id = UUID()
    var name: String
    var price: String
    var duration: String
}

struct DayHours: Identifiable {
    let id = UUID()
    let day: String
    var openTime: String
    var closeTime: String
    var isClosed: Bool

    static let defaultWeek: [DayHours] = [
        DayHours(day: "Monday", openTime: "9 am", closeTime: "5 pm", isClosed: false),
        DayHours(day: "Tuesday", openTime: "9 am", closeTime: "5 pm", isClosed: false),
        DayHours(day: "Wednesday", openTime: "9 am", closeTime: "5 pm", isClosed: false),
        DayHours(day: "Thursday", openTime: "9 am", closeTime: "5 pm", isClosed: false),
        DayHours(day: "Friday", openTime: "9 am", closeTime: "5 pm", isClosed: false),
        DayHours(day: "Saturday", openTime: "10 am", closeTime: "4 pm", isClosed: false),
        DayHours(day: "Sunday", openTime: "", closeTime: "", isClosed: true),
    ]
}

#Preview {
    ListingFlow()
}
