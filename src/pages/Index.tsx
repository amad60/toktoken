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

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="text-center font-extrabold text-xl text-foreground tracking-tight mb-3">
          🪙 Toktok Token
        </h1>
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
          <div className="grid gap-4">
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
          className="w-full mt-6 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold h-12 text-base"
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
