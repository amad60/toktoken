import { useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { Activity, Chore, AppData } from "@/types";
import {
  loadData, saveData, addChild, addActivity, updateActivity, deleteActivity,
  useToken, addChore, updateChore, deleteChore, completeChore, useEarnCredit,
} from "@/lib/storage";
import { startTimer, scheduleTimerNotification } from "@/lib/timerStorage";
import { ChildSelector } from "@/components/ChildSelector";
import { ActivityCard } from "@/components/ActivityCard";
import { ChoreCard } from "@/components/ChoreCard";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ActivityForm } from "@/components/ActivityForm";
import { ChoreForm } from "@/components/ChoreForm";
import { ActivityLogs } from "@/components/ActivityLogs";
import { ChoreLogs } from "@/components/ChoreLogs";
import { MathGate } from "@/components/MathGate";
import { InstallPrompt } from "@/components/InstallPrompt";
import { WeeklyReportModal } from "@/components/WeeklyReportModal";
import { Button } from "@/components/ui/button";
import { Plus, Star, BarChart3 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#93c5fd", "#86efac", "#fde68a", "#fca5a5", "#c4b5fd"],
  });
}

type TabMode = "spend" | "earn";

const Index = () => {
  const [data, setData] = useState<AppData>(loadData);
  const [tab, setTab] = useState<TabMode>("spend");

  const selectedChild = data.children.find((c) => c.id === data.selectedChildId);

  // Track app open once
  useEffect(() => {
    trackEvent("app_open", selectedChild?.name || "", "", { has_child: !!selectedChild });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hasChildren = data.children.length > 0;

  // onboarding
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardName, setOnboardName] = useState("");

  // confirm chore complete
  const [confirmChore, setConfirmChore] = useState<Chore | null>(null);
  // confirm earn credit use
  const [earnCreditActivity, setEarnCreditActivity] = useState<Activity | null>(null);
  // timer finished modal
  const [timerFinishedName, setTimerFinishedName] = useState<string | null>(null);

  // activity form
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // chore form
  const [choreFormOpen, setChoreFormOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  // math gate
  const [mathGateOpen, setMathGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // logs
  const [logsActivity, setLogsActivity] = useState<Activity | null>(null);
  const [logsChore, setLogsChore] = useState<Chore | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const update = useCallback((newData: AppData) => {
    setData(newData);
  }, []);

  const handleSelectChild = (id: string) => {
    const newData = { ...data, selectedChildId: id };
    saveData(newData);
    update(newData);
  };

  const handleAddChild = (name: string) => {
    update(addChild(data, name));
    trackEvent("child_created", name);
  };

  const handleOnboardAdd = () => {
    if (onboardName.trim()) {
      handleAddChild(onboardName.trim());
      setOnboardName("");
      setOnboardOpen(false);
    }
  };

  // Activity token usage (confirmation now handled inline in ActivityCard)
  const handleUseToken = (activity: Activity) => {
    if (!selectedChild) return;
    update(useToken(data, selectedChild.id, activity.id));
    fireConfetti();
    trackEvent("token_used", selectedChild.name, activity.name);
  };

  // Timer start: use token + start timer
  const handleStartTimer = (activity: Activity) => {
    if (!selectedChild || !activity.durationMinutes) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    update(useToken(data, selectedChild.id, activity.id));
    startTimer(activity.id, selectedChild.id, activity.durationMinutes);
    scheduleTimerNotification(activity.id, activity.name, activity.durationMinutes * 60 * 1000);
    trackEvent("token_used", selectedChild.name, activity.name);
  };

  // Timer finished - play beep via Web Audio API
  const handleTimerFinished = (activityName: string) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
    setTimerFinishedName(activityName);
  };

  // Earn credit usage
  const handleUseEarnCredit = (activity: Activity) => setEarnCreditActivity(activity);

  const handleConfirmEarnCredit = () => {
    if (!earnCreditActivity || !selectedChild) return;
    update(useEarnCredit(data, selectedChild.id, earnCreditActivity.id));
    setEarnCreditActivity(null);
    fireConfetti();
  };

  // Chore completion
  const handleCompleteChore = (chore: Chore) => setConfirmChore(chore);

  const handleConfirmChore = () => {
    if (!confirmChore || !selectedChild) return;
    const willComplete = confirmChore.progressCount + 1 >= confirmChore.totalCount;
    update(completeChore(data, selectedChild.id, confirmChore.id));
    setConfirmChore(null);
    if (willComplete) {
      fireConfetti();
      trackEvent("activity_completed", selectedChild.name, confirmChore.name);
    }
  };

  // Math gate
  const requireMath = (action: () => void) => {
    setPendingAction(() => action);
    setMathGateOpen(true);
  };

  const handleMathPass = () => {
    setMathGateOpen(false);
    pendingAction?.();
    setPendingAction(null);
  };

  // Activity CRUD
  const handleAddActivity = () => {
    requireMath(() => { setEditingActivity(null); setFormOpen(true); });
  };

  const handleEditActivity = (activity: Activity) => {
    requireMath(() => { setEditingActivity(activity); setFormOpen(true); });
  };

  const handleSaveActivity = (formData: { name: string; icon: string; periodType: "weekly" | "monthly"; totalQuota: number; durationMinutes?: number }) => {
    if (!selectedChild) return;
    if (editingActivity) {
      update(updateActivity(data, selectedChild.id, editingActivity.id, formData));
    } else {
      update(addActivity(data, selectedChild.id, formData));
      trackEvent("activity_created", selectedChild.name, formData.name);
    }
    setFormOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = () => {
    if (!selectedChild || !editingActivity) return;
    update(deleteActivity(data, selectedChild.id, editingActivity.id));
    setFormOpen(false);
    setEditingActivity(null);
  };

  // Chore CRUD
  const handleAddChore = () => {
    requireMath(() => { setEditingChore(null); setChoreFormOpen(true); });
  };

  const handleEditChore = (chore: Chore) => {
    requireMath(() => { setEditingChore(chore); setChoreFormOpen(true); });
  };

  const handleSaveChore = (formData: { name: string; icon: string; periodType: "weekly" | "monthly"; totalCount: number; rewardAmount: number }) => {
    if (!selectedChild) return;
    if (editingChore) {
      update(updateChore(data, selectedChild.id, editingChore.id, formData));
    } else {
      update(addChore(data, selectedChild.id, formData));
    }
    setChoreFormOpen(false);
    setEditingChore(null);
  };

  const handleDeleteChore = () => {
    if (!selectedChild || !editingChore) return;
    update(deleteChore(data, selectedChild.id, editingChore.id));
    setChoreFormOpen(false);
    setEditingChore(null);
  };

  // Onboarding empty state
  if (!hasChildren) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 max-w-xs text-center">
          <span className="text-7xl">🎟️</span>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Welcome to Toktok Token
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Create your first child to start learning to choose.
          </p>
          <Button
            onClick={() => setOnboardOpen(true)}
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 font-bold h-12 text-base btn-press mt-2"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Child
          </Button>
        </div>

        <Dialog open={onboardOpen} onOpenChange={setOnboardOpen}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Child</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Child's name"
              value={onboardName}
              onChange={(e) => setOnboardName(e.target.value)}
              className="rounded-xl bg-muted text-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleOnboardAdd()}
              autoFocus
            />
            <Button onClick={handleOnboardAdd} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 btn-press">
              Add
            </Button>
          </DialogContent>
        </Dialog>
        <InstallPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Sticky header — compact */}
      <header
        className="sticky top-0 z-10 border-b border-border px-4 py-3 bg-background/95 backdrop-blur-sm shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.3)] transition-shadow"
        style={{ background: "linear-gradient(135deg, hsl(210 70% 95% / 0.95), hsl(150 50% 95% / 0.95))" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🎟️</span>
          <h1 className="font-extrabold text-xl text-foreground tracking-tight">
            Toktok Token
          </h1>
          {selectedChild && selectedChild.earnCredits > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 bg-accent/20 text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3" /> {selectedChild.earnCredits}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ChildSelector
              children={data.children}
              selectedId={data.selectedChildId}
              onSelect={handleSelectChild}
              onAddChild={handleAddChild}
            />
          </div>
          <button
            onClick={() => {
              setReportOpen(true);
              if (selectedChild) {
                const report = getWeeklyReport(selectedChild);
                trackEvent("report_view", selectedChild.name, "weekly_report", {
                  tokens_earned: report.tokensEarned,
                  chores_completed: report.choresCompleted,
                  rewards_used: report.rewardsUsed,
                  active_days: report.activeDays,
                });
              }
            }}
            aria-label="Weekly report"
            title="Weekly report"
            className="h-12 w-12 rounded-xl bg-primary/10 text-foreground/70 hover:bg-primary/20 shrink-0 btn-press flex items-center justify-center transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        </div>

        {/* Spend / Earn toggle */}
        {selectedChild && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setTab("spend")}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all btn-press ${
                tab === "spend"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Spend
            </button>
            <button
              onClick={() => setTab("earn")}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all btn-press ${
                tab === "earn"
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              ⭐ Earn
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 pt-4">
        {tab === "spend" && selectedChild && (
          <div className="grid grid-cols-2 gap-3 auto-rows-fr">
            {selectedChild.activities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                earnCredits={selectedChild.earnCredits}
                onUseToken={() => handleUseToken(act)}
                onStartTimer={() => handleStartTimer(act)}
                onUseEarnCredit={() => handleUseEarnCredit(act)}
                onViewHistory={() => setLogsActivity(act)}
                onEdit={() => handleEditActivity(act)}
                onTimerFinished={() => handleTimerFinished(act.name)}
              />
            ))}
            {/* Add Activity card */}
            <button
              onClick={handleAddActivity}
              className="bg-card rounded-2xl p-4 shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.3)] border border-dashed border-border flex flex-col items-center justify-center gap-2 min-h-0 btn-press hover:bg-muted/50 transition-colors"
            >
              <Plus className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-bold text-muted-foreground">Add Activity</span>
            </button>
          </div>
        )}

        {tab === "earn" && selectedChild && (
          <>
            <div className="text-center mb-4 bg-accent/10 rounded-2xl p-3">
              <p className="text-sm text-muted-foreground font-semibold">Earn Credits</p>
              <p className="text-3xl font-extrabold text-accent-foreground">
                <Star className="inline h-6 w-6 text-accent mr-1" />
                {selectedChild.earnCredits}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 auto-rows-fr">
              {selectedChild.chores.map((chore) => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  onComplete={() => handleCompleteChore(chore)}
                  onViewHistory={() => setLogsChore(chore)}
                  onEdit={() => handleEditChore(chore)}
                />
              ))}
              {/* Add Chore card */}
              <button
                onClick={handleAddChore}
                className="bg-card rounded-2xl p-4 shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.3)] border border-dashed border-border flex flex-col items-center justify-center gap-2 min-h-0 btn-press hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-bold text-muted-foreground">Add Chore</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modals */}

      <ConfirmModal
        open={!!confirmChore}
        activityName={confirmChore?.name ?? ""}
        title="Complete Chore?"
        confirmText="Complete"
        message={`Mark "${confirmChore?.name}" as completed?`}
        onConfirm={handleConfirmChore}
        onCancel={() => setConfirmChore(null)}
      />

      <ConfirmModal
        open={!!earnCreditActivity}
        activityName={earnCreditActivity?.name ?? ""}
        title="Use Earn Credit?"
        confirmText="Use Credit"
        message="Use 1 Earn Credit to unlock 1 extra token?"
        onConfirm={handleConfirmEarnCredit}
        onCancel={() => setEarnCreditActivity(null)}
      />

      <MathGate
        open={mathGateOpen}
        onPass={handleMathPass}
        onCancel={() => { setMathGateOpen(false); setPendingAction(null); }}
      />

      <ActivityForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingActivity(null); }}
        onSave={handleSaveActivity}
        onDelete={editingActivity ? handleDeleteActivity : undefined}
        initial={editingActivity ?? undefined}
      />

      <ChoreForm
        open={choreFormOpen}
        onClose={() => { setChoreFormOpen(false); setEditingChore(null); }}
        onSave={handleSaveChore}
        onDelete={editingChore ? handleDeleteChore : undefined}
        initial={editingChore ?? undefined}
      />

      <ActivityLogs
        open={!!logsActivity}
        onClose={() => setLogsActivity(null)}
        activity={logsActivity}
      />

      <ChoreLogs
        open={!!logsChore}
        onClose={() => setLogsChore(null)}
        chore={logsChore}
      />

      {/* Timer finished modal */}
      <ConfirmModal
        open={!!timerFinishedName}
        activityName={timerFinishedName ?? ""}
        title="⏰ Time is up!"
        confirmText="OK"
        message="This activity has finished."
        onConfirm={() => setTimerFinishedName(null)}
        onCancel={() => setTimerFinishedName(null)}
      />

      <InstallPrompt />

      <WeeklyReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        child={selectedChild ?? null}
      />
    </div>
  );
};

export default Index;
