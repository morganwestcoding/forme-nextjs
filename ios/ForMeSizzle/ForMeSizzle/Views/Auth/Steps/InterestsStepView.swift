import SwiftUI

struct InterestsStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    private let categories = [
        "Massage", "Wellness", "Fitness", "Nails",
        "Spa", "Barber", "Beauty", "Salon"
    ]

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("What are you interested in?")
                    .font(.title.bold())

                Text("Select all that apply. This helps us personalize your experience.")
                    .foregroundColor(ForMe.textSecondary)
            }

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(categories, id: \.self) { category in
                    let isSelected = viewModel.selectedInterests.contains(category)

                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            if isSelected {
                                viewModel.selectedInterests.removeAll { $0 == category }
                            } else {
                                viewModel.selectedInterests.append(category)
                            }
                        }
                    } label: {
                        Text(category)
                            .font(.subheadline.weight(.medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(isSelected ? ForMe.accentLight : ForMe.surface)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(isSelected ? ForMe.accent : ForMe.border, lineWidth: isSelected ? 2 : 1)
                            )
                            .cornerRadius(12)
                    }
                    .foregroundColor(isSelected ? ForMe.accent : ForMe.textSecondary)
                }
            }

            Text("Optional — you can skip this step")
                .font(.caption)
                .foregroundColor(ForMe.textTertiary)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.top, 8)
        }
    }
}
