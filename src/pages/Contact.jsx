import React, { useState } from "react";
import SEOHead from "../components/seo/SEOHead";
import { supabase, entities, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";

const SUBJECTS = [
  "Un problème avec une commande",
  "Un problème avec mon compte",
  "Une question sur la livraison",
  "Signaler un vendeur",
  "Partenariat / Presse",
  "Autre",
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: "contact@swingmarket.fr",
      subject: `[Contact] ${form.subject} — ${form.name}`,
      body: `<p><strong>Nom :</strong> ${form.name}</p><p><strong>Email :</strong> ${form.email}</p><p><strong>Sujet :</strong> ${form.subject}</p><p><strong>Message :</strong></p><p>${form.message.replace(/\n/g, "<br/>")}</p>`,
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SEOHead
        title="Contact | SwingMarket"
        description="Consultez la page Contact de SwingMarket, la marketplace dédiée au golf d'occasion. Notre équipe est disponible pour vous aider."
        url="https://swingmarketgolf.com/Contact"
      />
      {/* Header */}
      <div
        className="relative py-20 px-4 text-center"
        style={{ backgroundImage: "url('https://i0.wp.com/flagstick.com/wp-content/uploads/2023/11/IMG_8286-scaled.jpg?resize=678%2C381&ssl=1')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-3">Contactez-nous</h1>
          <p className="text-gray-200 text-lg">Une question ? Notre équipe est là pour vous aider.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* FAQ banner */}
        <div className="flex items-start gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl mb-8">
          <Info className="w-5 h-5 text-[#1B5E20] mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700">
            Avant de nous contacter, consultez notre{" "}
            <Link to="/FAQ" className="font-semibold text-[#1B5E20] hover:underline">FAQ</Link>{" "}
            qui répond aux questions les plus fréquentes sur les achats, ventes et la protection{" "}
            <span className="font-semibold">SwingMarket Safety</span>.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <CheckCircle className="w-16 h-16 text-[#1B5E20] mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Message envoyé !</h2>
              <p className="text-gray-500">Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.</p>
              <Button
                className="mt-6 bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full"
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              >
                Envoyer un autre message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Sujet</Label>
                <Select value={form.subject} onValueChange={v => setForm({ ...form, subject: v })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un sujet" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Décrivez votre demande..."
                  className="h-36 resize-none"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !form.subject}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full h-11 text-base font-semibold"
              >
                {loading ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}