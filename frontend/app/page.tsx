import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Mail, MessageSquare, Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6 hidden md:block">
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">P</div>
          Productivity OS
        </div>
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 bg-gray-100">
            <Mail className="w-4 h-4" /> Inbox
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Calendar className="w-4 h-4" /> Calendar
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <MessageSquare className="w-4 h-4" /> Chat Assistant
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Good Morning, User</h1>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </Button>
        </header>

        <section className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">☀️ Daily Briefing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed">
                You have <strong>3 urgent emails</strong> from the "Q1 Project" thread and a scheduling conflict at <strong>2:00 PM</strong>.
                Slack is relatively quiet. Recommended focus: <em>Review the Q1 Proposal</em> before your 4 PM meeting.
              </p>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Unified Inbox</h2>
            {/* Mock Items */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">Project Update Needed</h3>
                      <span className="text-xs text-gray-500">10m ago</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      Hi team, we need to finalize the slides for tomorrow's presentation...
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Urgent</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Work</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-center w-10">
                    <div className="text-xs font-bold text-red-500">FEB</div>
                    <div className="text-lg font-bold">02</div>
                  </div>
                  <div>
                    <p className="font-medium">Team Sync</p>
                    <p className="text-xs text-gray-500">10:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center w-10">
                    <div className="text-xs font-bold text-red-500">FEB</div>
                    <div className="text-lg font-bold">02</div>
                  </div>
                  <div>
                    <p className="font-medium">Client Review</p>
                    <p className="text-xs text-gray-500">2:00 PM - 3:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
