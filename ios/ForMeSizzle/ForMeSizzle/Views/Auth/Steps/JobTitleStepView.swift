import SwiftUI

struct JobTitleStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isJobTitleFocused: Bool

    private var isTeam: Bool { viewModel.userType == .team }

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text(isTeam ? "What's your role?" : "What do you do?")
                    .font(.title.bold())

                Text(isTeam ? "Tell us about your position" : "This will be displayed on your profile")
                    .foregroundColor(ForMe.textSecondary)
            }

            VStack(spacing: 16) {
                // Owner/Manager toggle for team
                if isTeam {
                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            viewModel.isOwnerManager.toggle()
                        }
                    } label: {
                        HStack(spacing: 16) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(viewModel.isOwnerManager ? ForMe.textPrimary : ForMe.border, lineWidth: 2)
                                    .frame(width: 24, height: 24)
                                    .background(
                                        RoundedRectangle(cornerRadius: 8)
                                            .fill(viewModel.isOwnerManager ? ForMe.textPrimary : Color.clear)
                                    )

                                if viewModel.isOwnerManager {
                                    Image(systemName: "checkmark")
                                        .font(.caption.bold())
                                        .foregroundColor(.white)
                                }
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("I'm the owner or manager")
                                    .font(.body.weight(.medium))
                                    .foregroundColor(.primary)

                                Text("You'll have full access to manage the business")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Spacer()
                        }
                        .padding(16)
                        .background(viewModel.isOwnerManager ? Color(hex: "F3F4F6") : ForMe.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(viewModel.isOwnerManager ? ForMe.borderHover : ForMe.border, lineWidth: viewModel.isOwnerManager ? 2 : 1)
                        )
                        .cornerRadius(12)
                        .shadow(color: viewModel.isOwnerManager ? .black.opacity(0.08) : .clear, radius: 2, x: 0, y: 1)
                    }
                }

                // Job title field (hidden for team owner/manager)
                if !isTeam || !viewModel.isOwnerManager {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Job title")
                            .font(.subheadline.weight(.medium))

                        TextField(
                            isTeam ? "e.g., Senior Stylist, Barber" : "e.g., Hair Stylist, Makeup Artist",
                            text: $viewModel.jobTitle
                        )
                        .focused($isJobTitleFocused)
                        .forMeInput()
                    }
                }
            }
        }
        .onAppear {
            if !isTeam {
                isJobTitleFocused = true
            }
        }
    }
}
