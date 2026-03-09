export interface MilestoneItem {
  text: string;
  star: boolean;
}

export interface MilestoneDomain {
  label: string;
  icon: string;
  items: MilestoneItem[];
}

export interface MilestoneSet {
  ageMonths: number;
  domains: MilestoneDomain[];
}

function m(text: string): MilestoneItem {
  const star = text.endsWith("⭐");
  return { text: star ? text.slice(0, -1).trim() : text, star };
}

export const MILESTONE_SETS: MilestoneSet[] = [
  {
    ageMonths: 3,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Lengan dan kaki bergerak aktif ⭐"), m("Mengangkat kepala saat tengkurap ⭐"), m("Kepala terangkat 45° saat tengkurap"), m("Kepala tegak saat tengkurap")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Kepala mengikuti gerakan benda dari sisi ke tengah ⭐")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Mengoceh selain menangis"), m("Bereaksi terhadap suara")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Menatap wajah orang tua ⭐"), m("Tersenyum saat diajak bicara"), m("Tertawa keras")] },
    ],
  },
  {
    ageMonths: 6,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Membalik badan telentang ke tengkurap ⭐"), m("Dada terangkat menumpu lengan"), m("Duduk dengan sedikit bantuan ⭐")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Menggenggam mainan"), m("Mengulurkan tangan meraih benda ⭐"), m("Memindahkan mainan antar tangan")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Bersuara menarik perhatian"), m("Bereaksi suara bisikan")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Menoleh mencari suara ⭐"), m("Merespons girang saat bermain")] },
    ],
  },
  {
    ageMonths: 9,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Duduk sendiri tanpa bantuan ⭐"), m("Berdiri berpegangan ⭐"), m("Merangkak maju minimal 1 meter")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Menjumput benda kecil dengan ibu jari & telunjuk ⭐"), m("Memindahkan benda antar tangan")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Mengucapkan mama/papa"), m("Mengerti kata tidak/jangan")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Bermain cilukba ⭐"), m("Membedakan orang dikenal vs asing"), m("Mencari benda yang disembunyikan")] },
    ],
  },
  {
    ageMonths: 12,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Berdiri sendiri tanpa pegangan ⭐"), m("Berjalan berpegangan"), m("Berjalan beberapa langkah tanpa pegangan ⭐")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Pincer grasp matang"), m("Memasukkan benda ke wadah ⭐")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Mengerti instruksi sederhana"), m("Meniru gerakan dan suara")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Memanggil mama/papa dengan tepat ⭐"), m("Menunjuk yang diinginkan tanpa menangis"), m("Melambaikan tangan dadah")] },
    ],
  },
  {
    ageMonths: 18,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Berjalan tanpa terhuyung ⭐"), m("Berjalan mundur 5 langkah"), m("Naik tangga berpegangan")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Menumpuk 3-4 balok ⭐"), m("Memegang sendok makan sendiri ⭐")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Mengucapkan 5-10 kata bermakna ⭐"), m("Mengikuti perintah sederhana")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Meniru kegiatan rumah tangga ⭐"), m("Bermain aktif dengan orang tua"), m("Menunjuk bagian tubuh")] },
    ],
  },
  {
    ageMonths: 24,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Berlari tanpa jatuh ⭐"), m("Menendang bola ke depan"), m("Naik tangga sendiri")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Menumpuk 4 balok"), m("Mencoret-coret dengan crayon ⭐")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Menyebut 2 kata bersamaan ⭐"), m("Menunjuk gambar dalam buku")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Makan sendiri tanpa banyak tumpah ⭐"), m("Melepas pakaian sendiri"), m("Membantu membereskan mainan ⭐")] },
    ],
  },
  {
    ageMonths: 36,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Berdiri satu kaki minimal 1 detik ⭐"), m("Melompat dengan kedua kaki ⭐"), m("Naik tangga tanpa berpegangan")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Menggambar lingkaran ⭐"), m("Menumpuk 8 balok")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Bicara kalimat 3 kata ⭐"), m("Menyebut nama dan usia")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Bermain bersama anak lain ⭐"), m("Mengikuti aturan permainan sederhana"), m("Menyebut nama lengkap")] },
    ],
  },
  {
    ageMonths: 48,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Melompati kertas dengan kedua kaki ⭐"), m("Berdiri satu kaki 2 detik"), m("Mengayuh sepeda roda tiga")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Menggambar orang dengan kepala dan anggota badan ⭐"), m("Menggunting kertas lurus ⭐")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Menyebut 4 warna dengan benar ⭐"), m("Menjawab pertanyaan mengapa")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Bermain peran dokter-dokteran ⭐"), m("Berpakaian sendiri tanpa kancing"), m("Bermain petak umpet")] },
    ],
  },
  {
    ageMonths: 60,
    domains: [
      { label: "Gerak Tubuh", icon: "🏃", items: [m("Melompat satu kaki 2 kali berturut-turut ⭐"), m("Berdiri satu kaki 6 detik"), m("Menangkap bola dari jarak 1 meter ⭐")] },
      { label: "Tangan & Mata", icon: "✋", items: [m("Menggambar orang lengkap kepala badan lengan kaki ⭐"), m("Menulis nama sendiri ⭐")] },
      { label: "Bicara & Dengar", icon: "💬", items: [m("Bicara jelas dipahami orang asing"), m("Membedakan fantasi dan kenyataan")] },
      { label: "Perasaan & Teman", icon: "🤝", items: [m("Berpakaian lengkap sendiri"), m("Gosok gigi sendiri"), m("Menyebut nama dan alamat ⭐")] },
    ],
  },
];

export function getMilestoneSet(ageMonths: number): MilestoneSet {
  if (ageMonths <= 3) return MILESTONE_SETS[0];
  if (ageMonths <= 5) return MILESTONE_SETS[1];
  if (ageMonths <= 8) return MILESTONE_SETS[1];
  if (ageMonths <= 11) return MILESTONE_SETS[2];
  if (ageMonths <= 17) return MILESTONE_SETS[3];
  if (ageMonths <= 23) return MILESTONE_SETS[4];
  if (ageMonths <= 35) return MILESTONE_SETS[5];
  if (ageMonths <= 47) return MILESTONE_SETS[6];
  if (ageMonths <= 59) return MILESTONE_SETS[7];
  return MILESTONE_SETS[8];
}

export function getCaption(ageMonths: number, name: string): string {
  if (ageMonths <= 6) return "Setiap hari ada hal baru yang kamu pelajari 🌸";
  if (ageMonths <= 12) return `Dunia makin luas di matamu, ${name}! 🌍`;
  if (ageMonths <= 24) return `Langkah kecilmu, kebanggaan besar kami 👣`;
  if (ageMonths <= 36) return `Bicara terus ya, ${name}! Kami selalu mau dengar 💬`;
  return `Kamu tumbuh lebih cepat dari yang Ayah Bunda kira 🚀`;
}

export function calculateAgeMonths(birthDate: Date): number {
  const now = new Date();
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
  months += now.getMonth() - birthDate.getMonth();
  if (now.getDate() < birthDate.getDate()) months--;
  return Math.max(0, months);
}

export const AVATARS = ["🐨", "🦊", "🐻", "🐰", "🐼"];

export function autoAvatar(name: string): string {
  if (!name) return AVATARS[0];
  const idx = name.charCodeAt(0) % AVATARS.length;
  return AVATARS[idx];
}
