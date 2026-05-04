import SwiftUI

// MARK: - FlowLocationFields
//
// Drop-in composite that mirrors web LocationStep exactly: four fields
// (State / City / Street / ZIP) with progressive disclosure — Street
// and ZIP only appear once State and City are locked, and a summary
// card appears once all four are filled. State is a dropdown, City and
// Street are autocompletes hitting the same free services the web
// uses (countriesnow + Nominatim OSM, both keyless).
//
// Consumers bind four outputs (state, city, address, zipCode). The
// composite owns the loading + suggestion state itself so no flow has
// to re-implement debounce or suggestion dedupe.

struct FlowLocationFields: View {
    @Binding var state: String
    @Binding var city: String
    @Binding var address: String
    @Binding var zipCode: String

    // Internal state
    @State private var cityInput: String = ""
    @State private var cities: [String] = []
    @State private var isLoadingCities = false
    @State private var cityTask: Task<Void, Never>?

    @State private var addressSuggestions: [AddressSuggestion] = []
    @State private var isLoadingAddresses = false
    @State private var addressTask: Task<Void, Never>?

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Row 1 — State + City
            HStack(alignment: .top, spacing: 12) {
                FlowDropdownPicker(
                    label: "State",
                    placeholder: "Select",
                    options: LocationData.usStates,
                    selection: Binding(
                        get: { state },
                        set: { new in
                            state = new
                            city = ""
                            cityInput = ""
                            Task { await loadCities(for: new) }
                        }
                    )
                )

                FlowAutocompleteField(
                    label: "City",
                    text: $cityInput,
                    placeholder: state.isEmpty ? "Select state first"
                                               : (isLoadingCities ? "Loading…" : "Type to search"),
                    suggestions: filteredCities,
                    isLoading: isLoadingCities,
                    disabled: state.isEmpty || isLoadingCities,
                    onSelect: { picked in
                        city = picked
                        cityInput = picked
                    }
                )
            }

            // Row 2 — Street + ZIP (only once state and city chosen)
            if !state.isEmpty && !city.isEmpty {
                HStack(alignment: .top, spacing: 12) {
                    FlowAutocompleteField(
                        label: "Street address",
                        text: $address,
                        placeholder: "Start typing an address…",
                        suggestions: addressSuggestions.map(\.display),
                        suggestionSubtext: Dictionary(uniqueKeysWithValues:
                            addressSuggestions.map { ($0.display, $0.zip) }
                        ),
                        isLoading: isLoadingAddresses,
                        onSelect: { picked in
                            address = picked
                            if let match = addressSuggestions.first(where: { $0.display == picked }),
                               !match.zip.isEmpty, zipCode.isEmpty {
                                zipCode = match.zip
                            }
                        }
                    )
                    .onChange(of: address) { _, new in
                        debounceAddress(new)
                    }
                    .layoutPriority(2)

                    FlowZipField(text: $zipCode)
                        .frame(width: 110)
                }
                .transition(.opacity.combined(with: .offset(y: 8)))
            }

            // Preview — only after all four filled
            if !address.isEmpty && !city.isEmpty && !state.isEmpty && !zipCode.isEmpty {
                FlowLocationPreview(street: address, city: city, state: state, zip: zipCode)
                    .transition(.opacity.combined(with: .offset(y: 8)))
            }
        }
        .animation(.easeOut(duration: 0.22), value: state.isEmpty || city.isEmpty)
        .animation(.easeOut(duration: 0.22), value: zipCode.isEmpty || address.isEmpty)
        .onAppear {
            cityInput = city
            if !state.isEmpty && cities.isEmpty {
                Task { await loadCities(for: state) }
            }
        }
    }

    private var filteredCities: [String] {
        guard !cityInput.isEmpty else { return cities }
        let lower = cityInput.lowercased()
        return cities.filter { $0.lowercased().contains(lower) }
    }

    private func loadCities(for state: String) async {
        cityTask?.cancel()
        cities = []
        guard !state.isEmpty else { return }
        isLoadingCities = true
        cityTask = Task {
            defer { isLoadingCities = false }
            do {
                let list = try await CitiesAPI.fetch(state: state)
                guard !Task.isCancelled else { return }
                cities = list
            } catch {
                cities = []
            }
        }
        await cityTask?.value
    }

    private func debounceAddress(_ query: String) {
        addressTask?.cancel()
        guard query.count >= 3 else {
            addressSuggestions = []
            return
        }
        let currentCity = city
        let currentState = state
        addressTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000)
            guard !Task.isCancelled else { return }
            isLoadingAddresses = true
            defer { isLoadingAddresses = false }
            do {
                let list = try await AddressAPI.fetch(query: query, city: currentCity, state: currentState)
                guard !Task.isCancelled else { return }
                addressSuggestions = list
            } catch {
                addressSuggestions = []
            }
        }
    }
}

// MARK: - ZIP field
//
// Split into its own component so the layout can size it (flex-1 while
// street takes flex-[2]) without the parent importing FlowTextField's
// whole wrapper. Numeric keyboard + 10-char cap.

struct FlowZipField: View {
    @Binding var text: String
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FlowLabel(text: "ZIP code")
            TextField("12345", text: $text)
                .font(ForMe.font(.regular, size: 15))
                .foregroundColor(ForMe.textPrimary)
                .keyboardType(.numberPad)
                .textInputAutocapitalization(.never)
                .focused($focused)
                .onChange(of: text) { _, new in
                    if new.count > 10 { text = String(new.prefix(10)) }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(ForMe.inputBg)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(focused ? ForMe.textPrimary : ForMe.border, lineWidth: focused ? 1.5 : 1)
                )
                .animation(.easeOut(duration: 0.15), value: focused)
        }
    }
}
