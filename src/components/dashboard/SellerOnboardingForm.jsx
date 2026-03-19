import React, { useState } from "react";
import { base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Upload, CreditCard, Shield, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
    { label: "Infos personnelles", icon: User },
    { label: "Pièce d'identité", icon: Upload },
    { label: "Validation", icon: Shield },
];

export default function SellerOnboardingForm({ onComplete }) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        firstName: "", lastName: "", birthDate: "", phone: "",
        addressLine1: "", addressCity: "", addressPostalCode: "",
    });
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [tosAccepted, setTosAccepted] = useState(false);

    const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const goBack = () => { setStep(s => s - 1); setError(""); };

    // Step 0: validate personal info then move on (no backend call yet)
    const submitStep0 = () => {
        const { firstName, lastName, birthDate, phone, addressLine1, addressCity, addressPostalCode } = form;
        if (!firstName || !lastName || !birthDate || !phone || !addressLine1 || !addressCity || !addressPostalCode) {
            setError("Tous les champs sont obligatoires.");
            return;
        }
        setError("");
        setStep(1);
    };

    // Step 1: upload documents + personal info to Stripe, then move to validation
    const submitStep1 = async () => {
        if (!frontFile) { setError("Le document recto est obligatoire."); return; }
        if (!backFile) { setError("Le document verso est obligatoire pour la vérification."); return; }
        setLoading(true);
        setError("");
        try {
            // 1. Upload files to Base44 storage
            const frontUpload = await base44.integrations.Core.UploadFile({ file: frontFile });
            const backUpload = await base44.integrations.Core.UploadFile({ file: backFile });

            // 2. Send to Stripe KYC function
            await base44.functions.invoke("stripeKYCUpload", {
                firstName: form.firstName,
                lastName: form.lastName,
                birthDate: form.birthDate,
                phone: form.phone,
                addressLine1: form.addressLine1,
                addressCity: form.addressCity,
                addressPostalCode: form.addressPostalCode,
                frontUrl: frontUpload.file_url,
                backUrl: backUpload.file_url,
            });
            setStep(2);
        } catch (e) {
            setError(e.response?.data?.error || e.message || "Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: ToS acceptance
    const submitStep2 = async () => {
        if (!tosAccepted) { setError("Vous devez accepter les conditions d'utilisation."); return; }
        setLoading(true);
        setError("");
        try {
            await base44.functions.invoke("stripeOnboarding", { action: "accept_tos" });
            onComplete?.();
        } catch (e) {
            setError(e.response?.data?.error || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-8">
                {STEPS.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                                ${i < step ? 'bg-[#1B5E20] text-white' : i === step ? 'bg-[#1B5E20] text-white ring-4 ring-[#1B5E20]/20' : 'bg-gray-100 text-gray-400'}`}>
                                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs hidden sm:block font-medium ${i === step ? 'text-[#1B5E20]' : i < step ? 'text-gray-500' : 'text-gray-300'}`}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-[#1B5E20]' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Step 0: Personal info + address */}
            {step === 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informations personnelles</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Prénom *</Label>
                            <Input value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} placeholder="Jean" />
                        </div>
                        <div className="space-y-1">
                            <Label>Nom *</Label>
                            <Input value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} placeholder="Dupont" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Date de naissance *</Label>
                        <Input type="date" value={form.birthDate} onChange={e => updateForm('birthDate', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Téléphone *</Label>
                        <Input value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+33 6 12 34 56 78" />
                    </div>
                    <div className="pt-2">
                        <h3 className="font-semibold mb-3">Adresse</h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label>Adresse *</Label>
                                <Input value={form.addressLine1} onChange={e => updateForm('addressLine1', e.target.value)} placeholder="15 rue de la Paix" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Code postal *</Label>
                                    <Input value={form.addressPostalCode} onChange={e => updateForm('addressPostalCode', e.target.value)} placeholder="75001" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Ville *</Label>
                                    <Input value={form.addressCity} onChange={e => updateForm('addressCity', e.target.value)} placeholder="Paris" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button onClick={submitStep0} className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full gap-2 mt-2">
                        Continuer <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Step 1: Document upload */}
            {step === 1 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Pièce d'identité</h3>
                    <p className="text-sm text-gray-500">Carte d'identité, passeport ou permis de conduire. Formats acceptés : JPG, PNG, PDF.</p>
                    <div className="space-y-2">
                        <Label>Recto *</Label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => setFrontFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#1B5E20]/10 file:text-[#1B5E20] hover:file:bg-[#1B5E20]/20 cursor-pointer"
                        />
                        {frontFile && <p className="text-xs text-[#1B5E20]">✓ {frontFile.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Verso *</Label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => setBackFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#1B5E20]/10 file:text-[#1B5E20] hover:file:bg-[#1B5E20]/20 cursor-pointer"
                        />
                        {backFile && <p className="text-xs text-[#1B5E20]">✓ {backFile.name}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button onClick={goBack} variant="outline" className="rounded-full gap-2">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </Button>
                        <Button onClick={submitStep1} disabled={loading} className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full gap-2">
                            {loading ? "Envoi en cours..." : <><span>Continuer</span> <ArrowRight className="w-4 h-4" /></>}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: ToS */}
            {step === 2 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Conditions d'utilisation</h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600 space-y-2">
                        <p>En activant votre compte vendeur, vous acceptez :</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>
                                Les <a href="https://stripe.com/fr/legal/connect-account" target="_blank" rel="noopener noreferrer" className="text-[#1B5E20] underline">Conditions d'utilisation de Stripe Connect</a>
                            </li>
                            <li>Le traitement de vos données personnelles par Stripe pour la gestion des paiements</li>
                            <li>Que SwingMarket transmette vos informations à Stripe pour vérifier votre identité</li>
                        </ul>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={tosAccepted}
                            onChange={e => setTosAccepted(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-[#1B5E20]"
                        />
                        <span className="text-sm text-gray-700">J'accepte les conditions générales de Stripe et j'autorise SwingMarket à soumettre mes informations pour la gestion de mes paiements.</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <Button onClick={goBack} variant="outline" className="rounded-full gap-2">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </Button>
                        <Button
                            onClick={submitStep2}
                            disabled={loading || !tosAccepted}
                            className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full gap-2"
                        >
                            {loading ? "Finalisation..." : <><Shield className="w-4 h-4" /> Activer mon compte vendeur</>}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}