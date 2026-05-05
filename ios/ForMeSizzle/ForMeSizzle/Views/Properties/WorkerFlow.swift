import SwiftUI

// MARK: - Add Worker Flow (mirrors web EmployeesStep + user search)
//
// Web sends "Worker" clicks to /listing/[id]/edit landing at the
// employees step. iOS condenses that into a focused 3-step wizard:
//   Listing (only shown when ambiguous) → User search → Role & services.
// Posts via PUT /api/listings/[id] using the same full-replacement
// payload the web listing edit flow uses.

struct WorkerFlow: View {
    var listingId: String?

    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var step: WorkerStep = .listing
    @State private var previousStepIndex: Int = 0
    @State private var isLoading = false
    @State private var isSubmitting = false
    @State private var error: String?

    @State private var userListings: [Listing] = []
    @State private var selectedListing: Listing?

    @State private var searchQuery = ""
    @State private var searchResults: [CompactUser] = []
    @State private var searchTask: Task<Void, Never>?
    @State private var selectedUser: CompactUser?

    @State private var jobTitle: String = ""
    @State private var selectedServiceIds: Set<String> = []

    enum WorkerStep: Int, CaseIterable {
        case listing = 0, user, role

        var title: String {
            switch self {
            case .listing: return "Choose Listing"
            case .user: return "Find User"
            case .role: return "Role & Services"
            }
        }
    }

    private var effectiveSteps: [WorkerStep] {
        if listingId != nil { return [.user, .role] }
        return WorkerStep.allCases
    }

    private var progress: CGFloat {
        guard let idx = effectiveSteps.firstIndex(of: step) else { return 0 }
        return CGFloat(idx + 1) / CGFloat(effectiveSteps.count)
    }

    private var canProceed: Bool {
        switch step {
        case .listing: return selectedListing != nil
        case .user: return selectedUser != nil
        case .role: return true
        }
    }

    private var direction: Int {
        step.rawValue >= previousStepIndex ? 1 : -1
    }

    private var isFirstStep: Bool {
        effectiveSteps.first == step
    }

    var body: some View {
        NavigationStack {
            FlowScaffold(
                title: step.title,
                progress: progress,
                stepIndex: step.rawValue,
                direction: direction,
                showBack: !isFirstStep,
                primaryLabel: step == .role ? "Add Worker" : "Continue",
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
            case .listing: listingStep
            case .user: userStep
            case .role: roleStep
            }
        }
    }

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
        if step == .role {
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
        if let listingId = listingId {
            isLoading = true
            do {
                let listing = try await APIService.shared.getListing(id: listingId)
                selectedListing = listing
                step = .user
            } catch {
                self.error = "Couldn't load listing"
            }
            isLoading = false
        } else {
            guard let uid = authViewModel.currentUser?.id else { return }
            isLoading = true
            do {
                userListings = try await APIService.shared.getListingsForUser(userId: uid)
                if userListings.count == 1 {
                    selectedListing = userListings.first
                    step = .user
                }
            } catch {
                self.error = "Couldn't load your listings"
            }
            isLoading = false
        }
    }

    // MARK: - Steps

    @ViewBuilder
    private var listingStep: some View {
        TypeformHeading(
            question: "Which listing?",
            subtitle: "Pick the business to add a team member to"
        )

        if isLoading {
            HStack { Spacer(); ProgressView(); Spacer() }
                .padding(.top, 40)
        } else if userListings.isEmpty {
            Text("You don't have any listings yet.")
                .font(ForMe.font(.regular, size: 14))
                .foregroundColor(ForMe.stone400)
                .frame(maxWidth: .infinity)
                .padding(.top, 40)
        } else {
            VStack(spacing: 10) {
                ForEach(userListings) { listing in
                    listingRow(listing)
                }
            }
        }
    }

    private func listingRow(_ listing: Listing) -> some View {
        Button {
            selectedListing = listing
        } label: {
            HStack(spacing: 14) {
                AsyncImage(url: AssetURL.resolve(listing.imageSrc)) { phase in
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
                    Text(listing.title)
                        .font(ForMe.font(.semibold, size: 15))
                        .foregroundColor(ForMe.textPrimary)
                    Text(listing.category)
                        .font(ForMe.font(.regular, size: 13))
                        .foregroundColor(ForMe.stone500)
                }
                Spacer()
                if selectedListing?.id == listing.id {
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
                        selectedListing?.id == listing.id ? ForMe.textPrimary : ForMe.border,
                        lineWidth: selectedListing?.id == listing.id ? 1.5 : 1
                    )
            )
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var userStep: some View {
        TypeformHeading(
            question: "Who are you adding?",
            subtitle: "Search by name or email"
        )

        HStack(spacing: 0) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(ForMe.stone400)
                .padding(.leading, 16)
            TextField("Name or email", text: $searchQuery)
                .font(ForMe.font(.regular, size: 15))
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(.horizontal, 12)
                .padding(.vertical, 14)
        }
        .background(ForMe.inputBg)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .onChange(of: searchQuery) { _, new in
            debounceSearch(new)
        }

        VStack(spacing: 8) {
            ForEach(searchResults) { user in
                Button {
                    selectedUser = user
                } label: {
                    HStack(spacing: 14) {
                        DynamicAvatar(
                            name: user.name ?? "User",
                            imageUrl: user.image ?? user.imageSrc,
                            size: .medium
                        )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(user.name ?? "User")
                                .font(ForMe.font(.semibold, size: 15))
                                .foregroundColor(ForMe.textPrimary)
                        }
                        Spacer()
                        if selectedUser?.id == user.id {
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
                                selectedUser?.id == user.id ? ForMe.textPrimary : ForMe.border,
                                lineWidth: selectedUser?.id == user.id ? 1.5 : 1
                            )
                    )
                }
                .buttonStyle(.plain)
            }

            if searchQuery.count >= 2 && searchResults.isEmpty {
                Text("No users found")
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone400)
                    .padding(.top, 20)
            }
        }
    }

    @ViewBuilder
    private var roleStep: some View {
        TypeformHeading(
            question: "What's their role?",
            subtitle: "Optional job title and which services they perform"
        )

        FlowTextField(label: "Job title", text: $jobTitle, placeholder: "Stylist, Technician, Manager…")

        if let services = selectedListing?.services, !services.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                FlowLabel(text: "Services they can perform")
                VStack(spacing: 8) {
                    ForEach(services) { service in
                        serviceRow(service)
                    }
                }
            }
        }
    }

    private func serviceRow(_ service: Service) -> some View {
        Button {
            toggle(service.id)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: selectedServiceIds.contains(service.id) ? "checkmark.square.fill" : "square")
                    .font(.system(size: 20))
                    .foregroundColor(selectedServiceIds.contains(service.id) ? ForMe.textPrimary : ForMe.stone300)
                Text(service.serviceName)
                    .font(ForMe.font(.medium, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                Text(service.formattedPrice)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone500)
            }
            .padding(14)
            .background(ForMe.inputBg)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(ForMe.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private func toggle(_ id: String) {
        if selectedServiceIds.contains(id) { selectedServiceIds.remove(id) }
        else { selectedServiceIds.insert(id) }
    }

    // MARK: - Search

    private func debounceSearch(_ query: String) {
        searchTask?.cancel()
        let term = query.trimmingCharacters(in: .whitespaces)
        guard term.count >= 2 else {
            searchResults = []
            return
        }
        searchTask = Task {
            try? await Task.sleep(nanoseconds: 250_000_000)
            guard !Task.isCancelled else { return }
            do {
                let users = try await APIService.shared.searchUsers(term: term)
                if !Task.isCancelled {
                    searchResults = users
                }
            } catch {
                searchResults = []
            }
        }
    }

    // MARK: - Submit

    private func submit() async {
        guard let listing = selectedListing, let user = selectedUser else { return }
        isSubmitting = true
        do {
            _ = try await APIService.shared.addEmployeeToListing(
                listingId: listing.id,
                userId: user.id,
                jobTitle: jobTitle.ws.isEmpty ? nil : jobTitle.ws,
                serviceIds: Array(selectedServiceIds)
            )
            isSubmitting = false
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

#Preview {
    WorkerFlow(listingId: nil)
        .environmentObject(AppState())
        .environmentObject(AuthViewModel())
}
