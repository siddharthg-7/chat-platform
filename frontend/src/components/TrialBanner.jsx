export default function TrialBanner({ daysLeft = 8 }) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border-b border-border px-5 py-2 text-sm">
      <span className="text-muted">
        You have <span className="font-semibold text-white">{daysLeft} days</span> left in your Advanced trial
      </span>
      <button className="bg-accent hover:bg-accent2 transition-colors text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
        Upgrade plan
      </button>
    </div>
  );
}
