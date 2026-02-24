import SwiftUI

struct OnboardingFlowView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var viewModel = OnboardingViewModel()
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack(spacing: 0) {
            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(ForMe.borderLight)
                        .frame(height: 3)

                    Rectangle()
                        .fill(Color(hex: "171717"))
                        .frame(width: geo.size.width * viewModel.progress, height: 3)
                        .animation(.easeInOut(duration: 0.3), value: viewModel.progress)
                }
            }
            .frame(height: 3)

            // Step content
            ScrollView {
                VStack(spacing: 0) {
                    stepContent
                        .padding(.horizontal, 24)
                        .padding(.top, 32)
                        .padding(.bottom, 120)
                        .id(viewModel.currentStep)
                        .transition(.asymmetric(
                            insertion: .move(edge: viewModel.direction > 0 ? .trailing : .leading).combined(with: .opacity),
                            removal: .move(edge: viewModel.direction > 0 ? .leading : .trailing).combined(with: .opacity)
                        ))
                }
                .animation(.easeInOut(duration: 0.3), value: viewModel.currentStep)
            }
            .scrollDismissesKeyboard(.interactively)

            // Bottom button area
            VStack(spacing: 12) {
                Divider()

                if let error = viewModel.submitError {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }

                Button {
                    if viewModel.isLastStep {
                        Task {
                            if await viewModel.submit(authViewModel: authViewModel) {
                                dismiss()
                            }
                        }
                    } else {
                        viewModel.nextStep()
                    }
                } label: {
                    if viewModel.isSubmitting {
                        ForMeLoader(size: .small, color: .white)
                    } else {
                        Text(viewModel.isLastStep ? "Create Account" : "Continue")
                    }
                }
                .buttonStyle(ForMeAccentButtonStyle(isEnabled: viewModel.canProceed))
                .disabled(!viewModel.canProceed || viewModel.isSubmitting)
                .padding(.horizontal, 24)

                if viewModel.currentStep == .interests {
                    Button("Skip") {
                        viewModel.nextStep()
                    }
                    .font(.subheadline)
                    .foregroundColor(ForMe.textSecondary)
                }
            }
            .padding(.bottom, 8)
        }
        .tint(ForMe.textPrimary)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                if !viewModel.isFirstStep {
                    Button {
                        viewModel.previousStep()
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.body.weight(.medium))
                    }
                }
            }

            ToolbarItem(placement: .principal) {
                Text("Step \(viewModel.currentStepIndex + 1) of \(viewModel.steps.count)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .interactiveDismissDisabled()
    }

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case .account:
            AccountStepView(viewModel: viewModel)
        case .interests:
            InterestsStepView(viewModel: viewModel)
        case .userType:
            UserTypeStepView(viewModel: viewModel)
        case .jobTitle:
            JobTitleStepView(viewModel: viewModel)
        case .listingCategory:
            ListingCategoryStepView(viewModel: viewModel)
        case .listingInfo:
            ListingInfoStepView(viewModel: viewModel)
        case .location:
            LocationStepView(viewModel: viewModel)
        case .profile:
            ProfileStepView(viewModel: viewModel)
        }
    }
}

#Preview {
    NavigationStack {
        OnboardingFlowView()
            .environmentObject(AuthViewModel())
    }
}
