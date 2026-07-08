import { useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Profile() {
  const [form, setForm] = useState({
    name: "Chirag Sharma",
    email: "chirag@example.com",
    title: "Support Agent",
  });
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-semibold text-white mb-1">Profile</h1>
      <p className="text-sm text-muted mb-6">Your account details</p>

      <Card className="max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-mint" />
            <div>
              <p className="text-sm font-semibold text-white">{form.name}</p>
              <p className="text-xs text-muted">{form.title}</p>
            </div>
          </div>
          <Input label="Full name" name="name" value={form.name} onChange={handleChange} />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Title" name="title" value={form.title} onChange={handleChange} />
          <div className="flex items-center gap-3">
            <Button type="submit">Save changes</Button>
            {saved && <span className="text-xs text-mint">Saved</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}
