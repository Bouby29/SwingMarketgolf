import React, { useState, useEffect } from "react";
import { supabase as base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function AccountInfoSection({ user, onUserUpdate }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    newPassword: "",
    birthDate: user?.birthDate || "",
    newsletter: user?.newsletter || false,
    address: user?.address || "",
    postal_code: user?.postal_code || "",
    city: user?.city || "",
    phone: user?.phone || "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync formData when user prop changes (e.g. after parent refresh)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || "",
        birthDate: user.birthDate || "",
        newsletter: user.newsletter || false,
        address: user.address || "",
        postal_code: user.postal_code || "",
        city: user.city || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    setPasswordStrength(strength);
    return strength >= 4;
  };

  const [nameError, setNameError] = useState("");

  const validateName = (value) => {
    if (!/^[a-zA-Z.\s]*$/.test(value)) {
      setNameError("Seules les lettres et le point (.), suivi d'un espace, sont autorisés.");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateName(formData.full_name)) return;
    
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await base44.auth.updateMe({
        full_name: formData.full_name,
        birthDate: formData.birthDate,
        newsletter: formData.newsletter,
        address: formData.address,
        postal_code: formData.postal_code,
        city: formData.city,
        phone: formData.phone,
      });
      setSuccessMsg("Informations mises à jour avec succès !");
      if (onUserUpdate) await onUserUpdate();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Erreur lors de la sauvegarde. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations personnelles</h2>
        <p className="text-gray-600">Gérez vos informations de compte</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Prénom</label>
          <Input
            value={formData.full_name.split(" ")[0] || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              if (validateName(newValue)) {
                setFormData({ ...formData, full_name: newValue });
              }
            }}
            placeholder="Prénom"
            className="rounded-lg"
          />
          {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Nom</label>
          <Input
            value={formData.full_name.split(" ").slice(1).join(" ") || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              if (validateName(newValue)) {
                setFormData({ ...formData, full_name: `${formData.full_name.split(" ")[0]} ${newValue}` });
              }
            }}
            placeholder="Nom"
            className="rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">E-mail</label>
          <Input value={user?.email || ""} disabled className="rounded-lg bg-gray-50" />
          <p className="text-xs text-gray-500 mt-1">Vous ne pouvez pas modifier votre email</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Téléphone</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Ex. : 06 12 34 56 78"
            className="rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Adresse</label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Numéro et nom de rue"
            className="rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Code postal</label>
            <Input
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="75001"
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Ville</label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Paris"
              className="rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Mot de passe</label>
          <Input type="password" placeholder="••••••••" disabled className="rounded-lg bg-gray-50" />
          <p className="text-xs text-gray-500 mt-1">Mot de passe masqué pour la sécurité</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Nouveau mot de passe (Optionnel)</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={(e) => {
              setFormData({ ...formData, newPassword: e.target.value });
              if (e.target.value) checkPasswordStrength(e.target.value);
            }}
            className="rounded-lg"
          />
          {formData.newPassword && (
            <div className="mt-2 space-y-1 text-xs">
              <div className={`flex items-center gap-2 ${formData.newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                {formData.newPassword.length >= 8 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                8 caractères minimum
              </div>
              <div className={`flex items-center gap-2 ${/[a-z]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                {/[a-z]/.test(formData.newPassword) ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                1 minuscule
              </div>
              <div className={`flex items-center gap-2 ${/[A-Z]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                {/[A-Z]/.test(formData.newPassword) ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                1 majuscule
              </div>
              <div className={`flex items-center gap-2 ${/\d/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                {/\d/.test(formData.newPassword) ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                1 chiffre
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength >= 4 ? "text-green-600" : "text-gray-500"}`}>
                {passwordStrength >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                Score minimum: Fort
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Date de naissance (Optionnel)</label>
          <Input
            type="text"
            placeholder="Ex. : 31/05/1970"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-3 border-t pt-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox className="mt-1" />
            <span className="text-sm">J'ai lu et j'accepte les conditions générales et la politique de confidentialité</span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox className="mt-1" checked={formData.newsletter} onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })} />
            <span className="text-sm">Recevoir notre newsletter - Rejoignez notre communauté et recevez notre actualité.</span>
          </label>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <Button type="submit" disabled={loading} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full">
          {loading ? "Mise à jour..." : "Enregistrer les modifications"}
        </Button>
      </form>

      {/* Account Deletion Section */}
      <div className="mt-8 pt-6 border-t border-red-100">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Zone dangereuse</h3>
        <p className="text-sm text-gray-600 mb-4">
          La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
        </p>
        <AccountDeletionButton user={user} />
      </div>
    </div>
  );
}

function AccountDeletionButton({ user }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "SUPPRIMER") return;
    
    setDeleting(true);
    try {
      await base44.entities.User.delete(user.id);
      await window.location.href='/';
    } catch (err) {
      alert("Erreur lors de la suppression du compte");
      setDeleting(false);
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowConfirm(true)}
        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full"
      >
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
      <p className="text-sm font-medium text-red-800">
        Pour confirmer, tapez <span className="font-bold">SUPPRIMER</span> ci-dessous :
      </p>
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="SUPPRIMER"
        className="border-red-300 focus:border-red-500 focus:ring-red-500"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowConfirm(false);
            setConfirmText("");
          }}
          className="flex-1 rounded-full"
        >
          Annuler
        </Button>
        <Button
          onClick={handleDelete}
          disabled={confirmText !== "SUPPRIMER" || deleting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
        >
          {deleting ? "Suppression..." : "Confirmer la suppression"}
        </Button>
      </div>
    </div>
  );
}