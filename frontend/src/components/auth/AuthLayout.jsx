import { useState } from "react";
import AuthWallpaper from "./AuthWallpaper";
import ThemeToggle from "./ThemeToggle";

export default function AuthLayout({
  children,
  wallpaperPosition = "left",
}) {
  const [theme, setTheme] = useState("dark");

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "dark" ? "auth-dark" : "auth-light"
      }`}
    >
      {/* Navbar */}
      <header
        className={`h-16 flex items-center justify-between px-8 border-b transition-colors duration-300 ${
          theme === "dark"
            ? "bg-black border-zinc-800"
            : "bg-white border-zinc-200"
        }`}
      >
        <h1 className="text-2xl font-bold">
          Chat Platform
        </h1>

        <ThemeToggle
          theme={theme}
          setTheme={setTheme}
        />
      </header>

      {/* Content */}
      <main className="flex h-[calc(100vh-64px)]">

        {wallpaperPosition === "left" && (
            <div className="hidden lg:block w-[55%]">
            <AuthWallpaper theme={theme} />
            </div>
        )}

        <div
            className={`w-full lg:w-[45%] flex items-center justify-center p-8 ${
            theme === "dark" ? "bg-black" : "bg-white"
            }`}
        >
            {children}
        </div>

        {wallpaperPosition === "right" && (
            <div className="hidden lg:block w-[55%]">
            <AuthWallpaper theme={theme} />
            </div>
        )}

      </main>
    </div>
  );
}