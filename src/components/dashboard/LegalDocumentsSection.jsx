import React, { useState, useRef } from "react";
import { base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, CheckCircle2, Clock, X, FileText } from "lucide-react";

export default function LegalDocumentsSection({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.full_name?.split(" ")[0] || "",
    lastName: user?.full_name?.split(" ").slice(1).join(" ") || "",
    birthDate: user?.birth_date || "",
    phone: user?.phone || "",
  });
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(user?.stripe_kyc_status || "not_submitted");
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");

  const frontRef = useRef();
  const backRef = useRef();


  const handleFileSelect = (file, setFile) => {
    if (!file) {
      console.log("Aucun fichier sélectionné");
      return;
    }
    
    console.log("Fichier reçu:", file.name, file.type, file.size);
    
    const isValidType = file.type.startsWith("image/") || file.type === "application/pdf";
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
    
    if (!isValidType) {
      setFileError("Format non supporté. Utilisez JPG, PNG ou PDF.");
      return;
    }
    
    if (!isValidSize) {
      setFileError("Fichier trop volumineux. Max 10MB.");
      return;
    }
    
    setFileError("");
    setFile(file);
    console.log("Fichier accepté:", file.name);
  };

  const handleDrop = (e, setFile) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file, setFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!frontFile) { 
      setError("Veuillez déposer le recto de votre document."); 
      return; 
    }
    if (!backFile) { 
      setError("Veuillez déposer le verso de votre document."); 
      return; 
    }
    
    setError("");
    setLoading(true);

    try {
      // Upload front file
      const frontUpload = await base44.integrations.Core.UploadFile({ file: frontFile });
      const frontUrl = frontUpload?.file_url || frontUpload?.url;
      if (!frontUrl) throw new Error(`Upload recto échoué (réponse: ${JSON.stringify(frontUpload)})`);

      // Upload back file
      const backUpload = await base44.integrations.Core.UploadFile({ file: backFile });
      const backUrl = backUpload?.file_url || backUpload?.url;
      if (!backUrl) throw new Error(`Upload verso échoué (réponse: ${JSON.stringify(backUpload)})`);

      const res = await base44.functions.invoke("stripeKYCUpload", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        phone: formData.phone,
        frontUrl,
        backUrl
      });
      
      if (res.data?.success) {
        setStatus("pending");
      } else {
        setError(res.data?.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "verified") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes documents légaux</h2>
          <p className="text-gray-600">Vos justificatifs d'identité</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-6 flex items-start gap-4">
          <CheckCircle2 className="w-10 h-10 text-[#1B5E20] shrink-0" />
          <div>
            <p className="font-bold text-lg">Identité vérifiée ✓</p>
            <p className="text-sm text-gray-600 mt-1">Vos documents ont été validés. Vous pouvez recevoir vos paiements.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes documents légaux</h2>
          <p className="text-gray-600">Vos justificatifs d'identité</p>
        </div>
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-6 flex items-start gap-4">
          <Clock className="w-10 h-10 text-yellow-500 shrink-0" />
          <div>
            <p className="font-bold text-lg">Vérification en cours</p>
            <p className="text-sm text-gray-600 mt-1">Vos documents ont bien été envoyés. La vérification peut prendre quelques minutes à quelques heures.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes documents légaux</h2>
        <p className="text-gray-600">Envoyez vos justificatifs d'identité pour la vérification KYC</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Conseils pour une validation rapide :</p>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>Document en couleur, non expiré</li>
            <li>Tous les bords visibles, photo nette</li>
            <li>Pas de reflet ni de flash</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Prénom (sur le document)</label>
            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Prénom" className="rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Nom (sur le document)</label>
            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Nom" className="rounded-lg" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Date de naissance</label>
            <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Téléphone</label>
            <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+33 6 12 34 56 78" className="rounded-lg" />
          </div>
        </div>

        {/* Front */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Recto <span className="text-red-500">*</span></label>
          <div
            onClick={() => frontRef.current?.click()}
            onDrop={(e) => handleDrop(e, setFrontFile)}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${frontFile ? "border-[#1B5E20] bg-green-50" : "border-gray-300 hover:border-[#1B5E20]"}`}
          >
            {frontFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-6 h-6 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#1B5E20]">{frontFile.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFrontFile(null); }} className="hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Cliquez ou déposez un fichier</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF – Max 10MB</p>
              </>
            )}
          </div>
          <input ref={frontRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0], setFrontFile)} />
        </div>

        {/* Back */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Verso <span className="text-red-500">*</span></label>
          <div
            onClick={() => backRef.current?.click()}
            onDrop={(e) => handleDrop(e, setBackFile)}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${backFile ? "border-[#1B5E20] bg-green-50" : "border-gray-300 hover:border-[#1B5E20]"}`}
          >
            {backFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-6 h-6 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#1B5E20]">{backFile.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setBackFile(null); }} className="hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Cliquez ou déposez un fichier</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF – Max 10MB</p>
              </>
            )}
          </div>
          <input ref={backRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0], setBackFile)} />
        </div>


        {(error || fileError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error || fileError}</div>
        )}

        <Button type="submit" disabled={loading} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full">
          {loading ? "Envoi en cours..." : "Envoyer mes documents"}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          🔒 Vos documents sont transmis de manière sécurisée et traités par Stripe (PCI-DSS niveau 1).
        </p>
      </form>
    </div>
  );
}