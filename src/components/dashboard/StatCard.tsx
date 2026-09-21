import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, tone = "brand" }: { label: string; value: number | string; icon: LucideIcon; tone?: "brand" | "gold" | "red" | "gray" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    gold: "bg-gold-100 text-amber-700",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
