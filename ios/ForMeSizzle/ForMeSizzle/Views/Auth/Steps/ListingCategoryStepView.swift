import SwiftUI

struct ListingCategoryStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("What type of services do you offer?")
                    .font(.title.bold())

                Text("Choose a category that best describes your work")
                    .foregroundColor(ForMe.textSecondary)
            }

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(ServiceCategory.allCases, id: \.self) { category in
                    let isSelected = viewModel.listingCategory == category

                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            viewModel.listingCategory = category
                        }
                    } label: {
                        VStack(spacing: 8) {
                            Image(systemName: category.icon)
                                .font(.title2)

                            Text(category.rawValue)
                                .font(.subheadline.weight(.medium))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        .background(isSelected ? Color(hex: "F3F4F6") : ForMe.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(isSelected ? ForMe.borderHover : ForMe.border, lineWidth: isSelected ? 2 : 1)
                        )
                        .cornerRadius(12)
                        .shadow(color: isSelected ? .black.opacity(0.08) : .clear, radius: 2, x: 0, y: 1)
                    }
                    .foregroundColor(isSelected ? ForMe.textPrimary : ForMe.textSecondary)
                }
            }
        }
    }
}
