import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import {
  getMilestoneSet, getCaption, calculateAgeMonths,
  AVATARS, autoAvatar, type MilestoneSet, type MilestoneItem,
} from "@/data/milestones";

type Screen = "landing" | "input" | "checklist" | "preview" | "share";

const CHILD_NAME_KEY = "childName";

// Checked state: key = "domain-itemIdx"
type CheckedMap = Record<string, boolean>;

function initCheckedMap(ms: MilestoneSet): CheckedMap {
  const map: CheckedMap = {};
  ms.domains.forEach((d, di) => {
    d.items.forEach((_, ii) => {
      map[`${di}-${ii}`] = true;
    });
  });
  return map;
}

function countChecked(map: CheckedMap): { checked: number; total: number } {
  const vals = Object.values(map);
  return { checked: vals.filter(Boolean).length, total: vals.length };
}

function getHighlightItems(
  ms: MilestoneSet,
  checked: CheckedMap
): { icon: string; text: string }[] {
  const results: { icon: string; text: string }[] = [];
  ms.domains.forEach((d, di) => {
    // First pick checked star items
    const starItems = d.items
      .map((item, ii) => ({ item, ii }))
      .filter(({ item, ii }) => item.star && checked[`${di}-${ii}`]);
    if (starItems.length > 0) {
      results.push({ icon: d.icon, text: starItems[0].item.text });
    } else {
      // fallback: first checked non-star
      const fallback = d.items
        .map((item, ii) => ({ item, ii }))
        .filter(({ item, ii }) => !item.star && checked[`${di}-${ii}`]);
      if (fallback.length > 0) {
        results.push({ icon: d.icon, text: fallback[0].item.text });
      }
    }
  });
  return results.slice(0, 4);
}

export default function Card() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [avatar, setAvatar] = useState("🐨");
  const [ageMonths, setAgeMonths] = useState(0);
  const [milestoneSet, setMilestoneSet] = useState<MilestoneSet | null>(null);
  const [checked, setChecked] = useState<CheckedMap>({});
  const [cardFormat, setCardFormat] = useState<"9:16" | "1:1">("9:16");
  const cardRef = useRef<HTMLDivElement>(null);

  // Check localStorage for existing child name
  useEffect(() => {
    const stored = localStorage.getItem(CHILD_NAME_KEY);
    if (stored) {
      setName(stored);
    }
  }, []);

  // Auto-update age when birthDate changes
  useEffect(() => {
    if (birthDate) {
      const months = calculateAgeMonths(birthDate);
      setAgeMonths(months);
    }
  }, [birthDate]);

  const handleStartFromLanding = () => {
    const stored = localStorage.getItem(CHILD_NAME_KEY);
    if (stored) {
      setName(stored);
      setScreen("input"); // still need birthdate
    } else {
      setScreen("input");
    }
  };

  const handleInputSubmit = () => {
    if (!name.trim() || !birthDate) return;
    localStorage.setItem(CHILD_NAME_KEY, name.trim());
    const months = calculateAgeMonths(birthDate);
    setAgeMonths(months);
    const ms = getMilestoneSet(months);
    setMilestoneSet(ms);
    setChecked(initCheckedMap(ms));
    setScreen("checklist");
  };

  const toggleCheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChecklistDone = () => {
    setScreen("preview");
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `toktok-tumbuh-${name.trim().toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ["#E8A87C", "#7DAA92", "#fde68a", "#fca5a5", "#c4b5fd"] });
    setScreen("share");
  };

  const shareWhatsApp = () => {
    const highlights = milestoneSet ? getHighlightItems(milestoneSet, checked) : [];
    const firstHL = highlights.length > 0 ? highlights[0].text : "banyak hal baru";
    const msg = `${name} udah bisa ${firstHL}! 🌱 Cek tumbuh kembang anakmu juga di toktoken.lovable.app/card`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareInstagram = () => {
    window.open("instagram://camera", "_blank");
  };

  const uncheckedCount = Object.values(checked).filter((v) => !v).length;
  const { checked: checkedCount, total } = countChecked(checked);

  // ─── SCREEN: LANDING ─────────────────────────────────────
  if (screen === "landing") {
    return (
      <div className="min-h-screen flex flex-col items-center" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="w-full max-w-[430px] mx-auto px-5 py-8 flex flex-col items-center">
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-3xl">🌱</span>
            <h2 className="font-extrabold text-lg mt-1" style={{ color: "#5C4033" }}>TokTok Tumbuh</h2>
          </div>

          {/* Example Card */}
          <div
            className="w-full rounded-2xl shadow-lg p-6 mb-6 text-center"
            style={{ backgroundColor: "#FFFDF7", border: "1px solid #F3E8D8" }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl" style={{ backgroundColor: "#FDEBD0" }}>
              🐻
            </div>
            <p className="font-extrabold text-xl" style={{ color: "#5C4033" }}>Maheer</p>
            <p className="text-sm mt-1" style={{ color: "#A0856C" }}>8 Bulan Hari Ini 🌱</p>
            <div className="mt-4 rounded-xl p-3 text-left text-sm space-y-1.5" style={{ backgroundColor: "#FFFDF7", color: "#5C4033" }}>
              <p>🏃 Duduk dengan sedikit bantuan</p>
              <p>✋ Mengulurkan tangan meraih benda</p>
              <p>💬 Bersuara menarik perhatian</p>
              <p>🤝 Menoleh mencari suara</p>
            </div>
            <p className="text-xs mt-3" style={{ color: "#C4A882" }}>TokTok 💛 toktoken.lovable.app/card</p>
          </div>

          {/* Hero text */}
          <h1 className="text-2xl font-extrabold text-center leading-tight mb-2" style={{ color: "#5C4033" }}>
            Sejauh mana si kecil sudah tumbuh? 🌱
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: "#A0856C" }}>
            Buat kartu milestone dalam 60 detik. Gratis. Tanpa daftar.
          </p>

          {/* CTA */}
          <button
            onClick={handleStartFromLanding}
            className="w-full py-3.5 text-base font-bold rounded-full text-white shadow-md btn-press"
            style={{ backgroundColor: "#E8A87C" }}
          >
            Buat Kartu Sekarang
          </button>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-8 mb-6">
            {["🐨", "🦊", "🐰"].map((av, i) => (
              <div key={i} className="w-20 h-28 rounded-xl shadow flex flex-col items-center justify-center text-xs" style={{ backgroundColor: "#FFFDF7", border: "1px solid #F3E8D8" }}>
                <span className="text-2xl mb-1">{av}</span>
                <span style={{ color: "#A0856C" }}>{["3 bln", "12 bln", "24 bln"][i]}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <Link to="/" className="text-sm font-medium hover:underline" style={{ color: "#7DAA92" }}>
            Coba juga TokTok Token 🎯
          </Link>
        </div>
      </div>
    );
  }

  // ─── SCREEN: INPUT ────────────────────────────────────────
  if (screen === "input") {
    const storedName = localStorage.getItem(CHILD_NAME_KEY);

    return (
      <div className="min-h-screen flex flex-col items-center" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="w-full max-w-[430px] mx-auto px-5 py-8">
          <div className="text-center mb-6">
            <span className="text-2xl">🌱</span>
            <h2 className="font-bold text-base mt-1" style={{ color: "#5C4033" }}>TokTok Tumbuh</h2>
          </div>

          {storedName && (
            <div className="rounded-2xl p-4 mb-4 text-center" style={{ backgroundColor: "#FFFDF7", border: "1px solid #F3E8D8" }}>
              <p className="font-semibold" style={{ color: "#5C4033" }}>Halo lagi, {storedName}! 👋</p>
              <p className="text-sm" style={{ color: "#A0856C" }}>Langsung cek milestone-nya yuk.</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: "#5C4033" }}>Nama si kecil</label>
              <Input
                value={name}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 12);
                  setName(v);
                  setAvatar(autoAvatar(v));
                }}
                placeholder="contoh: Maheer"
                maxLength={12}
                className="rounded-xl border-none shadow-sm"
                style={{ backgroundColor: "#FFFDF7" }}
              />
            </div>

            {/* Birth date */}
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: "#5C4033" }}>Tanggal lahir</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl border-none shadow-sm",
                      !birthDate && "text-muted-foreground"
                    )}
                    style={{ backgroundColor: "#FFFDF7" }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "dd MMMM yyyy", { locale: idLocale }) : "Pilih tanggal lahir"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    disabled={(date) => date > new Date() || date < new Date("2018-01-01")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {birthDate && name && (
                <p className="text-sm mt-2 font-semibold" style={{ color: "#7DAA92" }}>
                  Berarti {name} sekarang {ageMonths} bulan 🎉
                </p>
              )}
            </div>

            {/* Avatar */}
            <div>
              <label className="text-sm font-semibold block mb-2" style={{ color: "#5C4033" }}>Pilih avatar</label>
              <div className="flex gap-3 justify-center">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={cn(
                      "w-14 h-14 rounded-full text-2xl flex items-center justify-center transition-all btn-press",
                      avatar === av ? "ring-3 ring-offset-2 shadow-md" : "opacity-60"
                    )}
                    style={{
                      backgroundColor: "#FDEBD0",
                      ringColor: "#E8A87C",
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleInputSubmit}
            disabled={!name.trim() || !birthDate}
            className="w-full py-3.5 text-base font-bold rounded-full text-white shadow-md mt-8 btn-press disabled:opacity-40"
            style={{ backgroundColor: "#E8A87C" }}
          >
            Lihat Milestone-nya →
          </button>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs hover:underline" style={{ color: "#7DAA92" }}>
              🎯 Coba TokTok Token
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN: CHECKLIST ────────────────────────────────────
  if (screen === "checklist" && milestoneSet) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="w-full max-w-[430px] mx-auto px-5 py-6">
          <h2 className="font-extrabold text-lg text-center mb-1" style={{ color: "#5C4033" }}>
            {name} sudah bisa ini di usia {ageMonths} bulan! 🌟
          </h2>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-4 mt-3">
            <Progress value={(checkedCount / total) * 100} className="h-2.5 flex-1" />
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#7DAA92" }}>
              {checkedCount} dari {total} ✅
            </span>
          </div>

          {/* Domains */}
          <div className="space-y-5">
            {milestoneSet.domains.map((domain, di) => (
              <div key={di}>
                <h3 className="font-bold text-sm mb-2" style={{ color: "#5C4033" }}>
                  {domain.icon} {domain.label}
                </h3>
                <div className="space-y-2">
                  {domain.items.map((item, ii) => {
                    const key = `${di}-${ii}`;
                    const isChecked = checked[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleCheck(key)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all btn-press",
                          isChecked ? "shadow-sm" : "opacity-70"
                        )}
                        style={{
                          backgroundColor: isChecked ? "#F0FAF0" : "#F5F0EB",
                          color: "#5C4033",
                        }}
                      >
                        <span className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                        )}
                          style={{ backgroundColor: isChecked ? "#7DAA92" : "#C4B5A0" }}
                        >
                          {isChecked ? "✓" : ""}
                        </span>
                        <span className={cn(!isChecked && "line-through opacity-70")}>
                          {item.text} {item.star && "⭐"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Gentle note */}
          {uncheckedCount >= 3 && (
            <div className="rounded-2xl p-4 mt-5 text-sm" style={{ backgroundColor: "#FFFDF7", color: "#A0856C", border: "1px solid #F3E8D8" }}>
              Setiap anak punya ritme tumbuhnya sendiri 💛 Jika ada yang belum tercapai, yuk konsultasikan ke dokter anak atau bidan di posyandu terdekat.
            </div>
          )}

          <button
            onClick={handleChecklistDone}
            className="w-full py-3.5 text-base font-bold rounded-full text-white shadow-md mt-6 btn-press"
            style={{ backgroundColor: "#E8A87C" }}
          >
            Buat Kartunya 🌸 →
          </button>

          <div className="text-center mt-4">
            <Link to="/" className="text-xs hover:underline" style={{ color: "#7DAA92" }}>
              🎯 Coba TokTok Token
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN: PREVIEW ──────────────────────────────────────
  if (screen === "preview" && milestoneSet) {
    const highlights = getHighlightItems(milestoneSet, checked);
    const caption = getCaption(ageMonths, name);

    return (
      <div className="min-h-screen flex flex-col items-center" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="w-full max-w-[430px] mx-auto px-5 py-6">
          <h2 className="font-extrabold text-lg text-center mb-4" style={{ color: "#5C4033" }}>
            Kartu Milestone {name} 🌸
          </h2>

          {/* The Card */}
          <div
            ref={cardRef}
            className={cn(
              "relative mx-auto rounded-2xl shadow-lg overflow-hidden flex flex-col items-center justify-center",
              cardFormat === "9:16" ? "aspect-[9/16] w-full max-w-[340px]" : "aspect-square w-full max-w-[360px]"
            )}
            style={{ backgroundColor: "#FFF8F0" }}
          >
            {/* Floral corners */}
            <div className="absolute top-0 left-0 w-24 h-24 opacity-30 pointer-events-none" style={{
              background: "radial-gradient(circle at 20% 20%, #F4B8C1 0%, transparent 60%), radial-gradient(circle at 60% 40%, #B5D8C2 0%, transparent 50%)",
            }} />
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-30 pointer-events-none" style={{
              background: "radial-gradient(circle at 80% 80%, #F4B8C1 0%, transparent 60%), radial-gradient(circle at 40% 60%, #B5D8C2 0%, transparent 50%)",
            }} />

            <div className="relative z-10 flex flex-col items-center px-6 py-8 w-full">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3" style={{ backgroundColor: "#FDEBD0" }}>
                {avatar}
              </div>

              {/* Name */}
              <p className="font-extrabold text-2xl" style={{ color: "#5C4033" }}>{name}</p>
              <p className="text-sm mt-1" style={{ color: "#A0856C" }}>{ageMonths} Bulan Hari Ini 🌱</p>

              {/* Milestones */}
              <div className="w-full rounded-xl p-4 mt-4 space-y-2" style={{ backgroundColor: "#FFFDF7" }}>
                {highlights.map((h, i) => (
                  <p key={i} className="text-sm" style={{ color: "#5C4033" }}>
                    {h.icon} {h.text}
                  </p>
                ))}
              </div>

              {/* Caption */}
              <p className="text-sm mt-4 text-center italic" style={{ color: "#A0856C" }}>{caption}</p>

              {/* Watermark */}
              <p className="text-[10px] mt-4" style={{ color: "#C4A882" }}>TokTok 💛 toktoken.lovable.app/card</p>
              <p className="text-[8px] mt-1" style={{ color: "#C4A882" }}>Milestone berdasarkan standar IDAI & WHO</p>
            </div>
          </div>

          {/* Format toggle */}
          <div className="flex justify-center gap-2 mt-4">
            {(["9:16", "1:1"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setCardFormat(fmt)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                  cardFormat === fmt ? "text-white shadow" : "opacity-60"
                )}
                style={{ backgroundColor: cardFormat === fmt ? "#E8A87C" : "#F3E8D8", color: cardFormat === fmt ? "#fff" : "#5C4033" }}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Cross-promo */}
          <Link
            to="/"
            className="block rounded-xl p-3 mt-4 text-center text-sm font-medium"
            style={{ backgroundColor: "#E8F4FD", color: "#4A90D9" }}
          >
            Simpan semua milestone {name} di TokTok Token 🎯 →
          </Link>

          <button
            onClick={handleDownload}
            className="w-full py-3.5 text-base font-bold rounded-full text-white shadow-md mt-4 btn-press"
            style={{ backgroundColor: "#E8A87C" }}
          >
            Lanjut Bagikan →
          </button>

          <div className="text-center mt-4">
            <Link to="/" className="text-xs hover:underline" style={{ color: "#7DAA92" }}>
              🎯 Coba TokTok Token
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN: SHARE ────────────────────────────────────────
  if (screen === "share") {
    return (
      <div className="min-h-screen flex flex-col items-center" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="w-full max-w-[430px] mx-auto px-5 py-8">
          <div className="text-center mb-6">
            <span className="text-4xl">🎉</span>
            <h2 className="font-extrabold text-xl mt-2" style={{ color: "#5C4033" }}>Kartu siap dibagikan!</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 text-base font-bold rounded-full text-white shadow-md btn-press"
              style={{ backgroundColor: "#E8A87C" }}
            >
              ⬇️ Unduh Kartu
            </button>

            <button
              onClick={shareWhatsApp}
              className="w-full py-3.5 text-base font-bold rounded-full shadow-md btn-press"
              style={{ backgroundColor: "#FFFDF7", color: "#5C4033", border: "1px solid #F3E8D8" }}
            >
              💬 Bagikan ke WhatsApp
            </button>

            <button
              onClick={shareInstagram}
              className="w-full py-3.5 text-base font-bold rounded-full shadow-md btn-press"
              style={{ backgroundColor: "#FFFDF7", color: "#5C4033", border: "1px solid #F3E8D8" }}
            >
              📸 Bagikan ke Instagram
            </button>
          </div>

          {/* Upsell */}
          <div className="rounded-2xl p-5 mt-6 text-center" style={{ backgroundColor: "#FFFDF7", border: "1px solid #F3E8D8" }}>
            <p className="text-sm" style={{ color: "#5C4033" }}>
              Mau ingat milestone bulan depan juga? Buat akun TokTok gratis dan simpan semua perjalanan tumbuh {name} 💛
            </p>
            <Link
              to="/"
              className="inline-block mt-3 px-6 py-2.5 rounded-full text-sm font-bold text-white btn-press"
              style={{ backgroundColor: "#7DAA92" }}
            >
              Buat Akun Gratis →
            </Link>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => setScreen("landing")}
              className="text-xs hover:underline"
              style={{ color: "#A0856C" }}
            >
              ← Buat kartu lagi
            </button>
          </div>

          <div className="text-center mt-3">
            <Link to="/" className="text-xs hover:underline" style={{ color: "#7DAA92" }}>
              🎯 Coba TokTok Token
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
