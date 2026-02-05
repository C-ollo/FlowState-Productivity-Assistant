"use client";

export function AISidebar() {
  return (
    <aside className="w-80 border-l border-border-dark bg-background-dark p-6 hidden xl:flex flex-col gap-6">
      {/* AI Insights */}
      <div>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">psychology</span>
          AI Insights
        </h3>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <p className="text-xs text-white leading-relaxed">
            Based on your Slack activity, you have{" "}
            <span className="text-primary font-bold">3 follow-ups</span> pending
            for #project-alpha. Would you like to batch create these tasks?
          </p>
          <button className="mt-3 w-full border border-primary text-primary text-[11px] font-bold py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
            View Follow-ups
          </button>
        </div>
      </div>

      {/* Source Platform Activity */}
      <div>
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
          Source Platform Activity
        </h3>
        <div className="space-y-4">
          {/* Slack */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-border-dark rounded-lg">
              <span className="material-symbols-outlined text-slack text-xl">
                alternate_email
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold">Slack</p>
                <p className="text-[10px] text-text-muted">82% Scanned</p>
              </div>
              <div className="w-full bg-border-dark h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "82%" }}></div>
              </div>
            </div>
          </div>

          {/* Gmail */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-border-dark rounded-lg">
              <span className="material-symbols-outlined text-gmail text-xl">
                mail
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold">Gmail</p>
                <p className="text-[10px] text-text-muted">100% Scanned</p>
              </div>
              <div className="w-full bg-border-dark h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-auto">
        <div className="bg-surface-dark border border-border-dark rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-text-muted">info</span>
          <p className="text-[11px] text-text-muted leading-normal">
            AI extraction is local-first. No sensitive message data leaves this
            device.
          </p>
        </div>
      </div>
    </aside>
  );
}
