import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";
import ThemeToggle from "../components/ThemeToggle";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.post("/auth/login", { username, password });
      setToken(data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Prijava - Admin</h1>
        <ThemeToggle className="border border-line text-ink hover:bg-canvas" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Korisničko ime</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-line rounded px-3 py-2"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Lozinka</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded px-3 py-2"
          />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-graphite hover:bg-graphite/90 text-white font-medium px-4 py-2.5 rounded"
        >
          Prijavi se
        </button>
      </form>
    </div>
  );
}
