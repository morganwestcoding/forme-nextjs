import SwiftUI

struct ForMeCalendar: View {
    @Binding var selectedDate: Date
    @State private var displayedMonth: Date = Date()

    private let calendar = Calendar.current
    private let weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    private let today = Calendar.current.startOfDay(for: Date())

    private var monthTitle: String {
        let f = DateFormatter()
        f.dateFormat = "MMMM yyyy"
        return f.string(from: displayedMonth)
    }

    private var daysInMonth: [Date?] {
        let range = calendar.range(of: .day, in: .month, for: displayedMonth)!
        let firstDay = calendar.date(from: calendar.dateComponents([.year, .month], from: displayedMonth))!

        // Monday = 1 in ISO, Sunday = 7
        var weekday = calendar.component(.weekday, from: firstDay)
        // Convert to Monday-based (Mon=0, Tue=1, ..., Sun=6)
        weekday = (weekday + 5) % 7

        var days: [Date?] = Array(repeating: nil, count: weekday)
        for day in range {
            var components = calendar.dateComponents([.year, .month], from: displayedMonth)
            components.day = day
            days.append(calendar.date(from: components))
        }
        return days
    }

    var body: some View {
        VStack(spacing: 0) {
            // Month nav
            HStack {
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        displayedMonth = calendar.date(byAdding: .month, value: -1, to: displayedMonth) ?? displayedMonth
                    }
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(ForMe.stone300)
                        .frame(width: 36, height: 36)
                }

                Spacer()

                Text(monthTitle)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(ForMe.textPrimary)

                Spacer()

                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        displayedMonth = calendar.date(byAdding: .month, value: 1, to: displayedMonth) ?? displayedMonth
                    }
                } label: {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(ForMe.textPrimary)
                        .frame(width: 36, height: 36)
                }
            }
            .padding(.horizontal, ForMe.space3)
            .padding(.top, ForMe.space4)
            .padding(.bottom, ForMe.space3)

            // Weekday headers
            HStack(spacing: 0) {
                ForEach(weekdays, id: \.self) { day in
                    Text(day)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(ForMe.stone400)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.bottom, ForMe.space2)

            // Days grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 7), spacing: 6) {
                ForEach(Array(daysInMonth.enumerated()), id: \.offset) { _, date in
                    if let date = date {
                        let dayStart = calendar.startOfDay(for: date)
                        let isPast = dayStart < today
                        let isSelected = calendar.isDate(date, inSameDayAs: selectedDate)
                        let isToday = calendar.isDate(date, inSameDayAs: today)

                        Button {
                            if !isPast {
                                withAnimation(.easeInOut(duration: 0.15)) {
                                    selectedDate = date
                                }
                            }
                        } label: {
                            Text("\(calendar.component(.day, from: date))")
                                .font(.system(size: 15, weight: isSelected ? .bold : isToday ? .semibold : .regular))
                                .foregroundColor(
                                    isPast ? ForMe.stone300 :
                                    isSelected ? .white :
                                    ForMe.textPrimary
                                )
                                .frame(width: 40, height: 40)
                                .background(
                                    Group {
                                        if isSelected {
                                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                                .fill(ForMe.stone900)
                                        } else if isPast {
                                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                                .fill(ForMe.stone100)
                                        }
                                    }
                                )
                        }
                        .disabled(isPast)
                        .buttonStyle(.plain)
                    } else {
                        Color.clear.frame(width: 40, height: 40)
                    }
                }
            }
            .padding(.horizontal, ForMe.space2)

            // Footer
            Text("Past dates are disabled and cannot be selected")
                .font(.system(size: 12))
                .foregroundColor(ForMe.stone400)
                .padding(.top, ForMe.space4)
                .padding(.bottom, ForMe.space4)
        }
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }
}

#Preview {
    ForMeCalendar(selectedDate: .constant(Date()))
        .padding()
        .background(ForMe.background)
}
