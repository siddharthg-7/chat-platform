import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-ink text-white font-sans">
      <Navbar />
      <main className="flex-1 min-h-0 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}