import React, { useState } from "react";
import { base44 } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function LeaveReviewModal({ order, onClose }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    await base44.entities.Review.create({
      seller_id: order.seller_id,
      buyer_id: order.buyer_id,
      buyer_name: order.buyer_name,
      order_id: order.id,
      rating,
      comment,
      product_title: order.product_title,
    });
    // Mark order as reviewed
    await base44.entities.Order.update(order.id, { reviewed: true });
    queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer le vendeur</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-gray-600 mb-1">Commande : <span className="font-medium text-gray-900">{order.product_title}</span></p>
            <p className="text-sm text-gray-600">Vendeur : <span className="font-medium text-gray-900">{order.seller_name}</span></p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Votre note *</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {["", "Très mauvais", "Mauvais", "Moyen", "Bien", "Excellent"][rating]}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</p>
            <Textarea
              placeholder="Partagez votre expérience avec ce vendeur..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-24 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || saving}
              className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32]"
            >
              {saving ? "Envoi..." : "Publier l'avis"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}