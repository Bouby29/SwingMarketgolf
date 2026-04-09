import React, { useState } from "react";
import { supabase, entities, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User, Building2, X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { generateEmailHTML, getEmailSubject } from "../email/EmailTemplate";

function validateName(val) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ.\s]+$/.test(val.trim()) && val.trim().length > 0;
}

function validateDate(val) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(val)) return false;
  const [, d, m, y] = val.match(regex);
  const date = new Date(`${y}-${m}-${d}`);
  if (isNaN(date)) return false;
  const now = new Date();
  const age = now.getFullYear() - date.getFullYear() -
    (now.getMonth() < date.getMonth() - 1 || (now.getMonth() === date.getMonth() - 1 && now.getDate() < parseInt(d)) ? 1 : 0);
  return age >= 18;
}

export default function RegisterModal({ open, onClose, redirectAfter }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    birthDate: "", sellerType: "particulier",
    acceptCGU: false, newsletter: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!validateName(form.firstName)) errs.firstName = "Seules les lettres et le point (.) sont autorisés.";
    if (!validateName(form.lastName)) errs.lastName = "Seules les lettres et le point (.) sont autorisés.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Adresse e-mail invalide.";
    if (!form.password || form.password.length < 8) errs.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(form.password)) errs.password = "Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial.";
    if (!form.birthDate) errs.birthDate = "Date de naissance requise.";
    else if (!validateDate(form.birthDate)) errs.birthDate = "Vous devez être majeur(e) (18 ans et plus). Format : jj/mm/aaaa";
    if (!form.acceptCGU) errs.acceptCGU = "Vous devez accepter les conditions générales.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      // Save extra profile data after auth
       const { data: { session } } = await supabase.auth.getSession();
       const user = session?.user || null;
      await auth.updateMe({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        birth_date: form.birthDate,
        seller_type: form.sellerType,
        newsletter: form.newsletter,
        setup_complete: true,
      });

      // Send signup confirmation email
      try {
        const subject = getEmailSubject("signup_confirmation", { firstName: form.firstName.trim() });
        const htmlContent = generateEmailHTML("signup_confirmation", { firstName: form.firstName.trim() });
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: subject,
          body: htmlContent
        });
        await entities.EmailHistory.create({
          user_email: user.email,
          user_name: user.full_name || form.firstName.trim(),
          email_type: "signup_confirmation",
          subject: subject,
          content: htmlContent,
          status: "sent",
          metadata: { firstName: form.firstName.trim() }
        });
      } catch (err) {
        console.error("Failed to send signup email:", err);
      }

      onClose();
      if (redirectAfter) window.location.href = redirectAfter;
    } catch (err) {
      setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
    }
    setSubmitting(false);
  };

  const handleLoginRedirect = () => {
    onClose();
    base44.auth.redirectToLogin(redirectAfter || window.location.href);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <div className="golf-gradient p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                Rejoindre SwingMarket
              </DialogTitle>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-green-200 text-sm mt-2">Créez votre compte pour publier une annonce</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Type de vendeur */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Je m'inscris en tant que <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set("sellerType", "particulier")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-left ${form.sellerType === "particulier" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.sellerType === "particulier" ? "bg-[#1B5E20]" : "bg-gray-100"}`}>
                  <User className={`w-5 h-5 ${form.sellerType === "particulier" ? "text-white" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">Particulier</p>
                  <p className="text-xs text-gray-500 mt-0.5">Vente occasionnelle de matériel personnel</p>
                </div>
                {form.sellerType === "particulier" && (
                  <div className="w-4 h-4 rounded-full bg-[#1B5E20] flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => set("sellerType", "professionnel")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-left ${form.sellerType === "professionnel" ? "border-[#C5A028] bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.sellerType === "professionnel" ? "bg-[#C5A028]" : "bg-gray-100"}`}>
                  <Building2 className={`w-5 h-5 ${form.sellerType === "professionnel" ? "text-white" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">Professionnel</p>
                  <p className="text-xs text-gray-500 mt-0.5">Boutique, revendeur ou commerce de golf</p>
                </div>
                {form.sellerType === "professionnel" && (
                  <div className="w-4 h-4 rounded-full bg-[#C5A028] flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
                placeholder="Jean"
                className={`mt-1 ${errors.firstName ? "border-red-400" : ""}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              <p className="text-[10px] text-gray-400 mt-0.5">Seules les lettres et le point (.), suivi d'un espace, sont autorisés.</p>
            </div>
            <div>
              <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={e => set("lastName", e.target.value)}
                placeholder="Dupont"
                className={`mt-1 ${errors.lastName ? "border-red-400" : ""}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              <p className="text-[10px] text-gray-400 mt-0.5">Seules les lettres et le point (.), suivi d'un espace, sont autorisés.</p>
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              placeholder="jean.dupont@email.com"
              className={`mt-1 ${errors.email ? "border-red-400" : ""}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <Label htmlFor="password">Mot de passe <span className="text-red-500">*</span></Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                placeholder="Min. 8 caractères"
                className={`pr-10 ${errors.password ? "border-red-400" : ""}`}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Date de naissance */}
          <div>
            <Label htmlFor="birthDate">Date de naissance <span className="text-red-500">*</span></Label>
            <Input
              id="birthDate"
              value={form.birthDate}
              onChange={e => {
                let val = e.target.value.replace(/[^0-9/]/g, "");
                if (val.length === 2 && !val.includes("/")) val += "/";
                if (val.length === 5 && val.split("/").length === 2) val += "/";
                if (val.length > 10) val = val.slice(0, 10);
                set("birthDate", val);
              }}
              placeholder="jj/mm/aaaa"
              maxLength={10}
              className={`mt-1 ${errors.birthDate ? "border-red-400" : ""}`}
            />
            <p className="text-[10px] text-gray-400 mt-0.5">jj/mm/aaaa — Ex. : 31/05/1970</p>
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>

          {/* CGU */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptCGU"
                checked={form.acceptCGU}
                onCheckedChange={v => set("acceptCGU", v)}
                className={errors.acceptCGU ? "border-red-400" : ""}
              />
              <label htmlFor="acceptCGU" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                J'ai lu et j'accepte les{" "}
                <a href="/CGU" target="_blank" className="text-[#1B5E20] font-medium hover:underline">conditions générales d'utilisation</a>
                {" "}et la{" "}
                <a href="/Confidentialite" target="_blank" className="text-[#1B5E20] font-medium hover:underline">politique de confidentialité</a>.
                <span className="text-red-500"> *</span>
              </label>
            </div>
            {errors.acceptCGU && <p className="text-red-500 text-xs">{errors.acceptCGU}</p>}

            {/* Newsletter */}
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <Checkbox
                id="newsletter"
                checked={form.newsletter}
                onCheckedChange={v => set("newsletter", v)}
              />
              <div>
                <label htmlFor="newsletter" className="text-sm font-medium text-gray-800 cursor-pointer">
                  Recevoir notre newsletter
                </label>
                <p className="text-xs text-gray-500 mt-0.5">Rejoignez notre communauté et recevez notre actualité golf : nouvelles annonces, conseils, guides et bons plans.</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full font-semibold py-3"
          >
            {submitting ? "Création du compte..." : "Créer mon compte"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-500 bg-white px-2">Déjà inscrit(e) ?</div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleLoginRedirect}
            className="w-full rounded-full border-[#1B5E20] text-[#1B5E20] hover:bg-green-50"
          >
            Se connecter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}