// Bảng màu pastel cho từng category — cùng category luôn ra cùng màu
const PALETTE = [
  { bg: "bg-amber-50", border: "border-amber-200/70", text: "text-amber-800" },
  { bg: "bg-sky-50", border: "border-sky-200/70", text: "text-sky-800" },
  { bg: "bg-emerald-50", border: "border-emerald-200/70", text: "text-emerald-800" },
  { bg: "bg-violet-50", border: "border-violet-200/70", text: "text-violet-800" },
  { bg: "bg-rose-50", border: "border-rose-200/70", text: "text-rose-800" },
  { bg: "bg-cyan-50", border: "border-cyan-200/70", text: "text-cyan-800" },
  { bg: "bg-lime-50", border: "border-lime-200/70", text: "text-lime-800" },
  { bg: "bg-orange-50", border: "border-orange-200/70", text: "text-orange-800" },
];

const NEUTRAL = { bg: "bg-white", border: "border-border", text: "text-foreground" };

const hashKey = (key) => {
  const s = String(key ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export const getCategoryStyle = (key) => {
  if (key == null || key === "") return NEUTRAL;
  return PALETTE[hashKey(key) % PALETTE.length];
};
