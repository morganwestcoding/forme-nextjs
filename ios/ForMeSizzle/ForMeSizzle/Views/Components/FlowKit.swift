import SwiftUI
import PhotosUI

// MARK: - FlowKit
//
// Shared building blocks for multi-step create flows (Shop / Listing /
// Product / Worker / Post). Matches the web's Typeform-style input spec
// from /web/src/components/registration + /shop/steps + /listing/steps:
//   • label: 14pt semibold, stone-700, 8pt below the input
//   • input: 14pt vertical / 16pt horizontal padding, bg stone-50,
//     1pt stone-200 border, 12pt corner radius, focus ring stone-900
//   • logo uploader: 200×224, dashed 2pt stone-200 when empty with a
//     40pt white circle holding a + glyph; image fills when set
//   • product slot: 175×175 square, same empty/filled rules
//   • bottom bar: back on left, primary CTA on right, both inside a
//     max-640 container with a 1pt top divider
//
// Keep visual decisions here so the flows stay thin. If you tweak a
// number, it propagates everywhere and we stay consistent with web.

// MARK: - Typography helpers

struct FlowLabel: View {
    let text: String
    var body: some View {
        Text(text)
            .font(ForMe.font(.semibold, size: 14))
            .foregroundColor(ForMe.stone700)
    }
}

// MARK: - Text Input

struct FlowTextField: View {
    let label: String
    @Binding var text: String
    var placeholder: String = ""
    var keyboardType: UIKeyboardType = .default
    var autoCapitalization: TextInputAutocapitalization? = .sentences
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FlowLabel(text: label)
            TextField(placeholder, text: $text)
                .font(ForMe.font(.regular, size: 15))
                .foregroundColor(ForMe.textPrimary)
                .keyboardType(keyboardType)
                .textInputAutocapitalization(autoCapitalization)
                .focused($focused)
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

// MARK: - Multiline Textarea

struct FlowTextArea: View {
    let label: String
    @Binding var text: String
    var placeholder: String = ""
    var minHeight: CGFloat = 108
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FlowLabel(text: label)
            ZStack(alignment: .topLeading) {
                if text.isEmpty && !placeholder.isEmpty {
                    Text(placeholder)
                        .font(ForMe.font(.regular, size: 15))
                        .foregroundColor(ForMe.stone400)
                        .padding(.horizontal, 16 + 4)
                        .padding(.vertical, 14 + 8)
                        .allowsHitTesting(false)
                }
                TextEditor(text: $text)
                    .font(ForMe.font(.regular, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                    .scrollContentBackground(.hidden)
                    .focused($focused)
                    .frame(minHeight: minHeight)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
            }
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

// MARK: - Select Menu

struct FlowSelect: View {
    let label: String
    @Binding var selection: String
    let placeholder: String
    let options: [(value: String, label: String)]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FlowLabel(text: label)
            Menu {
                Button(placeholder) { selection = "" }
                ForEach(options, id: \.value) { option in
                    Button(option.label) { selection = option.value }
                }
            } label: {
                HStack {
                    Text(displayLabel)
                        .font(ForMe.font(.regular, size: 15))
                        .foregroundColor(selection.isEmpty ? ForMe.stone400 : ForMe.textPrimary)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(ForMe.stone400)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(ForMe.inputBg)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(ForMe.border, lineWidth: 1)
                )
            }
        }
    }

    private var displayLabel: String {
        if selection.isEmpty { return placeholder }
        return options.first(where: { $0.value == selection })?.label ?? selection
    }
}

// MARK: - Chip / Tag

struct FlowChip: View {
    let text: String
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 6) {
            Text(text)
                .font(ForMe.font(.medium, size: 13))
                .foregroundColor(ForMe.textPrimary)
            Button(action: onRemove) {
                Image(systemName: "xmark")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(ForMe.stone100)
        .clipShape(Capsule())
    }
}

// MARK: - Toggle Row

struct FlowToggleRow: View {
    let title: String
    let subtitle: String
    @Binding var isOn: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(ForMe.font(.semibold, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                Text(subtitle)
                    .font(ForMe.font(.regular, size: 12))
                    .foregroundColor(ForMe.stone500)
            }
            Spacer(minLength: 16)
            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(ForMe.stone900)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(ForMe.inputBg)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
    }
}

// MARK: - Logo Uploader (200×224)

struct FlowLogoUploader: View {
    @Binding var item: PhotosPickerItem?
    @Binding var data: Data?
    var width: CGFloat = 200
    var height: CGFloat = 224

    var body: some View {
        PhotosPicker(selection: $item, matching: .images) {
            ZStack {
                if let d = data, let ui = UIImage(data: d) {
                    // Filled state — image fills, subtle edit overlay on tap
                    Image(uiImage: ui)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: width, height: height)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(alignment: .topTrailing) {
                            Image(systemName: "pencil")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.black.opacity(0.45))
                                .clipShape(Circle())
                                .padding(10)
                        }
                } else {
                    // Empty state — dashed border, plus in a 40×40 white circle
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(ForMe.inputBg)
                        .frame(width: width, height: height)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(
                                    ForMe.border,
                                    style: StrokeStyle(lineWidth: 2, dash: [6, 4])
                                )
                        )
                        .overlay(plusCircle)
                }
            }
        }
        .buttonStyle(.plain)
        .onChange(of: item) { _, new in
            Task {
                if let loaded = try? await new?.loadTransferable(type: Data.self) {
                    data = loaded
                }
            }
        }
    }

    private var plusCircle: some View {
        ZStack {
            Circle()
                .fill(ForMe.surface)
                .frame(width: 40, height: 40)
                .elevation(.level1)
                .overlay(Circle().stroke(ForMe.border, lineWidth: 1))
            Image(systemName: "plus")
                .font(.system(size: 18, weight: .regular))
                .foregroundColor(ForMe.stone400)
        }
    }
}

// MARK: - Product Image Slot (175×175)

struct FlowProductImageSlot: View {
    @Binding var item: PhotosPickerItem?
    @Binding var data: Data?
    var size: CGFloat = 100

    var body: some View {
        PhotosPicker(selection: $item, matching: .images) {
            ZStack {
                if let d = data, let ui = UIImage(data: d) {
                    Image(uiImage: ui)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: size, height: size)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(alignment: .topTrailing) {
                            Button {
                                data = nil
                                item = nil
                            } label: {
                                Image(systemName: "xmark")
                                    .font(.system(size: 10, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(width: 22, height: 22)
                                    .background(Color.black.opacity(0.5))
                                    .clipShape(Circle())
                            }
                            .buttonStyle(.plain)
                            .padding(6)
                        }
                } else {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(ForMe.inputBg)
                        .frame(width: size, height: size)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(ForMe.border, style: StrokeStyle(lineWidth: 2, dash: [6, 4]))
                        )
                        .overlay(
                            ZStack {
                                Circle()
                                    .fill(ForMe.surface)
                                    .frame(width: 36, height: 36)
                                    .elevation(.level1)
                                    .overlay(Circle().stroke(ForMe.border, lineWidth: 1))
                                Image(systemName: "plus")
                                    .font(.system(size: 16, weight: .regular))
                                    .foregroundColor(ForMe.stone400)
                            }
                        )
                }
            }
        }
        .buttonStyle(.plain)
        .onChange(of: item) { _, new in
            Task {
                if let loaded = try? await new?.loadTransferable(type: Data.self) {
                    data = loaded
                }
            }
        }
    }
}

// MARK: - Progress Bar (4pt, animated)

struct FlowProgressBar: View {
    var progress: CGFloat  // 0...1

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule(style: .continuous)
                    .fill(ForMe.stone100)

                Capsule(style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [ForMe.stone700, ForMe.stone900],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: max(0, geo.size.width * progress))
                    .animation(.interpolatingSpring(stiffness: 300, damping: 30), value: progress)
            }
        }
        .frame(height: 4)
        .padding(.horizontal, ForMe.space4)
        .padding(.top, 6)
    }
}

// MARK: - Bottom Navigation

struct FlowBottomBar: View {
    var backLabel: String = "Back"
    var primaryLabel: String
    var canProceed: Bool
    var isLoading: Bool
    var showBack: Bool
    var onBack: () -> Void
    var onPrimary: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Divider()
                .background(ForMe.stone100)
            HStack(spacing: 16) {
                if showBack {
                    Button(action: onBack) {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 12, weight: .semibold))
                            Text(backLabel)
                                .font(ForMe.font(.medium, size: 14))
                        }
                        .foregroundColor(ForMe.stone500)
                    }
                    .buttonStyle(.plain)
                }

                Spacer()

                Button(action: onPrimary) {
                    Group {
                        if isLoading {
                            ForMeLoader(size: .small, color: .white)
                        } else {
                            Text(primaryLabel)
                                .font(ForMe.font(.semibold, size: 14))
                                .foregroundColor(.white)
                        }
                    }
                    .frame(minWidth: 132)
                    .frame(height: 44)
                    .padding(.horizontal, 18)
                    .background(canProceed ? ForMe.stone900 : ForMe.stone300)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .shadow(color: canProceed ? .black.opacity(0.12) : .clear, radius: 6, x: 0, y: 2)
                }
                .buttonStyle(.plain)
                .disabled(!canProceed || isLoading)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .background(ForMe.background)
        }
    }
}

// MARK: - Step Transition (direction-aware slide + fade)
//
// Matches the web's framer-motion slide:
//   enter: y = ±20, opacity 0    →    center: y = 0, opacity 1
// Apply via `.transition(.flowStep(direction:))` inside a ZStack
// or with `.animation(...)` where the step ID changes.

extension AnyTransition {
    static func flowStep(direction: Int) -> AnyTransition {
        .asymmetric(
            insertion: .offset(y: CGFloat(direction) * 20).combined(with: .opacity),
            removal: .offset(y: CGFloat(-direction) * 20).combined(with: .opacity)
        )
    }
}

// MARK: - Flow Scaffold
//
// Top-level wrapper every create flow uses so the progress bar, step
// container, transitions, and bottom bar stay identical across flows.
// The caller swaps `content` per step and bumps `stepIndex` to trigger
// the slide. Direction is derived from the step delta.

struct FlowScaffold<StepContent: View>: View {
    let title: String
    let progress: CGFloat
    let stepIndex: Int
    let direction: Int
    let showBack: Bool
    let primaryLabel: String
    let canProceed: Bool
    let isLoading: Bool
    let onBack: () -> Void
    let onPrimary: () -> Void
    let onClose: () -> Void
    @ViewBuilder var content: () -> StepContent

    var body: some View {
        VStack(spacing: 0) {
            FlowProgressBar(progress: progress)

            // Web uses `flex-1 flex items-center justify-center` here. On iOS
            // we fake vertical centering inside a ScrollView by sandwiching
            // the step between flexible spacers that collapse to zero once
            // the content grows taller than the viewport — so short steps
            // sit mid-screen and long ones scroll from the top.
            GeometryReader { geo in
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        Spacer(minLength: 24)
                        content()
                            .id(stepIndex)
                            .transition(.flowStep(direction: direction))
                            .padding(.horizontal, 24)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Spacer(minLength: 24)
                    }
                    .frame(minHeight: geo.size.height)
                    .frame(maxWidth: .infinity)
                }
                .scrollDismissesKeyboard(.interactively)
                .animation(.easeOut(duration: 0.28), value: stepIndex)
            }

            FlowBottomBar(
                primaryLabel: primaryLabel,
                canProceed: canProceed,
                isLoading: isLoading,
                showBack: showBack,
                onBack: onBack,
                onPrimary: onPrimary
            )
        }
        .background(ForMe.background)
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                }
            }
        }
    }
}

// MARK: - Dropdown Picker (state-style)
//
// Button input that expands an inline list of options below itself
// with a fade+slide transition. Matches web LocationStep's state
// dropdown: focus ring when open, chevron rotates 180°, checkmark
// against the selected row.

struct FlowDropdownPicker: View {
    let label: String
    let placeholder: String
    let options: [String]
    @Binding var selection: String
    var disabled: Bool = false
    @State private var isOpen: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FlowLabel(text: label)

            Button {
                guard !disabled else { return }
                withAnimation(.easeOut(duration: 0.15)) { isOpen.toggle() }
            } label: {
                HStack(spacing: 12) {
                    Text(selection.isEmpty ? placeholder : selection)
                        .font(ForMe.font(.regular, size: 15))
                        .foregroundColor(selection.isEmpty ? ForMe.stone400 : ForMe.textPrimary)
                        .lineLimit(1)
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.down")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(ForMe.stone400)
                        .rotationEffect(.degrees(isOpen ? 180 : 0))
                        .animation(.easeOut(duration: 0.2), value: isOpen)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(ForMe.inputBg)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(isOpen ? ForMe.textPrimary : ForMe.border, lineWidth: isOpen ? 1.5 : 1)
                )
                .opacity(disabled ? 0.5 : 1)
            }
            .buttonStyle(.plain)

            if isOpen {
                DropdownList(options: options, selection: selection) { picked in
                    selection = picked
                    withAnimation(.easeOut(duration: 0.15)) { isOpen = false }
                }
                .transition(.asymmetric(
                    insertion: .offset(y: -8).combined(with: .opacity),
                    removal: .offset(y: -8).combined(with: .opacity)
                ))
            }
        }
    }
}

// MARK: - Autocomplete field (city + street)

struct FlowAutocompleteField: View {
    let label: String
    @Binding var text: String
    let placeholder: String
    var suggestions: [String]
    var suggestionSubtext: [String: String] = [:]  // optional trailing text (e.g. ZIP next to an address)
    var isLoading: Bool = false
    var disabled: Bool = false
    var onSelect: (String) -> Void
    @FocusState private var focused: Bool

    // Dropdown visibility is derived, not stored, so picking a row can't
    // race with the `onChange(of: text)` that would otherwise re-open it.
    private var showDropdown: Bool { focused && !suggestions.isEmpty }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FlowLabel(text: label)

            ZStack(alignment: .trailing) {
                TextField(placeholder, text: $text)
                    .font(ForMe.font(.regular, size: 15))
                    .foregroundColor(ForMe.textPrimary)
                    .textInputAutocapitalization(.words)
                    .autocorrectionDisabled()
                    .focused($focused)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(ForMe.inputBg)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(focused ? ForMe.textPrimary : ForMe.border, lineWidth: focused ? 1.5 : 1)
                    )
                    .disabled(disabled)
                    .opacity(disabled ? 0.5 : 1)

                if isLoading {
                    ProgressView()
                        .scaleEffect(0.75)
                        .padding(.trailing, 14)
                }
            }

            if showDropdown {
                DropdownList(
                    options: suggestions,
                    selection: text,
                    subtext: suggestionSubtext
                ) { picked in
                    onSelect(picked)
                    focused = false
                }
                .transition(.asymmetric(
                    insertion: .offset(y: -8).combined(with: .opacity),
                    removal: .offset(y: -8).combined(with: .opacity)
                ))
            }
        }
        .animation(.easeOut(duration: 0.15), value: showDropdown)
    }
}

// MARK: - Shared dropdown list body

struct DropdownList: View {
    let options: [String]
    let selection: String
    var subtext: [String: String] = [:]
    let onSelect: (String) -> Void

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                ForEach(options, id: \.self) { option in
                    Button {
                        onSelect(option)
                    } label: {
                        HStack(spacing: 10) {
                            Text(option)
                                .font(ForMe.font(selection == option ? .semibold : .regular, size: 14))
                                .foregroundColor(ForMe.textPrimary)
                                .lineLimit(1)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            if let sub = subtext[option], !sub.isEmpty {
                                Text(sub)
                                    .font(ForMe.font(.regular, size: 11))
                                    .foregroundColor(ForMe.stone400)
                            }
                            if selection == option {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(ForMe.textPrimary)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .contentShape(Rectangle())
                        .background(selection == option ? ForMe.stone100 : Color.clear)
                    }
                    .buttonStyle(.plain)

                    if option != options.last {
                        Rectangle()
                            .fill(ForMe.border)
                            .frame(height: 1)
                            .padding(.leading, 16)
                    }
                }
            }
        }
        .frame(maxHeight: 240)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(ForMe.border, lineWidth: 1)
        )
        .elevation(.level2)
    }
}

// MARK: - Location Preview card
//
// Appears after all four location fields are filled. Matches web's
// `flex items-center gap-3 p-4 bg-stone-50 rounded-xl` preview with
// the black map-pin circle.

struct FlowLocationPreview: View {
    let street: String
    let city: String
    let state: String
    let zip: String

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(ForMe.stone900)
                    .frame(width: 40, height: 40)
                Image(systemName: "mappin.and.ellipse")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(street)
                    .font(ForMe.font(.semibold, size: 14))
                    .foregroundColor(ForMe.textPrimary)
                    .lineLimit(1)
                Text("\(city), \(state) \(zip)")
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone500)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .background(ForMe.inputBg)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
