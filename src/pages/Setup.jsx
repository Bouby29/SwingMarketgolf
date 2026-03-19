import React, { useState, useEffect } from "react";
import { supabase as base44 } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Building2, ArrowRight } from "lucide-react";

export default function Setup() {
  const [step, setStep] = useState(1);
  const [sellerType, setSellerType] = useState("particulier");
  const [form, setForm] = useState({
    company_name: "", siret: "", company_address: "",
    professional_email: "", phone: "", country: "France", bio: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await Promise.resolve(true);
      if (!auth) { base44.auth.redirectToLogin(); return; }
      const me = await Promise.resolve(null);
      if (me.setup_complete) {
        window.location.href = createPageUrl("Home");
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    const data = {
      seller_type: sellerType,
      setup_complete: true,
      bio: form.bio,
      phone: form.phone,
      country: form.country,
    };
    if (sellerType === "professionnel") {
      data.company_name = form.company_name;
      data.siret = form.siret;
      data.company_address = form.company_address;
      data.professional_email = form.professional_email;
    }
    await base44.auth.updateMe(data);
    window.location.href = createPageUrl("Home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0A1F0C 0%, #1B5E20 50%, #2E7D32 100%)" }}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full golf-gradient flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Bienvenue sur <span className="text-green-300">Swing</span><span className="text-[#C5A028]">Market</span>
          </h1>
          <p className="text-white/70 text-sm mt-1">Configurez votre profil vendeur</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-lg">Type de compte</h2>
              <RadioGroup value={sellerType} onValueChange={setSellerType} className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${sellerType === "particulier" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <RadioGroupItem value="particulier" id="particulier" />
                  <User className="w-5 h-5 text-[#1B5E20]" />
                  <div>
                    <p className="font-medium">Vendeur particulier</p>
                    <p className="text-xs text-gray-500">Vendez votre matériel personnel</p>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${sellerType === "professionnel" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <RadioGroupItem value="professionnel" id="professionnel" />
                  <Building2 className="w-5 h-5 text-[#C5A028]" />
                  <div>
                    <p className="font-medium">Vendeur professionnel</p>
                    <p className="text-xs text-gray-500">Boutique, pro shop, marque...</p>
                  </div>
                </label>
              </RadioGroup>
              <Button onClick={() => setStep(2)} className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">
                {sellerType === "professionnel" ? "Informations professionnelles" : "Votre profil"}
              </h2>

              {sellerType === "professionnel" && (
                <>
                  <div>
                    <Label>Nom de la société *</Label>
                    <Input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <Label>Numéro SIRET *</Label>
                    <Input value={form.siret} onChange={e => setForm({...form, siret: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <Label>Adresse de la société *</Label>
                    <Input value={form.company_address} onChange={e => setForm({...form, company_address: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <Label>Email professionnel *</Label>
                    <Input type="email" value={form.professional_email} onChange={e => setForm({...form, professional_email: e.target.value})} className="mt-1" />
                  </div>
                </>
              )}

              <div>
                <Label>Téléphone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Pays</Label>
                <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Bio / Description</Label>
                <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Parlez de vous..." className="mt-1" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">Retour</Button>
                <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">
                  {saving ? "Enregistrement..." : "Terminer"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}