import { useTheme } from "@/context/ThemeContext";
import AuthWallpaper from "./AuthWallpaper";
import ThemeToggle from "./ThemeToggle";

export default function AuthLayout({
  children,
  wallpaperPosition = "left",
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-foreground transition-colors duration-300">
      <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-panel transition-colors duration-300">
        <h1 className="text-2xl font-bold text-foreground">Chat Platform</h1>
        <ThemeToggle theme={theme} setTheme={toggleTheme} />
      </header>

      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {wallpaperPosition === "left" && (
          <div className="hidden lg:block w-[55%] h-full">
            <AuthWallpaper theme={theme} />
          </div>
        )}

        <div className="w-full lg:w-[45%] flex items-center justify-center p-4 overflow-hidden bg-surface">
          <div className="w-full max-w-[440px] max-h-full overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>

        {wallpaperPosition === "right" && (
          <div className="hidden lg:block w-[55%] h-full">
            <AuthWallpaper theme={theme} />
          </div>
        )}
      </main>
    </div>
  );
}