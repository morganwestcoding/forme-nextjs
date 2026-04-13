import SwiftUI

struct StudentAcademyStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Which academy are you enrolled at?")
                    .font(.title.bold())

                Text("Pick the partner school you're currently training with")
                    .foregroundColor(ForMe.textSecondary)
            }

            if viewModel.isLoadingAcademies {
                HStack {
                    ProgressView()
                    Text("Loading academies…")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, 24)
            } else if let error = viewModel.academiesError {
                Text("Could not load academies. \(error)")
                    .font(.subheadline)
                    .foregroundColor(.red)
                    .padding(.vertical, 12)
            } else if viewModel.academies.isEmpty {
                Text("No partner academies available yet.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.vertical, 12)
            } else {
                VStack(spacing: 12) {
                    ForEach(viewModel.academies) { academy in
                        let isSelected = viewModel.selectedAcademyId == academy.id

                        Button {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                viewModel.selectedAcademyId = academy.id
                            }
                        } label: {
                            HStack(alignment: .top, spacing: 12) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(academy.name)
                                        .font(.body.weight(.semibold))
                                        .foregroundColor(isSelected ? .white : .primary)

                                    if let description = academy.description {
                                        Text(description)
                                            .font(.subheadline)
                                            .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
                                            .lineLimit(2)
                                            .multilineTextAlignment(.leading)
                                    }
                                }

                                Spacer(minLength: 0)

                                if isSelected {
                                    Image(systemName: "checkmark.circle.fill")
                                        .font(.title3)
                                        .foregroundColor(.white)
                                }
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(isSelected ? ForMe.textPrimary : ForMe.surface)
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
        .task {
            await viewModel.loadAcademies()
        }
    }
}
