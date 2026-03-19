import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Shield, RefreshCw } from "lucide-react";
import StripeEmbeddedOnboarding from "./StripeEmbeddedOnboarding";

export default function StripeKYCSection({ user }) {
    const [status, setStatus] = useState(user?.stripe_kyc_status || "not_connected");
    const [showForm, setShowForm] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (user?.stripe_account_id) {
            checkStatus();
        }
    }, []);

    const checkStatus = async () => {
        setChecking(true);
        try {
            const res = await base44.functions.invoke("stripeOnboarding", { action: "status" });
            setStatus(res.data.status || "not_connected");
        } finally {
            setChecking(false);
        }
    };

    const handleFormComplete = async () => {
        setShowForm(false);
        await checkStatus();
    };

    if (status === "verified") {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-[#1B5E20]" />
                    <h2 className="text-xl font-bold">Vérification d'identité</h2>
                </div>
                <div className="rounded-xl border bg-green-50 border-green-200 p-6">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-10 h-10 text-[#1B5E20] shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Identité vérifiée ✓</h3>
                            <p className="text-sm text-gray-600">Votre compte est actif. Vous recevrez vos paiements automatiquement après chaque vente confirmée.</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">🔒 Vos données sont sécurisées et traitées par Stripe (PCI-DSS niveau 1).</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-[#1B5E20]" />
                <h2 className="text-xl font-bold">Vérification d'identité</h2>
            </div>

            {!showForm ? (
                <>
                    <div className={`rounded-xl border p-6 mb-6 ${status === "pending" ? "bg-yellow-50 border-yellow-200" : "bg-orange-50 border-orange-200"}`}>
                        <div className="flex items-start gap-4">
                            {status === "pending"
                                ? <Clock className="w-10 h-10 text-yellow-500 shrink-0" />
                                : <AlertCircle className="w-10 h-10 text-orange-400 shrink-0" />
                            }
                            <div>
                                <h3 className="font-bold text-lg mb-1">
                                    {status === "pending" ? "Vérification en cours" : "Vérification requise"}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {status === "pending"
                                        ? "Votre dossier est en cours d'examen par Stripe. Vous pouvez compléter vos informations si nécessaire."
                                        : "Pour recevoir vos paiements, vérifiez votre identité directement ici. Il vous faudra une pièce d'identité et votre IBAN."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <Button onClick={() => setShowForm(true)} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full gap-2">
                            <Shield className="w-4 h-4" />
                            {status === "pending" ? "Compléter mon dossier" : "Vérifier mon identité"}
                        </Button>
                        {status === "pending" && (
                            <Button onClick={checkStatus} disabled={checking} variant="outline" className="rounded-full gap-2">
                                <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
                                Actualiser
                            </Button>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t space-y-2">
                        <p className="text-xs font-medium text-gray-600">Documents acceptés :</p>
                        <div className="flex gap-2 flex-wrap">
                            {["Carte d'identité", "Passeport", "Permis de conduire"].map(doc => (
                                <span key={doc} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{doc}</span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3">🔒 Vos données sont sécurisées et traitées par Stripe (PCI-DSS niveau 1).</p>
                    </div>
                </>
            ) : (
                <div>
                    <StripeEmbeddedOnboarding onComplete={handleFormComplete} />
                    <Button onClick={() => setShowForm(false)} variant="outline" className="mt-6 rounded-full text-sm">
                        ← Annuler
                    </Button>
                </div>
            )}
        </div>
    );
}