import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-ink text-center px-4">
      <p className="text-5xl font-bold text-white mb-2">404</p>
      <p className="text-sm text-muted mb-6">This page doesn't exist.</p>
      <Link to="/">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
