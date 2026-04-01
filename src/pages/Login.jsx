import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else window.location.href = "/";
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } }
      });
      if (error) setError(error.message);
      else setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1B5E20]">
            SwingMarket<span className="text-[#C5A028]">Golf</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {mode === "login" ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom et nom</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Alexandre Daniel" required className="rounded-lg" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com" required className="rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required className="rounded-lg" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <Button type="submit" disabled={loading}
            className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full py-2.5">
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-[#1B5E20] font-medium hover:underline">
            {mode === "login" ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}