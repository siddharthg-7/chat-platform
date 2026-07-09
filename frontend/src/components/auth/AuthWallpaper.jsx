import darkWallpaper from "@/assets/wallpaper-dark.png";
import lightWallpaper from "@/assets/wallpaper-light.png";

export default function AuthWallpaper({ theme }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img
        src={theme === "dark" ? darkWallpaper : lightWallpaper}
        className="w-full h-full object-cover"
        alt="Wallpaper"
      />
    </div>
  );
}