import { cn } from "@/lib/utils";

type ScoreGaugeProps = {
  score: number;
  label?: string;
  size?: "sm" | "lg";
};

function scoreColor(score: number): string {
  if (score >= 70) return "#6B8E5A";
  if (score >= 40) return "#8B6F2E";
  return "#D4A04C";
}

export function ScoreGauge({ score, label = "Score global", size = "lg" }: ScoreGaugeProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const dimensions = size === "lg" ? "h-44 w-44" : "h-28 w-28";

  return (
    <div className={cn("relative flex items-center justify-center", dimensions)}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E8DFC9" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("font-serif font-bold text-matrice-encre", size === "lg" ? "text-4xl" : "text-2xl")}>
          {score}
        </span>
        <span className="mt-1 max-w-[8rem] text-[10px] font-semibold uppercase tracking-[0.18em] text-matrice-encre/48">
          {label}
        </span>
      </div>
    </div>
  );
}
