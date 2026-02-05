"use client";

const todayEvents = [
  {
    id: 1,
    title: "Design Sync w/ Platform Team",
    time: "10:00 AM - 10:30 AM",
    type: "meeting",
    attendees: 4,
    platform: "Google Meet",
  },
  {
    id: 2,
    title: "1:1 with Jordan Lee",
    time: "2:00 PM - 2:30 PM",
    type: "meeting",
    attendees: 2,
    platform: "Zoom",
  },
  {
    id: 3,
    title: "Q4 Planning Review",
    time: "4:00 PM - 5:00 PM",
    type: "meeting",
    attendees: 8,
    platform: "Google Meet",
  },
];

const upcomingEvents = [
  {
    id: 4,
    title: "Team Weekly Standup",
    date: "Tomorrow",
    time: "9:00 AM",
  },
  {
    id: 5,
    title: "Product Demo",
    date: "Wed, Feb 5",
    time: "3:00 PM",
  },
  {
    id: 6,
    title: "Board Meeting",
    date: "Fri, Feb 7",
    time: "10:00 AM",
  },
];

export default function CalendarPage() {
  return (
    <>
      {/* Header Section */}
      <header className="border-b border-border-dark px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight">Calendar</h2>
          <span className="text-sm text-text-muted flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            February 4, 2026
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-border-dark rounded-lg text-text-muted hover:text-white transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              Today&apos;s Schedule
            </h3>
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-surface-dark rounded-xl border border-border-dark p-4 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-bold">{event.title}</h4>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                      MEETING
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mb-3">{event.time}</p>
                  <div className="flex items-center justify-between border-t border-border-dark pt-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-calendar text-sm">
                        videocam
                      </span>
                      <span className="text-xs text-text-muted">{event.platform}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-text-muted text-sm">
                        group
                      </span>
                      <span className="text-xs text-text-muted">{event.attendees}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              Upcoming
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-surface-dark rounded-xl border border-border-dark p-4 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold mb-1">{event.title}</h4>
                      <p className="text-xs text-text-muted">
                        {event.date} at {event.time}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-calendar text-xl">
                      calendar_month
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
