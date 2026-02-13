import SwiftUI

struct UserTypeStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("How will you use ForMe?")
                    .font(.title.bold())

                Text("This helps us set up the right experience for you")
                    .foregroundColor(ForMe.textSecondary)
            }

            VStack(spacing: 12) {
                ForEach(OnboardingUserType.allCases, id: \.self) { type in
                    let isSelected = viewModel.userType == type

                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            viewModel.userType = type
                            viewModel.userTypeChanged()
                        }
                    } label: {
                        HStack(spacing: 16) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(isSelected ? ForMe.accent : ForMe.inputBg)
                                    .frame(width: 48, height: 48)

                                Image(systemName: type.icon)
                                    .font(.title3)
                                    .foregroundColor(isSelected ? .white : ForMe.textSecondary)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(type.title)
                                    .font(.body.weight(.semibold))
                                    .foregroundColor(.primary)

                                Text(type.description)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }

                            Spacer()
                        }
                        .padding(16)
                        .background(isSelected ? ForMe.accentLight : ForMe.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(isSelected ? ForMe.accent : ForMe.border, lineWidth: isSelected ? 2 : 1)
                        )
                        .cornerRadius(12)
                    }
                }
            }
        }
    }
}
