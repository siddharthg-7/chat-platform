import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-700"
          : "bg-white border-zinc-300"
      }`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-zinc-200" />
      ) : (
        <Moon className="h-5 w-5 text-zinc-900" />
      )}
    </button>
  );
}