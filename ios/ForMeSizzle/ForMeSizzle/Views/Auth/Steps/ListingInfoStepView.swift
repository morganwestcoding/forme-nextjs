import SwiftUI

struct ListingInfoStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var focusedField: Field?

    enum Field {
        case title, description
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Tell us about your services")
                    .font(.title.bold())

                Text("This information will be displayed on your listing")
                    .foregroundColor(ForMe.textSecondary)
            }

            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Listing title")
                        .font(.subheadline.weight(.medium))

                    TextField("\(viewModel.name)'s Services", text: $viewModel.listingTitle)
                        .focused($focusedField, equals: .title)
                        .forMeInput()
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Description")
                        .font(.subheadline.weight(.medium))

                    ZStack(alignment: .topLeading) {
                        if viewModel.listingDescription.isEmpty {
                            Text("Describe your services and experience...")
                                .foregroundColor(Color(.placeholderText))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                        }

                        TextEditor(text: $viewModel.listingDescription)
                            .focused($focusedField, equals: .description)
                            .frame(minHeight: 100)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .scrollContentBackground(.hidden)
                    }
                    .background(ForMe.inputBg)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(ForMe.borderLight, lineWidth: 1)
                    )
                    .cornerRadius(12)

                    Text("Optional — you can add this later")
                        .font(.caption)
                        .foregroundColor(ForMe.textTertiary)
                }
            }
        }
        .onAppear {
            if viewModel.listingTitle.isEmpty {
                viewModel.listingTitle = "\(viewModel.name)'s Services"
            }
            focusedField = .title
        }
    }
}
