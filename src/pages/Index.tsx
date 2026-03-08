import { useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { Activity, Chore, AppData } from "@/types";
import {
  loadData, saveData, addChild, addActivity, updateActivity, deleteActivity,
  useToken, addChore, updateChore, deleteChore, completeChore, useEarnCredit,
} from "@/lib/storage";
import { getWeeklyReport } from "@/lib/weeklyReport";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Star, BarChart3, Menu, MessageSquare, Info } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

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
  const [presetInitial, setPresetInitial] = useState<{ name: string; icon: string; periodType: "weekly" | "monthly"; totalQuota: number; durationMinutes?: number } | null>(null);

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

  // burger menu
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleFeedbackSubmit = () => {
    const trimmed = feedbackText.trim();
    if (trimmed.length < 5) return;

    // Rate limit: 3 per day
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("feedback_last_date") || "";
    let count = parseInt(localStorage.getItem("feedback_count_today") || "0", 10);
    if (lastDate !== today) { count = 0; }
    if (count >= 3) {
      toast({ title: "Thanks! You've sent enough feedback for today." });
      setFeedbackOpen(false);
      setFeedbackText("");
      return;
    }

    trackEvent("feedback_submitted", selectedChild?.name || "", "feedback", { message: trimmed });
    localStorage.setItem("feedback_last_date", today);
    localStorage.setItem("feedback_count_today", String(count + 1));
    setFeedbackText("");
    setFeedbackOpen(false);
    toast({ title: "Thanks for the feedback!" });
  };

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

  // Check if this is the very first token used across all activities
  const isFirstTokenEver = (child: typeof selectedChild) => {
    if (!child) return false;
    const totalUsed = child.activities.reduce((sum, a) => sum + (a.logs?.length ?? 0), 0);
    return totalUsed === 0;
  };

  // Activity token usage (confirmation now handled inline in ActivityCard)
  const handleUseToken = (activity: Activity) => {
    if (!selectedChild) return;
    const wasFirst = isFirstTokenEver(selectedChild);
    update(useToken(data, selectedChild.id, activity.id));
    fireConfetti();
    trackEvent("token_used", selectedChild.name, activity.name);
    if (wasFirst && !localStorage.getItem("toktok-first-token-shown")) {
      localStorage.setItem("toktok-first-token-shown", "1");
      setTimeout(() => toast({ title: `First token used! ⭐ Great choice ${selectedChild.name}.` }), 300);
    }
  };

  // Timer start: use token + start timer
  const handleStartTimer = (activity: Activity) => {
    if (!selectedChild || !activity.durationMinutes) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const wasFirst = isFirstTokenEver(selectedChild);
    update(useToken(data, selectedChild.id, activity.id));
    startTimer(activity.id, selectedChild.id, activity.durationMinutes);
    scheduleTimerNotification(activity.id, activity.name, activity.durationMinutes * 60 * 1000);
    trackEvent("token_used", selectedChild.name, activity.name);
    if (wasFirst && !localStorage.getItem("toktok-first-token-shown")) {
      localStorage.setItem("toktok-first-token-shown", "1");
      setTimeout(() => toast({ title: `First token used! ⭐ Great choice ${selectedChild.name}.` }), 300);
    }
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
      const isFirst = selectedChild.activities.length === 0;
      update(addActivity(data, selectedChild.id, formData));
      trackEvent("activity_created", selectedChild.name, formData.name);
      if (isFirst && !localStorage.getItem("toktok-first-activity-shown")) {
        localStorage.setItem("toktok-first-activity-shown", "1");
        setTimeout(() => toast({ title: "Nice start! Your first activity is ready." }), 300);
      }
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
          <div className="animate-[ticketPop_400ms_ease-out]">
            <div className="animate-[ticketFloat_4s_ease-in-out_600ms_infinite]">
              <span className="text-7xl">🎟️</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Toktok Token
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Help your child learn that good things are worth waiting for.
          </p>
          <Button
            onClick={() => setOnboardOpen(true)}
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 font-bold h-12 text-base btn-press mt-2 transition-all duration-150 active:scale-[0.98]"
          >
            Get Started
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
        className="sticky top-0 z-10 border-b border-border py-3 bg-background/95 backdrop-blur-sm shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.3)] transition-shadow"
        style={{ background: "linear-gradient(135deg, hsl(210 70% 95% / 0.95), hsl(150 50% 95% / 0.95))" }}
      >
        <div className="container max-w-lg mx-auto px-4">
        <div className="flex items-center gap-2 mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl shadow-lg">
              <DropdownMenuItem onClick={() => setFeedbackOpen(true)} className="gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4" /> Send feedback
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAboutOpen(true)} className="gap-2 cursor-pointer">
                <Info className="h-4 w-4" /> About
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 pt-4">
        {tab === "spend" && selectedChild && (
          <>
            {selectedChild.activities.length === 0 && (
              <>
              <div className="text-center mb-4 bg-muted/30 rounded-2xl p-5">
                <p className="text-base font-bold text-foreground">Start your first token moment</p>
                <p className="text-sm text-muted-foreground mt-1">Each activity has a limited number of tokens before it resets.</p>
                <p className="text-sm text-muted-foreground mt-2">Add an activity your child can enjoy.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  { icon: "🎮", name: "Gaming", totalQuota: 3, periodType: "weekly" as const, durationMinutes: 60 },
                  { icon: "📺", name: "Screen time", totalQuota: 5, periodType: "weekly" as const, durationMinutes: 30 },
                  { icon: "🍦", name: "Ice cream", totalQuota: 1, periodType: "weekly" as const },
                  { icon: "📱", name: "YouTube", totalQuota: 4, periodType: "weekly" as const, durationMinutes: 30 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      requireMath(() => {
                        setEditingActivity(null);
                        setPresetInitial(preset);
                        setFormOpen(true);
                      });
                    }}
                    className="bg-card rounded-2xl p-4 shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.3)] border border-border flex flex-col items-center gap-1.5 btn-press hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-4xl leading-none">{preset.icon}</span>
                    <span className="text-sm font-bold text-foreground">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {preset.totalQuota}x/week{preset.durationMinutes ? ` · ${preset.durationMinutes}m` : ""}
                    </span>
                  </button>
                ))}
              </div>
              </>
            )}
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
          </>
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

            {selectedChild.chores.length === 0 && (
              <div className="text-center mb-4 bg-muted/30 rounded-2xl p-5">
                <p className="text-base font-bold text-foreground">Ready to earn?</p>
                <p className="text-sm text-muted-foreground mt-1">Kids complete chores to earn credits for extra tokens.</p>
                <p className="text-sm text-muted-foreground mt-2">Add a chore to start earning tokens.</p>
              </div>
            )}
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
        onClose={() => { setFormOpen(false); setEditingActivity(null); setPresetInitial(null); }}
        onSave={handleSaveActivity}
        onDelete={editingActivity ? handleDeleteActivity : undefined}
        initial={editingActivity ?? presetInitial ?? undefined}
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
      {/* Feedback modal */}
      <Dialog open={feedbackOpen} onOpenChange={(open) => { setFeedbackOpen(open); if (!open) setFeedbackText(""); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Send feedback</DialogTitle>
            <DialogDescription className="sr-only">Share your thoughts or ideas</DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              placeholder="Share your thoughts or ideas..."
              value={feedbackText}
              onChange={(e) => { if (e.target.value.length <= 300) setFeedbackText(e.target.value); }}
              className="rounded-xl bg-muted text-foreground min-h-[100px]"
              autoFocus
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{feedbackText.length} / 300</p>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => { setFeedbackOpen(false); setFeedbackText(""); }} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={handleFeedbackSubmit} disabled={feedbackText.trim().length < 5} className="flex-1 rounded-xl bg-primary text-primary-foreground">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About modal */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="sr-only">About TokToken</DialogTitle>
            <DialogDescription className="sr-only">About this app</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <span className="text-5xl">🎟️</span>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">TokToken</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A small tool to help kids learn<br />effort and rewards.
            </p>
            <p className="text-muted-foreground text-xs italic">Built by a dad.</p>
            <p className="text-primary text-xs font-medium mt-2">toktoken.lovable.app</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
