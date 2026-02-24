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
                                    .fill(isSelected ? ForMe.textPrimary : ForMe.inputBg)
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
                        .background(isSelected ? Color(hex: "F3F4F6") : ForMe.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(isSelected ? ForMe.borderHover : ForMe.border, lineWidth: isSelected ? 2 : 1)
                        )
                        .cornerRadius(12)
                        .shadow(color: isSelected ? .black.opacity(0.08) : .clear, radius: 2, x: 0, y: 1)
                    }
                }
            }
        }
    }
}
