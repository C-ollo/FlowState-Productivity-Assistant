"use client";

import { Calendar as CalendarIcon, Video, Users } from "lucide-react";

const todayEvents = [
  {
    id: 1,
    title: "Design Sync w/ Platform Team",
    time: "10:00 AM - 10:30 AM",
    type: "meeting",
    attendees: 4,
  },
  {
    id: 2,
    title: "1:1 with Jordan Lee",
    time: "2:00 PM - 2:30 PM",
    type: "meeting",
    attendees: 2,
  },
  {
    id: 3,
    title: "Q4 Planning Review",
    time: "4:00 PM - 5:00 PM",
    type: "meeting",
    attendees: 8,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Calendar</h1>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <CalendarIcon className="h-4 w-4" />
          <span>February 4, 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <section>
          <h2 className="text-lg font-semibold text-text mb-4">Today</h2>
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-border bg-surface p-4 hover:border-border-light transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-text">{event.title}</h3>
                    <p className="text-sm text-text-muted mt-1">{event.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-calendar" />
                    <div className="flex items-center gap-1 text-sm text-text-muted">
                      <Users className="h-4 w-4" />
                      {event.attendees}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="text-lg font-semibold text-text mb-4">Upcoming</h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-border-light transition-colors"
              >
                <div>
                  <h3 className="font-medium text-text">{event.title}</h3>
                  <p className="text-sm text-text-muted mt-1">
                    {event.date} at {event.time}
                  </p>
                </div>
                <CalendarIcon className="h-5 w-5 text-calendar" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
