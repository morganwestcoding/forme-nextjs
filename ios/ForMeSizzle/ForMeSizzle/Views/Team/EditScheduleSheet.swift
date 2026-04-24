import SwiftUI

/// Weekly schedule editor for a single team member.
/// Mirrors the web Team page's schedule editor: per-day start/end or "Off".
struct EditScheduleSheet: View {
    let member: TeamMember
    let onSave: ([TeamAvailability]) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var entries: [String: Entry] = [:]
    @State private var saving = false

    private let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    private struct Entry {
        var isOff: Bool
        var start: Date
        var end: Date
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(days, id: \.self) { day in
                        dayRow(day: day)
                    }
                }
                .padding()
            }
            .background(ForMe.background)
            .navigationTitle("\(member.fullName.split(separator: " ").first.map(String.init) ?? member.fullName)'s Schedule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(saving ? "Saving…" : "Save") {
                        saving = true
                        onSave(buildSchedule())
                    }
                    .disabled(saving)
                }
            }
            .onAppear { seed() }
        }
    }

    @ViewBuilder
    private func dayRow(day: String) -> some View {
        let binding = Binding<Entry>(
            get: { entries[day] ?? defaultEntry() },
            set: { entries[day] = $0 }
        )

        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(day)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(ForMe.textPrimary)
                Spacer()
                Toggle("", isOn: Binding(
                    get: { !binding.wrappedValue.isOff },
                    set: { binding.wrappedValue.isOff = !$0 }
                ))
                .labelsHidden()
            }

            if !binding.wrappedValue.isOff {
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Start").font(.system(size: 11)).foregroundColor(ForMe.stone400)
                        DatePicker("", selection: binding.start, displayedComponents: .hourAndMinute)
                            .labelsHidden()
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        Text("End").font(.system(size: 11)).foregroundColor(ForMe.stone400)
                        DatePicker("", selection: binding.end, displayedComponents: .hourAndMinute)
                            .labelsHidden()
                    }
                    Spacer()
                }
            } else {
                Text("Off")
                    .font(.system(size: 12))
                    .foregroundColor(ForMe.stone400)
            }
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }

    private func seed() {
        guard entries.isEmpty else { return }
        for day in days {
            if let a = member.availability.first(where: { $0.dayOfWeek == day }) {
                entries[day] = Entry(
                    isOff: a.isOff,
                    start: parseTime(a.startTime) ?? defaultStart(),
                    end: parseTime(a.endTime) ?? defaultEnd()
                )
            } else {
                entries[day] = defaultEntry()
            }
        }
    }

    private func buildSchedule() -> [TeamAvailability] {
        days.map { day in
            let e = entries[day] ?? defaultEntry()
            return TeamAvailability(
                dayOfWeek: day,
                startTime: formatTime(e.start),
                endTime: formatTime(e.end),
                isOff: e.isOff
            )
        }
    }

    // MARK: - Helpers

    private func defaultEntry() -> Entry {
        Entry(isOff: false, start: defaultStart(), end: defaultEnd())
    }

    private func defaultStart() -> Date {
        Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: Date()) ?? Date()
    }

    private func defaultEnd() -> Date {
        Calendar.current.date(bySettingHour: 17, minute: 0, second: 0, of: Date()) ?? Date()
    }

    private func parseTime(_ s: String) -> Date? {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        f.timeZone = TimeZone(identifier: "UTC")
        guard let parsed = f.date(from: s) else { return nil }
        let comps = Calendar.current.dateComponents([.hour, .minute], from: parsed)
        return Calendar.current.date(bySettingHour: comps.hour ?? 9, minute: comps.minute ?? 0, second: 0, of: Date())
    }

    private func formatTime(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: date)
    }
}
