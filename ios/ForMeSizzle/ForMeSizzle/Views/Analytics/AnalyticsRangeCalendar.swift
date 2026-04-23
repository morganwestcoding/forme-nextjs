import SwiftUI

// Custom calendar styled to match the rest of the app — stone palette,
// semibold month nav, rounded day cells, range-aware highlighting. Built
// as a single-date selector that renders the *other* endpoint of the
// current range as context (so users see both the start and end they've
// picked even while only one is being edited).
//
// Named `AnalyticsRangeCalendar` rather than `ForMeCalendar` because an
// existing plain single-date `ForMeCalendar` already lives in
// Views/Components/ — Xcode's file-system-synchronized groups would fail
// the build with "multiple commands produce" on a name collision.
struct AnalyticsRangeCalendar: View {
    // The date the user is actively editing.
    @Binding var selectedDate: Date
    // Full selected range, used purely for highlighting. The endpoint
    // being edited is whichever of these matches `selectedDate`.
    let rangeStart: Date
    let rangeEnd: Date
    // Bounds for tap validity — taps outside the bounds are no-ops.
    let bounds: ClosedRange<Date>

    @State private var displayedMonth: Date

    private let calendar = Calendar.current
    private let weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"]

    init(
        selectedDate: Binding<Date>,
        rangeStart: Date,
        rangeEnd: Date,
        bounds: ClosedRange<Date>
    ) {
        self._selectedDate = selectedDate
        self.rangeStart = rangeStart
        self.rangeEnd = rangeEnd
        self.bounds = bounds
        self._displayedMonth = State(initialValue: selectedDate.wrappedValue)
    }

    var body: some View {
        VStack(spacing: 14) {
            monthHeader
            weekdayHeader
            dayGrid
        }
        .onChange(of: selectedDate) { _, newValue in
            // When the user picks a date or switches endpoints, snap the
            // visible month to match so they never lose their place.
            if !calendar.isDate(newValue, equalTo: displayedMonth, toGranularity: .month) {
                displayedMonth = newValue
            }
        }
    }

    // MARK: - Sections

    private var monthHeader: some View {
        HStack {
            Button {
                shiftMonth(-1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(ForMe.stone600)
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(ForMe.stone50))
                    .overlay(Circle().stroke(ForMe.stone200, lineWidth: 1))
            }
            .buttonStyle(.plain)

            Spacer()

            Text(monthYearLabel)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(ForMe.textPrimary)

            Spacer()

            Button {
                shiftMonth(1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(ForMe.stone600)
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(ForMe.stone50))
                    .overlay(Circle().stroke(ForMe.stone200, lineWidth: 1))
            }
            .buttonStyle(.plain)
        }
    }

    private var weekdayHeader: some View {
        HStack(spacing: 0) {
            ForEach(Array(weekdayLabels.enumerated()), id: \.offset) { _, label in
                Text(label)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(ForMe.stone400)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private var dayGrid: some View {
        let days = daysForDisplay()
        return LazyVGrid(
            columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 7),
            spacing: 4
        ) {
            ForEach(Array(days.enumerated()), id: \.offset) { _, day in
                dayCell(day)
            }
        }
    }

    // MARK: - Day cell

    @ViewBuilder
    private func dayCell(_ day: DayCell) -> some View {
        switch day {
        case .empty:
            Color.clear
                .frame(height: 40)

        case .date(let date):
            let style = cellStyle(for: date)
            Button {
                guard style.isSelectable else { return }
                selectedDate = date
            } label: {
                ZStack {
                    // Range fill (rectangular, tiles seamlessly between
                    // endpoints — no gap at week wraps).
                    if style.isInRange && !style.isEndpoint {
                        Rectangle()
                            .fill(ForMe.stone100)
                    }
                    // Leading half of the range for the start endpoint,
                    // trailing half for the end endpoint — makes the
                    // highlight look like a continuous pill instead of a
                    // disc with gaps on either side.
                    if style.isStartEndpoint && !isSameDay(rangeStart, rangeEnd) {
                        HStack(spacing: 0) {
                            Color.clear
                            Rectangle().fill(ForMe.stone100)
                        }
                    }
                    if style.isEndEndpoint && !isSameDay(rangeStart, rangeEnd) {
                        HStack(spacing: 0) {
                            Rectangle().fill(ForMe.stone100)
                            Color.clear
                        }
                    }

                    // Endpoint disc.
                    if style.isEndpoint {
                        Circle()
                            .fill(ForMe.stone900)
                            .frame(width: 36, height: 36)
                    }

                    // Today outline when not already an endpoint.
                    if style.isToday && !style.isEndpoint {
                        Circle()
                            .stroke(ForMe.stone900.opacity(0.5), lineWidth: 1)
                            .frame(width: 36, height: 36)
                    }

                    Text("\(calendar.component(.day, from: date))")
                        .font(.system(size: 14, weight: style.isEndpoint ? .semibold : .regular))
                        .foregroundColor(textColor(for: style))
                }
                .frame(height: 40)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .disabled(!style.isSelectable)
        }
    }

    // MARK: - Styling

    private struct CellStyle {
        let isInRange: Bool
        let isStartEndpoint: Bool
        let isEndEndpoint: Bool
        let isToday: Bool
        let isSelectable: Bool
        let isInDisplayedMonth: Bool

        var isEndpoint: Bool { isStartEndpoint || isEndEndpoint }
    }

    private func cellStyle(for date: Date) -> CellStyle {
        let inMonth = calendar.isDate(date, equalTo: displayedMonth, toGranularity: .month)
        let startDay = calendar.startOfDay(for: date)
        let rStart = calendar.startOfDay(for: rangeStart)
        let rEnd = calendar.startOfDay(for: rangeEnd)

        let isStart = calendar.isDate(startDay, inSameDayAs: rStart)
        let isEnd = calendar.isDate(startDay, inSameDayAs: rEnd)
        let isInRange = startDay >= rStart && startDay <= rEnd

        return CellStyle(
            isInRange: isInRange,
            isStartEndpoint: isStart,
            isEndEndpoint: isEnd,
            isToday: calendar.isDateInToday(date),
            isSelectable: inMonth && bounds.contains(startDay),
            isInDisplayedMonth: inMonth
        )
    }

    private func textColor(for style: CellStyle) -> Color {
        if style.isEndpoint { return .white }
        if !style.isInDisplayedMonth { return ForMe.stone300 }
        if !style.isSelectable { return ForMe.stone300 }
        if style.isInRange { return ForMe.textPrimary }
        return ForMe.textPrimary
    }

    // MARK: - Helpers

    private var monthYearLabel: String {
        let f = DateFormatter()
        f.dateFormat = "MMMM yyyy"
        return f.string(from: displayedMonth)
    }

    private func shiftMonth(_ delta: Int) {
        if let new = calendar.date(byAdding: .month, value: delta, to: displayedMonth) {
            withAnimation(.easeInOut(duration: 0.15)) {
                displayedMonth = new
            }
        }
    }

    private func isSameDay(_ a: Date, _ b: Date) -> Bool {
        calendar.isDate(a, inSameDayAs: b)
    }

    private enum DayCell {
        case empty
        case date(Date)
    }

    // 42 cells (6 weeks × 7 columns). Leading cells before the 1st of the
    // month come back as `.empty` so the grid height stays constant across
    // months (shorter February doesn't make the sheet jump around).
    private func daysForDisplay() -> [DayCell] {
        guard let monthInterval = calendar.dateInterval(of: .month, for: displayedMonth)
        else { return [] }

        let firstOfMonth = monthInterval.start
        let monthEnd = monthInterval.end
        let firstWeekday = calendar.component(.weekday, from: firstOfMonth) // 1 = Sunday
        let leadingEmpty = firstWeekday - 1

        var cells: [DayCell] = Array(repeating: .empty, count: leadingEmpty)
        var cursor = firstOfMonth
        while cursor < monthEnd {
            cells.append(.date(cursor))
            cursor = calendar.date(byAdding: .day, value: 1, to: cursor)
                ?? cursor.addingTimeInterval(86_400)
        }
        while cells.count < 42 {
            cells.append(.empty)
        }
        return cells
    }
}
