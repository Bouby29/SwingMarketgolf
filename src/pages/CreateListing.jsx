import React, { useState, useEffect } from "react";
import { useEmailService } from "../components/email/useEmailService";
import { supabase, entities } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RegisterModal from "../components/auth/RegisterModal";
import CategorySelector from "../components/listing/CategorySelector";
import GeneralInfoStep from "../components/listing/GeneralInfoStep";
import DynamicFieldsStep from "../components/listing/DynamicFieldsStep";
import PhotosStep from "../components/listing/PhotosStep";
import ReviewStep from "../components/listing/ReviewStep";

export default function CreateListing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);

  const [form, setForm] = useState({
    title: "", description: "", price: "", retail_price: "",
    condition: "", brand: "", category: "", package_size: "",
    photos: [], shipping_carrier: "mondial_relay", specs: {},
    sale_type: "fixed", auction_duration: "7"
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthChecked(true);
      if (!session?.user) {
        navigate("/Login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", session.user.id).single();
      setUser(profile || session.user);
    };
    init();
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const isAuction = form.sale_type === 'auction';
      const auctionDays = parseInt(form.auction_duration || '7');
      const auctionEndDate = isAuction
        ? new Date(Date.now() + auctionDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const productData = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        retail_price: form.retail_price ? parseFloat(form.retail_price) : null,
        condition: form.condition,
        brand: form.brand,
        category: form.category,
        package_size: form.package_size,
        images: form.photos,
        specs: form.specs && Object.keys(form.specs).length > 0 ? form.specs : null,
        seller_id: user.id,
        status: "active",
        views_count: 0,
        favorites_count: 0,
        sale_type: form.sale_type || 'fixed',
        auction_end_date: auctionEndDate,
      };

      const { data, error } = await supabase.from("products").insert(productData).select().single();
      if (error) throw error;
      setCreatedProductId(data.id);
      setPublished(true);
      // Email confirmation annonce publiée (hors try/catch)
      try {
        const authResp = await supabase.auth.getUser();
        const currentUser = authResp.data?.user;
        console.log("EMAIL DEBUG - currentUser:", currentUser?.id);
        if (currentUser) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
          console.log("EMAIL DEBUG - profile:", profile?.email);
          if (profile) sendListingPublished(profile, data);
        }
      } catch (emailErr) {
        console.error("EMAIL ERROR:", emailErr);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la publication : " + error.message);
    }
    setSaving(false);
  };


  const { sendListingPublished } = useEmailService();

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return !!form.category;
      case 1: return form.title && form.brand && form.description && form.price && form.condition && form.package_size;
      case 2: return true;
      case 3: return form.photos.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  if (!authChecked) return <div className="max-w-3xl mx-auto px-4 py-8">Chargement...</div>;

  if (published) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-[#1B5E20]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Votre annonce est en ligne !</h1>
        <p className="text-gray-500 mb-10">Votre matériel est désormais visible par tous les golfeurs sur SwingMarket.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => { setForm({ title: "", description: "", price: "", retail_price: "", condition: "", brand: "", category: "", package_size: "", photos: [], specs: {}, sale_type: "fixed", auction_duration: "7" }); setCurrentStep(0); setPublished(false); setCreatedProductId(null); }}
            variant="outline" className="rounded-full font-semibold border-[#1B5E20] text-[#1B5E20] hover:bg-green-50">
            Poster une autre annonce
          </Button>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="rounded-full font-semibold bg-[#1B5E20] hover:bg-[#2E7D32] w-full">Voir mes annonces</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <RegisterModal open={true}
        onClose={() => window.location.href = createPageUrl("Login")}
        redirectAfter={createPageUrl("CreateListing")} />
    );
  }

  const steps = [
    { title: "Catégorie", component: <CategorySelector value={form.category} onChange={v => setForm({...form, category: v})} /> },
    { title: "Informations", component: <GeneralInfoStep form={form} onChange={setForm} /> },
    { title: "Caractéristiques", component: <DynamicFieldsStep category={form.category} form={form} onChange={setForm} /> },
    { title: "Photos", component: <PhotosStep photos={form.photos} onPhotosChange={photos => setForm({...form, photos})} /> },
    { title: "Résumé", component: <ReviewStep form={form} category={form.category} /> }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer une annonce</h1>
      <p className="text-gray-500 text-sm mb-8">Vendez votre matériel de golf en quelques minutes</p>
      <div className="flex gap-2 mb-8">
        {steps.map((step, idx) => (
          <div key={idx} className="flex-1">
            <div className={`h-1 rounded-full transition-all ${idx <= currentStep ? "bg-[#1B5E20]" : "bg-gray-200"}`} />
            <p className="text-xs text-gray-500 mt-2 text-center">{step.title}</p>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {steps[currentStep].component}
        <div className="flex gap-3 pt-6">
          <Button type="button" variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Précédent
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button type="button" disabled={!isStepValid()}
              onClick={() => setCurrentStep(currentStep + 1)}
              className="ml-auto flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32]">
              Suivant <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="button" disabled={saving || !isStepValid()} onClick={handleSubmit}
              className="ml-auto bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full font-semibold">
              {saving ? "Publication..." : "Publier l'annonce"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}