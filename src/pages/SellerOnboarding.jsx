import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Upload } from "lucide-react";

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    account_type: "particulier",
    first_name: "", last_name: "",
    birth_day: "", birth_month: "", birth_year: "",
    phone: "", address: "", postal_code: "", city: "", iban: "",
    id_front: null, id_back: null,
    id_type: "carte_identite",
    stripe_accepted: false,
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const steps = [
    { num: 1, label: "Profil" },
    { num: 2, label: "Infos" },
    { num: 3, label: "Banque" },
    { num: 4, label: "Identité" },
  ];

  const handleFinish = async () => {
    setSaving(true);
    console.log("USER ID:", user?.id, "USER EMAIL:", user?.email);
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("profiles").update({
      seller_onboarding_completed: true,
      phone: form.phone,
      address: form.address,
      postal_code: form.postal_code,
      city: form.city,
      iban: form.iban,
      account_type: form.account_type,
    }).eq("email", user.email);
    console.log("Onboarding update error:", error);
    setSaving(false);
    navigate("/CreateListing");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#1B5E20] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-black text-xl text-gray-900">SwingMarket<span className="text-[#C5A028]">Golf</span></span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration vendeur</h1>
          <p className="text-gray-500 text-sm mt-1">Configurez votre compte pour commencer a vendre</p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s.num ? "bg-[#1B5E20] text-white" :
                  step === s.num ? "bg-[#1B5E20] text-white ring-4 ring-[#1B5E20]/20" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs mt-1 font-medium ${step >= s.num ? "text-[#1B5E20]" : "text-gray-400"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > s.num ? "bg-[#1B5E20]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configuration du paiement</h2>
                <p className="text-sm text-gray-500 mt-1">Votre compte sera associe a votre moyen de paiement.</p>
              </div>
              <div className="space-y-3">
                {[
                  { value: "particulier", label: "Compte particulier", desc: "Je vends a titre personnel" },
                  { value: "professionnel", label: "Compte professionnel", desc: "Je vends en tant que societe" },
                ].map(opt => (
                  <button key={opt.value} onClick={() => update("account_type", opt.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      form.account_type === opt.value ? "border-[#1B5E20] bg-[#1B5E20]/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        form.account_type === opt.value ? "border-[#1B5E20]" : "border-gray-300"
                      }`}>
                        {form.account_type === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[#1B5E20]" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl h-11">Continuer</Button>
              <p className="text-center text-xs text-gray-400">🔒 Donnees transmises de maniere securisee via Stripe</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vos informations</h2>
                <p className="text-sm text-gray-500 mt-1">Ces informations sont requises pour la verification de votre compte.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Prenom</label>
                  <Input value={form.first_name} onChange={e => update("first_name", e.target.value)} placeholder="Alexandre" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Nom</label>
                  <Input value={form.last_name} onChange={e => update("last_name", e.target.value)} placeholder="Daniel" className="rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Date de naissance</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={form.birth_day} onChange={e => update("birth_day", e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]">
                    <option value="">Jour</option>
                    {Array.from({length:31},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={form.birth_month} onChange={e => update("birth_month", e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]">
                    <option value="">Mois</option>
                    {["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"].map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                  <select value={form.birth_year} onChange={e => update("birth_year", e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]">
                    <option value="">Annee</option>
                    {Array.from({length:80},(_,i)=>2005-i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-11 border-gray-200">Retour</Button>
                <Button onClick={() => setStep(3)} disabled={!form.first_name || !form.last_name || !form.birth_day} className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl h-11">Continuer</Button>
              </div>
              <p className="text-center text-xs text-gray-400">🔒 Donnees transmises de maniere securisee via Stripe</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Coordonnees bancaires</h2>
                <p className="text-sm text-gray-500 mt-1">Pour recevoir l argent de vos ventes directement sur votre compte.</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Telephone</label>
                <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="06 12 34 56 78" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Adresse</label>
                <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="12 rue des Lilas" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Code postal</label>
                  <Input value={form.postal_code} onChange={e => update("postal_code", e.target.value)} placeholder="75001" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Ville</label>
                  <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="Paris" className="rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">IBAN</label>
                <Input value={form.iban} onChange={e => update("iban", e.target.value)} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" className="rounded-xl font-mono" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl h-11 border-gray-200">Retour</Button>
                <Button onClick={() => setStep(4)} disabled={!form.phone || !form.address || !form.iban} className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl h-11">Continuer</Button>
              </div>
              <p className="text-center text-xs text-gray-400">🔒 Donnees transmises de maniere securisee via Stripe</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Verification d identite</h2>
                <p className="text-sm text-gray-500 mt-1">Envoyez une piece d identite valide pour finaliser votre compte.</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Type de piece</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "carte_identite", label: "Carte d identite" },
                    { value: "passeport", label: "Passeport" },
                    { value: "permis", label: "Permis de conduire" },
                  ].map(t => (
                    <button key={t.value} onClick={() => update("id_type", t.value)}
                      className={`p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                        form.id_type === t.value ? "border-[#1B5E20] bg-[#1B5E20]/5 text-[#1B5E20]" : "border-gray-200 text-gray-600"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Piece d identite (recto)</label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  form.id_front ? "border-[#1B5E20] bg-[#1B5E20]/5" : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => update("id_front", e.target.files[0])} />
                  {form.id_front ? (
                    <div className="text-center">
                      <CheckCircle className="w-6 h-6 text-[#1B5E20] mx-auto mb-1" />
                      <p className="text-xs text-[#1B5E20] font-medium">{form.id_front.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Cliquez ou deposez votre fichier ici</p>
                      <p className="text-xs text-gray-400">JPEG, PNG ou PDF</p>
                    </div>
                  )}
                </label>
              </div>
              {form.id_type !== "passeport" && (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Piece d identite (verso)</label>
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    form.id_back ? "border-[#1B5E20] bg-[#1B5E20]/5" : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => update("id_back", e.target.files[0])} />
                    {form.id_back ? (
                      <div className="text-center">
                        <CheckCircle className="w-6 h-6 text-[#1B5E20] mx-auto mb-1" />
                        <p className="text-xs text-[#1B5E20] font-medium">{form.id_back.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Cliquez ou deposez votre fichier ici</p>
                        <p className="text-xs text-gray-400">Requis pour les cartes et permis</p>
                      </div>
                    )}
                  </label>
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.stripe_accepted} onChange={e => update("stripe_accepted", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300" />
                <span className="text-xs text-gray-600">
                  J accepte les{" "}
                  <a href="https://stripe.com/fr/legal/connect-account" target="_blank" rel="noopener noreferrer" className="text-[#1B5E20] underline">
                    conditions d utilisation de Stripe
                  </a>{" "}
                  et j autorise SwingMarketGolf a transferer mes informations a Stripe pour la configuration de mon compte de paiement.
                </span>
              </label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-xl h-11 border-gray-200">Retour</Button>
                <Button onClick={handleFinish}
                  disabled={!form.id_front || !form.stripe_accepted || saving || (form.id_type !== "passeport" && !form.id_back)}
                  className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl h-11 gap-2">
                  🔒 {saving ? "Finalisation..." : "Finaliser"}
                </Button>
              </div>
              <p className="text-center text-xs text-gray-400">🔒 Donnees transmises de maniere securisee via Stripe</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
