import SwiftUI

// Sheet-based date-range picker modelled after the reference design:
// preset list on the left, current range + Cancel/Apply up top, and the
// calendar filling the main area. Desktop uses two side-by-side months;
// on a phone that layout is cramped, so we show a single full-width
// graphical DatePicker and switch between From / To via a segmented
// control. Semantically identical to the reference.
struct AnalyticsDateRangePicker: View {
    // The picker returns fresh dates via `onApply`. It doesn't mutate the
    // view model directly so the parent can defer the network call until
    // after the sheet dismisses.
    let initialStart: Date
    let initialEnd: Date
    let initialPreset: AnalyticsViewModel.Preset?
    let onApply: (_ start: Date, _ end: Date) -> Void
    let onCancel: () -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var start: Date
    @State private var end: Date
    @State private var preset: AnalyticsViewModel.Preset?
    @State private var activeEndpoint: Endpoint = .from

    enum Endpoint: String, CaseIterable, Identifiable {
        case from, to
        var id: String { rawValue }
        var title: String { self == .from ? "From" : "To" }
    }

    init(
        initialStart: Date,
        initialEnd: Date,
        initialPreset: AnalyticsViewModel.Preset?,
        onApply: @escaping (Date, Date) -> Void,
        onCancel: @escaping () -> Void
    ) {
        self.initialStart = initialStart
        self.initialEnd = initialEnd
        self.initialPreset = initialPreset
        self.onApply = onApply
        self.onCancel = onCancel
        _start = State(initialValue: initialStart)
        _end = State(initialValue: initialEnd)
        _preset = State(initialValue: initialPreset)
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    rangeSummary
                    presetsRow
                    endpointToggle
                    calendar
                    clearButton
                }
                .padding(.horizontal, 16)
                .padding(.top, 16)
                .padding(.bottom, 32)
            }
        }
        .background(ForMe.background)
    }

    // MARK: - Sections

    private var header: some View {
        HStack {
            Button("Cancel") {
                onCancel()
                dismiss()
            }
            .foregroundColor(ForMe.stone600)

            Spacer()

            Text("Select range")
                .font(ForMe.font(.semibold, size: 15))
                .foregroundColor(ForMe.textPrimary)

            Spacer()

            Button {
                onApply(start, end)
                dismiss()
            } label: {
                Text("Apply")
                    .font(ForMe.font(.semibold, size: 13))
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .frame(height: 32)
                    .background(
                        Capsule().fill(isValid ? ForMe.stone900 : ForMe.stone300)
                    )
            }
            .disabled(!isValid)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var rangeSummary: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(summaryLabel)
                .font(ForMe.font(.semibold, size: 17))
                .foregroundColor(ForMe.textPrimary)
            Text("\(dayCount) day\(dayCount == 1 ? "" : "s")")
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.stone500)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var presetsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(AnalyticsViewModel.Preset.allCases) { p in
                    let active = preset == p
                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            let r = p.range()
                            start = r.start
                            end = r.end
                            preset = p
                        }
                    } label: {
                        Text(p.title)
                            .font(ForMe.font(active ? .semibold : .medium, size: 12))
                            .foregroundColor(active ? .white : ForMe.stone600)
                            .padding(.horizontal, 14)
                            .frame(height: 32)
                            .background(
                                Capsule()
                                    .fill(active ? ForMe.stone900 : ForMe.stone50)
                            )
                            .overlay(
                                Capsule().stroke(active ? .clear : ForMe.stone200, lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var endpointToggle: some View {
        HStack(spacing: 8) {
            ForEach(Endpoint.allCases) { endpoint in
                let active = activeEndpoint == endpoint
                Button {
                    withAnimation(.easeInOut(duration: 0.15)) { activeEndpoint = endpoint }
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(endpoint.title)
                            .font(ForMe.font(.medium, size: 11))
                            .foregroundColor(ForMe.stone500)
                        Text(formatFull(endpoint == .from ? start : end))
                            .font(ForMe.font(.semibold, size: 14))
                            .foregroundColor(ForMe.textPrimary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(active ? ForMe.surface : ForMe.stone50)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(active ? ForMe.stone900 : ForMe.stone200, lineWidth: active ? 1.5 : 1)
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var calendar: some View {
        // Custom range-aware calendar in place of the native graphical
        // DatePicker so the sheet matches the app's stone palette +
        // capsule chrome and we get real range highlighting (tinted cells
        // between start and end, filled discs on the endpoints) that the
        // native control can't do.
        AnalyticsRangeCalendar(
            selectedDate: activeEndpoint == .from ? $start : $end,
            rangeStart: start,
            rangeEnd: end,
            bounds: activeEndpoint == .from
                ? Date.distantPast...end
                : start...Date()
        )
        .padding(14)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(ForMe.stone200, lineWidth: 1)
        )
        .onChange(of: start) { _, _ in preset = matchingPreset() }
        .onChange(of: end) { _, _ in preset = matchingPreset() }
    }

    private var clearButton: some View {
        Button {
            withAnimation(.easeInOut(duration: 0.15)) {
                let r = AnalyticsViewModel.Preset.last1Year.range()
                start = r.start
                end = r.end
                preset = .last1Year
            }
        } label: {
            Text("Clear filters")
                .font(ForMe.font(.medium, size: 13))
                .foregroundColor(ForMe.stone600)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(ForMe.stone50)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(ForMe.stone200, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Helpers

    private var isValid: Bool { start <= end }

    private var dayCount: Int {
        let cal = Calendar.current
        let s = cal.startOfDay(for: start)
        let e = cal.startOfDay(for: end)
        let days = cal.dateComponents([.day], from: s, to: e).day ?? 0
        return max(days + 1, 1)
    }

    private var summaryLabel: String {
        if Calendar.current.isDate(start, inSameDayAs: end) {
            return formatFull(start)
        }
        return "\(formatFull(start)) – \(formatFull(end))"
    }

    private func formatFull(_ d: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "d MMM yyyy"
        return f.string(from: d)
    }

    private func matchingPreset() -> AnalyticsViewModel.Preset? {
        let cal = Calendar.current
        return AnalyticsViewModel.Preset.allCases.first { preset in
            let r = preset.range()
            return cal.isDate(r.start, inSameDayAs: start)
                && cal.isDate(r.end, inSameDayAs: end)
        }
    }
}

#Preview {
    AnalyticsDateRangePicker(
        initialStart: Date().addingTimeInterval(-86_400 * 30),
        initialEnd: Date(),
        initialPreset: .last30Days,
        onApply: { _, _ in },
        onCancel: {}
    )
}
