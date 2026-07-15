// frontend/src/components/auth/ThemeToggle.jsx
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
        theme === "dark"
          ? "border-border bg-glass"
          : "border-border bg-glass"
      }`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
}
