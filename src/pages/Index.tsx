import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { Activity, AppData } from "@/types";
import { loadData, saveData, addChild, addActivity, updateActivity, deleteActivity, useToken } from "@/lib/storage";
import { ChildSelector } from "@/components/ChildSelector";
import { ActivityCard } from "@/components/ActivityCard";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ActivityForm } from "@/components/ActivityForm";
import { ActivityLogs } from "@/components/ActivityLogs";
import { MathGate } from "@/components/MathGate";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const Index = () => {
  const [data, setData] = useState<AppData>(loadData);

  const selectedChild = data.children.find((c) => c.id === data.selectedChildId);
  const hasChildren = data.children.length > 0;

  // onboarding add child dialog
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardName, setOnboardName] = useState("");

  // confirm use token
  const [confirmActivity, setConfirmActivity] = useState<Activity | null>(null);

  // activity form
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // math gate
  const [mathGateOpen, setMathGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // logs
  const [logsActivity, setLogsActivity] = useState<Activity | null>(null);

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
  };

  const handleOnboardAdd = () => {
    if (onboardName.trim()) {
      handleAddChild(onboardName.trim());
      setOnboardName("");
      setOnboardOpen(false);
    }
  };

  const handleUseToken = (activity: Activity) => {
    setConfirmActivity(activity);
  };

  const handleConfirmUse = () => {
    if (!confirmActivity || !selectedChild) return;
    const newData = useToken(data, selectedChild.id, confirmActivity.id);
    update(newData);
    setConfirmActivity(null);
    fireConfetti();
  };

  const requireMath = (action: () => void) => {
    setPendingAction(() => action);
    setMathGateOpen(true);
  };

  const handleMathPass = () => {
    setMathGateOpen(false);
    pendingAction?.();
    setPendingAction(null);
  };

  const handleAddActivity = () => {
    requireMath(() => {
      setEditingActivity(null);
      setFormOpen(true);
    });
  };

  const handleEditActivity = (activity: Activity) => {
    requireMath(() => {
      setEditingActivity(activity);
      setFormOpen(true);
    });
  };

  const handleSaveActivity = (formData: { name: string; icon: string; periodType: "weekly" | "monthly"; totalQuota: number; durationText?: string }) => {
    if (!selectedChild) return;
    if (editingActivity) {
      update(updateActivity(data, selectedChild.id, editingActivity.id, formData));
    } else {
      update(addActivity(data, selectedChild.id, formData));
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
          <DialogContent className="rounded-2xl bg-card mx-4 w-[90vw] max-w-[480px]">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Hero header with subtle gradient */}
      <header className="sticky top-0 z-10 border-b border-border px-4 py-4"
        style={{ background: "linear-gradient(135deg, hsl(210 70% 95%), hsl(150 50% 95%))" }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🎟️</span>
          <h1 className="font-extrabold text-xl text-foreground tracking-tight">
            Toktok Token
          </h1>
        </div>
        <ChildSelector
          children={data.children}
          selectedId={data.selectedChildId}
          onSelect={handleSelectChild}
          onAddChild={handleAddChild}
        />
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 pt-5">
        {selectedChild && selectedChild.activities.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {selectedChild.activities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                onUseToken={() => handleUseToken(act)}
                onViewHistory={() => setLogsActivity(act)}
                onEdit={() => handleEditActivity(act)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🎯</p>
            <p className="text-muted-foreground font-semibold">No activities yet.</p>
            <p className="text-muted-foreground text-sm">Add one to get started!</p>
          </div>
        )}

        <Button
          onClick={handleAddActivity}
          className="w-full mt-6 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold h-12 text-base btn-press"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Activity
        </Button>
      </main>

      {/* Modals */}
      <ConfirmModal
        open={!!confirmActivity}
        activityName={confirmActivity?.name ?? ""}
        onConfirm={handleConfirmUse}
        onCancel={() => setConfirmActivity(null)}
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

      <ActivityLogs
        open={!!logsActivity}
        onClose={() => setLogsActivity(null)}
        activity={logsActivity}
      />
    </div>
  );
};

export default Index;
