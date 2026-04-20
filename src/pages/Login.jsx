import React, { useState } from "react";
import { useEmailService } from "../components/email/useEmailService";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ChevronDown, Shield, Check, Building2, User, Lock, Mail, Calendar, ChevronRight } from "lucide-react";

function PasswordStrength({ password }) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un chiffre", ok: /[0-9]/.test(password) },
    { label: "Un caractère spécial", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const levels = ["", "Faible", "Moyen", "Bon", "Fort"];
  const colors = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={"h-1.5 flex-1 rounded-full transition-all " + (i <= score ? colors[score] : "bg-gray-200")} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={"text-xs font-semibold " + (score >= 4 ? "text-green-600" : score >= 3 ? "text-yellow-600" : "text-red-500")}>{levels[score]}</span>
        {score < 4 && <span className="text-xs text-gray-400">Score minimum requis : Fort</span>}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c, i) => (
          <div key={i} className={"flex items-center gap-1 text-xs " + (c.ok ? "text-green-600" : "text-gray-400")}>
            <Check className="w-3 h-3 flex-shrink-0" />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10 outline-none text-sm transition-all bg-white text-gray-900 placeholder-gray-400";
const selectCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10 outline-none text-sm transition-all bg-white appearance-none text-gray-900";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [isPro, setIsPro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "", birthdate: "",
    companyName: "", legalStatus: "", legalForm: "", city: "", siret: "",
    tva: "", taxProfile: "", companyEmail: "", managerFirstName: "",
    managerLastName: "", managerBirthdate: "",
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" }
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (error) setError("Email ou mot de passe incorrect.");
    else window.location.href = "/";
    setLoading(false);
  };

  const { sendSignupConfirmation } = useEmailService();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const pwdChecks = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)];
    if (pwdChecks.filter(Boolean).length < 4) { setError("Le mot de passe doit être Fort."); setLoading(false); return; }
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.firstName + " " + form.lastName, is_pro: isPro, ...(isPro ? { company: form.companyName } : {}) } }
    });
    if (error) setError(error.message);
    else {
      // Créer le profil avec is_pro
      if (signUpData?.user?.id) {
        await supabase.from("profiles").upsert({
          id: signUpData.user.id,
          email: form.email,
          full_name: form.firstName + " " + form.lastName,
          is_pro: !!isPro,
          plan: isPro ? "basique" : null,
        });
      }
      setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      sendSignupConfirmation({ email: form.email, full_name: form.firstName + " " + form.lastName });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#0A2E1A] via-[#1B5E20] to-[#2E7D32] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: 120+i*60, height: 120+i*60, top: -20+i*15+"%", left: -10+i*8+"%", opacity: 0.05+i*0.02 }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-[#1B5E20] font-black text-lg">S</span>
            </div>
            <span className="text-white font-black text-xl">SwingMarket<span className="text-amber-400">Golf</span></span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            La marketplace<br />dédiée aux<br /><span className="text-amber-400">passionnés de golf</span>
          </h2>
          <p className="text-green-100 text-lg mb-12">Achetez et vendez vos clubs, balles et équipements en toute confiance.</p>
          <div className="space-y-4">
            {["Paiement sécurisé par Stripe", "Protection acheteur sur chaque transaction", "Livraison suivie"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#1B5E20] font-bold" />
                </div>
                <span className="text-green-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-green-200/50 text-xs relative z-10">© 2026 SwingMarket — Marketplace Golf France</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-start justify-center py-10 px-4 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* TABS */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            {[["login", "Se connecter"], ["register", "Créer un compte"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all " + (mode === m ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}>
                {label}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Ravi de vous revoir sur SwingMarket 👋</h1>
                <p className="text-gray-500 text-sm">Connectez-vous à votre compte SwingMarket.</p>
              </div>
              <Field label="Adresse email" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="vous@email.com" value={form.email} onChange={set("email")} className={inputCls + " pl-10"} required />
                </div>
              </Field>
              <Field label="Mot de passe" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={set("password")} className={inputCls + " pl-10 pr-10"} required />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <div className="flex justify-end">
                <button type="button" className="text-xs text-[#1B5E20] hover:underline">Mot de passe oublié ?</button>
              </div>
              <button type="button" onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 mb-2">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 17 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.1-17.7 10.2z"/><path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.5C29.8 36.1 27 37 24 37c-6 0-11.1-3.9-12.9-9.3l-7 5.4C7.6 41.1 15.3 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.8-2.8 5.1-5.3 6.7l6.6 5.5C41.3 37.6 44.5 31.3 44.5 24c0-1.3-.2-2.7-.5-4z"/></svg>
                Continuer avec Google
              </button>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <p className="text-center text-sm text-gray-500">Pas encore de compte ? <button type="button" onClick={() => setMode("register")} className="text-[#1B5E20] font-semibold hover:underline">Créer un compte</button></p>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Créer mon compte</h1>
                <p className="text-gray-500 text-sm">Gratuit et sans engagement. Achetez et vendez en quelques minutes.</p>
              </div>

              {/* Bouton Google */}
              <button type="button" onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 mb-2">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 17 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.1-17.7 10.2z"/><path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.5C29.8 36.1 27 37 24 37c-6 0-11.1-3.9-12.9-9.3l-7 5.4C7.6 41.1 15.3 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.8-2.8 5.1-5.3 6.7l6.6 5.5C41.3 37.6 44.5 31.3 44.5 24c0-1.3-.2-2.7-.5-4z"/></svg>
                Continuer avec Google
              </button>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">ou créer avec email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* INFOS PERSO */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom" required>
                  <input type="text" placeholder="Jean" value={form.firstName} onChange={set("firstName")} className={inputCls} required />
                </Field>
                <Field label="Nom" required>
                  <input type="text" placeholder="Dupont" value={form.lastName} onChange={set("lastName")} className={inputCls} required />
                </Field>
              </div>
              <Field label="Adresse email" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="vous@email.com" value={form.email} onChange={set("email")} className={inputCls + " pl-10"} required />
                </div>
              </Field>
              <Field label="Mot de passe" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={set("password")} className={inputCls + " pl-10 pr-10"} required />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </Field>
              <Field label="Date de naissance" required hint="Format : jj/mm/aaaa — Ex. : 31/05/1970">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="31/05/1970" value={form.birthdate} onChange={set("birthdate")} className={inputCls + " pl-10"} required />
                </div>
              </Field>

              {/* QUESTION PRO */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-4">Je souhaite vendre en tant que professionnel</p>
                <div className="flex gap-3">
                  {[["Oui", true], ["Non", false]].map(([label, val]) => (
                    <button key={label} type="button" onClick={() => setIsPro(val)}
                      className={"flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all " + (isPro === val ? "border-[#1B5E20] bg-[#1B5E20] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION PRO - ANIMATION */}
              <div className={"overflow-hidden transition-all duration-500 " + (isPro ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-sm">Informations société</h3>
                  </div>
                  <Field label="Nom de la société" required>
                    <input type="text" placeholder="SwingPro SARL" value={form.companyName} onChange={set("companyName")} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Statut juridique" required>
                      <div className="relative">
                        <select value={form.legalStatus} onChange={set("legalStatus")} className={selectCls}>
                          <option value="">-- veuillez choisir --</option>
                          <option>Auto-entrepreneur</option>
                          <option>SARL</option>
                          <option>SAS</option>
                          <option>SASU</option>
                          <option>EURL</option>
                          <option>SA</option>
                          <option>EI</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Forme juridique">
                      <input type="text" placeholder="Ex. : Société à responsabilité" value={form.legalForm} onChange={set("legalForm")} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Ville d'enregistrement" required>
                    <input type="text" placeholder="Paris" value={form.city} onChange={set("city")} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="SIRET" hint="Optionnel">
                      <input type="text" placeholder="123 456 789 00012" value={form.siret} onChange={set("siret")} className={inputCls} />
                    </Field>
                    <Field label="N° de TVA" hint="Optionnel">
                      <input type="text" placeholder="FR12345678901" value={form.tva} onChange={set("tva")} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Profil de taxe" required hint="Cette taxe sera définie sur chacune des offres que vous créerez.">
                    <div className="relative">
                      <select value={form.taxProfile} onChange={set("taxProfile")} className={selectCls}>
                        <option value="">-- veuillez choisir --</option>
                        <option>TVA 20%</option>
                        <option>TVA 10%</option>
                        <option>TVA 5.5%</option>
                        <option>Exonéré de TVA</option>
                        <option>Auto-entrepreneur (sans TVA)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Email de contact société" required>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" placeholder="contact@masociete.fr" value={form.companyEmail} onChange={set("companyEmail")} className={inputCls + " pl-10"} />
                    </div>
                  </Field>

                  {/* INFOS GERANT */}
                  <div className="border-t border-blue-200 pt-5">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900 text-sm">Informations du gérant</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Prénom du gérant" required>
                          <input type="text" placeholder="Jean" value={form.managerFirstName} onChange={set("managerFirstName")} className={inputCls} />
                        </Field>
                        <Field label="Nom du gérant" required>
                          <input type="text" placeholder="Dupont" value={form.managerLastName} onChange={set("managerLastName")} className={inputCls} />
                        </Field>
                      </div>
                      <Field label="Date de naissance du gérant" required hint="Format : jj/mm/aaaa">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" placeholder="31/05/1970" value={form.managerBirthdate} onChange={set("managerBirthdate")} className={inputCls + " pl-10"} />
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRUST BADGES */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700">Vos données sont protégées et ne seront jamais partagées avec des tiers.</p>
              </div>

              {/* CGU */}
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                En créant un compte, vous acceptez nos{" "}
                <Link to="/CGU" className="text-[#1B5E20] hover:underline">Conditions d'utilisation</Link>
                {" "}et notre{" "}
                <Link to="/Confidentialite" className="text-[#1B5E20] hover:underline">Politique de confidentialité</Link>.
              </p>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
              {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{success}</div>}

              <button type="submit" disabled={loading || isPro === null} className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-base">
                {loading ? "Création du compte..." : "Créer mon compte gratuitement"}
              </button>
              <p className="text-center text-sm text-gray-500">Déjà un compte ? <button type="button" onClick={() => setMode("login")} className="text-[#1B5E20] font-semibold hover:underline">Se connecter</button></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}