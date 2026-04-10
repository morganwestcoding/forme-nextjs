import SwiftUI
import PhotosUI

// MARK: - Multi-step Listing Creation/Edit Flow

struct ListingFlow: View {
    var existingListing: Listing? = nil  // nil = create mode

    @Environment(\.dismiss) private var dismiss
    @State private var step: ListingStep = .category
    @State private var isSubmitting = false
    @State private var error: String?

    // Form state
    @State private var category: ForMe.Category? = nil
    @State private var location: String = ""
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
        case .location: return !location.isEmpty && !address.isEmpty && !zipCode.isEmpty
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

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Progress
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Rectangle().fill(ForMe.stone100).frame(height: 3)
                        Rectangle().fill(ForMe.stone900)
                            .frame(width: geo.size.width * progress, height: 3)
                            .animation(.easeInOut(duration: 0.3), value: progress)
                    }
                }
                .frame(height: 3)

                // Step content
                Group {
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

                bottomBar
            }
            .background(ForMe.background)
            .navigationTitle(navTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        if step == .category {
                            dismiss()
                        } else {
                            withAnimation { step = ListingStep(rawValue: step.rawValue - 1) ?? .category }
                        }
                    } label: {
                        Image(systemName: step == .category ? "xmark" : "chevron.left")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
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

    // MARK: - Steps

    private var categoryStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "What kind of business?",
                    subtitle: "Pick the category that fits best"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    ForEach(ForMe.Category.allCases, id: \.self) { cat in
                        Button {
                            category = cat
                        } label: {
                            VStack(spacing: 10) {
                                Image("Category\(cat.rawValue)")
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(width: 60, height: 60)
                                    .clipShape(Circle())
                                Text(cat.rawValue)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(ForMe.textPrimary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, ForMe.space4)
                            .background(category == cat ? ForMe.stone50 : ForMe.surface)
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                                    .stroke(category == cat ? ForMe.stone900 : ForMe.stone200, lineWidth: category == cat ? 2 : 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    private var locationStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Where are you located?",
                    subtitle: "Help customers find you"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                VStack(spacing: ForMe.space3) {
                    field(label: "City, State", text: $location, placeholder: "Long Beach, CA")
                    field(label: "Street Address", text: $address, placeholder: "123 Main St")
                    field(label: "ZIP Code", text: $zipCode, placeholder: "90802")
                }
                .padding(.horizontal)
            }
        }
    }

    private var detailsStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Tell us about it",
                    subtitle: "Add a name, photo, and description"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                // Image picker
                PhotosPicker(selection: $imagePickerItem, matching: .images) {
                    if let data = imageData, let uiImage = UIImage(data: data) {
                        Color.clear
                            .frame(height: 220)
                            .frame(maxWidth: .infinity)
                            .overlay(
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                    } else {
                        VStack(spacing: 8) {
                            Image(systemName: "photo.badge.plus")
                                .font(.system(size: 32))
                                .foregroundColor(ForMe.stone400)
                            Text("Add main photo")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(ForMe.textSecondary)
                        }
                        .frame(height: 220)
                        .frame(maxWidth: .infinity)
                        .background(ForMe.stone100)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                                .stroke(ForMe.stone200, style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                        )
                    }
                }
                .padding(.horizontal)
                .onChange(of: imagePickerItem) { _, newValue in
                    Task {
                        if let data = try? await newValue?.loadTransferable(type: Data.self) {
                            imageData = data
                        }
                    }
                }

                VStack(spacing: ForMe.space3) {
                    field(label: "Business Name", text: $title, placeholder: "John's Place")
                    multilineField(label: "Description", text: $description)
                }
                .padding(.horizontal)
            }
        }
    }

    private var servicesStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "What services do you offer?",
                    subtitle: "Add services customers can book"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                VStack(spacing: 10) {
                    ForEach($services) { $service in
                        VStack(spacing: 0) {
                            HStack {
                                TextField("Service name", text: $service.name)
                                    .font(.system(size: 14, weight: .medium))
                                Spacer()
                                Button {
                                    services.removeAll { $0.id == service.id }
                                } label: {
                                    Image(systemName: "trash")
                                        .font(.system(size: 13))
                                        .foregroundColor(ForMe.stone400)
                                }
                            }
                            .padding(ForMe.space3)
                            Divider()
                            HStack {
                                TextField("Price", text: $service.price)
                                    .keyboardType(.decimalPad)
                                    .font(.system(size: 14))
                                Divider().frame(height: 20)
                                TextField("Duration (min)", text: $service.duration)
                                    .keyboardType(.numberPad)
                                    .font(.system(size: 14))
                            }
                            .padding(ForMe.space3)
                        }
                        .background(ForMe.surface)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .stroke(ForMe.borderLight, lineWidth: 1)
                        )
                    }

                    Button {
                        services.append(ServiceDraft(name: "", price: "", duration: ""))
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "plus")
                                .font(.system(size: 12, weight: .semibold))
                            Text("Add Service")
                                .font(.system(size: 13, weight: .semibold))
                        }
                        .foregroundColor(ForMe.textPrimary)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity)
                        .background(ForMe.stone100)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    private var galleryStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "Show off your space",
                    subtitle: "Add photos to your gallery"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)], spacing: 8) {
                    ForEach(Array(galleryDataList.enumerated()), id: \.offset) { _, data in
                        if let uiImage = UIImage(data: data) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .aspectRatio(1, contentMode: .fill)
                                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                        }
                    }

                    PhotosPicker(selection: $galleryItems, maxSelectionCount: 10, matching: .images) {
                        ZStack {
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .fill(ForMe.stone100)
                                .overlay(
                                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                        .stroke(ForMe.stone200, style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                                )
                            Image(systemName: "plus")
                                .font(.system(size: 24))
                                .foregroundColor(ForMe.stone400)
                        }
                        .aspectRatio(1, contentMode: .fit)
                    }
                }
                .padding(.horizontal)
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
        }
    }

    private var hoursStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space5) {
                TypeformHeading(
                    question: "When are you open?",
                    subtitle: "Set your hours for each day"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

                VStack(spacing: 0) {
                    ForEach($hours) { $day in
                        HStack {
                            Text(day.day)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(ForMe.textPrimary)
                                .frame(width: 90, alignment: .leading)

                            Spacer()

                            if day.isClosed {
                                Text("Closed")
                                    .font(.system(size: 13))
                                    .foregroundColor(ForMe.stone400)
                            } else {
                                HStack(spacing: 4) {
                                    TextField("9 am", text: $day.openTime)
                                        .font(.system(size: 13))
                                        .frame(width: 60)
                                        .multilineTextAlignment(.trailing)
                                    Text("–")
                                        .foregroundColor(ForMe.stone400)
                                    TextField("5 pm", text: $day.closeTime)
                                        .font(.system(size: 13))
                                        .frame(width: 60)
                                }
                            }

                            Toggle("", isOn: Binding(
                                get: { !day.isClosed },
                                set: { day.isClosed = !$0 }
                            ))
                            .labelsHidden()
                            .scaleEffect(0.8)
                            .tint(ForMe.stone900)
                        }
                        .padding(.horizontal, ForMe.space4)
                        .padding(.vertical, 12)

                        if day.id != hours.last?.id { Divider() }
                    }
                }
                .background(ForMe.surface)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )
                .padding(.horizontal)
            }
        }
    }

    private var reviewStep: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: ForMe.space4) {
                TypeformHeading(
                    question: "Looks good?",
                    subtitle: "Review your listing before publishing"
                )
                .padding(.horizontal)
                .padding(.top, ForMe.space4)

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
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(ForMe.textPrimary)
                        if let cat = category {
                            Text(cat.rawValue)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(ForMe.stone500)
                        }
                        if !location.isEmpty {
                            Text(location)
                                .font(.system(size: 13))
                                .foregroundColor(ForMe.stone400)
                        }
                    }
                    .padding(ForMe.space4)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .background(ForMe.surface)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )
                .padding(.horizontal)

                summaryRow(label: "Services", value: "\(services.count)")
                summaryRow(label: "Gallery", value: "\(galleryDataList.count) photos")
                summaryRow(label: "Hours", value: "\(hours.filter { !$0.isClosed }.count) days open")
            }
        }
    }

    func summaryRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 13))
                .foregroundColor(ForMe.stone500)
            Spacer()
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)
        }
        .padding(.horizontal, ForMe.space4)
        .padding(.vertical, 12)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
        .padding(.horizontal)
    }

    // MARK: - Bottom Bar

    private var bottomBar: some View {
        VStack(spacing: 0) {
            Divider()
            Button {
                if step == .review {
                    Task { await submit() }
                } else {
                    withAnimation { step = ListingStep(rawValue: step.rawValue + 1) ?? .review }
                }
            } label: {
                if isSubmitting {
                    ForMeLoader(size: .small, color: .white)
                        .frame(maxWidth: .infinity)
                } else {
                    Text(step == .review ? (existingListing == nil ? "Create Listing" : "Save Changes") : "Continue")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(maxWidth: .infinity)
                }
            }
            .foregroundColor(.white)
            .padding(.vertical, 14)
            .background(canProceed ? ForMe.stone900 : ForMe.stone300)
            .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            .disabled(!canProceed || isSubmitting)
            .padding()
        }
        .background(ForMe.background)
    }

    // MARK: - Helpers

    func field(label: String, text: Binding<String>, placeholder: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(ForMe.stone500)
            TextField(placeholder, text: text)
                .font(.system(size: 15))
                .padding(.horizontal, ForMe.space4)
                .padding(.vertical, 14)
                .background(ForMe.surface)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )
        }
    }

    func multilineField(label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(ForMe.stone500)
            TextEditor(text: text)
                .font(.system(size: 15))
                .scrollContentBackground(.hidden)
                .frame(minHeight: 100)
                .padding(ForMe.space3)
                .background(ForMe.surface)
                .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                        .stroke(ForMe.borderLight, lineWidth: 1)
                )
        }
    }

    private func loadFromExisting() {
        guard let listing = existingListing else { return }
        category = ForMe.Category(rawValue: listing.category)
        location = listing.location ?? ""
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
        let request = CreateListingRequest(
            title: title,
            description: description,
            category: category?.rawValue ?? "",
            location: location,
            address: address,
            zipCode: zipCode,
            imageSrc: nil // TODO: upload to Cloudinary
        )

        do {
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
