import SwiftUI

struct LocationStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isCityFocused: Bool

    private static let usStates = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming"
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Where are you located?")
                    .font(.title.bold())

                Text("This helps clients find services near them")
                    .foregroundColor(ForMe.textSecondary)
            }

            VStack(spacing: 16) {
                // State picker
                VStack(alignment: .leading, spacing: 6) {
                    Text("State")
                        .font(.subheadline.weight(.medium))

                    Menu {
                        ForEach(Self.usStates, id: \.self) { state in
                            Button(state) {
                                viewModel.selectedState = state
                            }
                        }
                    } label: {
                        HStack {
                            Image(systemName: "mappin.circle.fill")
                                .foregroundColor(.secondary)

                            Text(viewModel.selectedState.isEmpty ? "Select a state" : viewModel.selectedState)
                                .foregroundColor(viewModel.selectedState.isEmpty ? Color(.placeholderText) : .primary)

                            Spacer()

                            Image(systemName: "chevron.up.chevron.down")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .forMeInput()
                    }
                }

                // City input (appears after state selected)
                if !viewModel.selectedState.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("City")
                            .font(.subheadline.weight(.medium))

                        TextField("Enter your city", text: $viewModel.city)
                            .focused($isCityFocused)
                            .forMeInput()
                    }
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }

                // Location preview
                if !viewModel.city.isEmpty && !viewModel.selectedState.isEmpty {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(ForMe.textPrimary)
                                .frame(width: 40, height: 40)

                            Image(systemName: "mappin")
                                .foregroundColor(.white)
                                .font(.body)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(viewModel.city), \(viewModel.selectedState)")
                                .font(.body.weight(.medium))

                            Text("Your location")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()
                    }
                    .forMeCard(padding: 12)
                    .transition(.opacity)
                }
            }
            .animation(.easeInOut(duration: 0.2), value: viewModel.selectedState)
            .animation(.easeInOut(duration: 0.2), value: viewModel.city)
        }
        .onChange(of: viewModel.selectedState) {
            isCityFocused = true
        }
    }
}
