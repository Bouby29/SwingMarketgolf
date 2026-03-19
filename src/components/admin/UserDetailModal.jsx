import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Trash2, Ban, CheckCircle, Mail, Phone, MapPin, Calendar, Package, Bell, BellOff, ExternalLink } from "lucide-react";

function calcAge(birthDate) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function UserDetailModal({ user, open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postal_code: user.postal_code || "",
        birth_date: user.birth_date || "",
        newsletter: user.newsletter || false,
        company_name: user.company_name || "",
      });
    }
  }, [user]);

  const { data: products = [] } = useQuery({
    queryKey: ["user-products", user?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: user.id }),
    enabled: !!user?.id && open,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.User.update(user.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.User.delete(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
  });

  if (!user) return null;

  const age = calcAge(form.birth_date);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 ${user.suspended ? "bg-red-400" : "bg-[#1B5E20]"}`}>
              {user.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">{user.full_name || "Sans nom"}</div>
              <div className="text-xs text-gray-500 font-normal flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user.email}
              </div>
            </div>
            <div className="ml-auto flex gap-1.5 flex-wrap justify-end">
              {user.role === "admin" && <Badge className="bg-[#1B5E20] text-white gap-1 text-xs"><Shield className="w-3 h-3" />Admin</Badge>}
              {user.is_pro && <Badge className="bg-blue-100 text-blue-800 text-xs">Pro</Badge>}
              {user.suspended && <Badge className="bg-red-100 text-red-700 text-xs">⛔ Suspendu</Badge>}
              {user.newsletter && <Badge className="bg-purple-100 text-purple-700 text-xs gap-1"><Bell className="w-3 h-3" />Newsletter</Badge>}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">

          {/* INFOS LECTURE */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Email</div>
                <div className="text-sm font-medium text-gray-800">{user.email}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Téléphone</div>
                <div className="text-sm font-medium text-gray-800">{form.phone || <span className="text-gray-300 italic">Non renseigné</span>}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Adresse</div>
                <div className="text-sm font-medium text-gray-800">
                  {form.address || form.city
                    ? `${form.address ? form.address + ", " : ""}${form.postal_code ? form.postal_code + " " : ""}${form.city}`
                    : <span className="text-gray-300 italic">Non renseignée</span>
                  }
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Âge</div>
                <div className="text-sm font-medium text-gray-800">
                  {age !== null ? `${age} ans` : <span className="text-gray-300 italic">Non renseigné</span>}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Newsletter</div>
                <div className="text-sm font-medium">
                  {form.newsletter
                    ? <span className="text-purple-600 font-semibold">✓ Abonné</span>
                    : <span className="text-gray-400">Non abonné</span>}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Inscrit le</div>
                <div className="text-sm font-medium text-gray-800">
                  {new Date(user.created_date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>

          {/* ANNONCES */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-sm text-gray-700">Ses annonces ({products.length})</span>
            </div>
            {products.length === 0 ? (
              <p className="text-xs text-gray-400 italic px-1">Aucune annonce publiée</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      {p.photos?.[0] && <img src={p.photos[0]} className="w-8 h-8 rounded object-cover" alt="" />}
                      <span className="font-medium text-gray-800 truncate max-w-[180px]">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-[#1B5E20]">{p.price}€</span>
                      <Badge
                        className={`text-xs ${p.status === "active" ? "bg-green-100 text-green-700" : p.status === "sold" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {p.status === "active" ? "Active" : p.status === "sold" ? "Vendue" : p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EDIT FIELDS */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Modifier les informations</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Téléphone</label>
                <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+33 6 ..." className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date de naissance</label>
                <Input type="date" value={form.birth_date} onChange={e => setForm(f => ({...f, birth_date: e.target.value}))} className="text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Adresse</label>
                <Input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Rue, numéro..." className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Code postal</label>
                <Input value={form.postal_code} onChange={e => setForm(f => ({...f, postal_code: e.target.value}))} placeholder="75001" className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Ville</label>
                <Input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Paris" className="text-sm" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={form.newsletter}
                  onChange={e => setForm(f => ({...f, newsletter: e.target.checked}))}
                  className="w-4 h-4 accent-[#1B5E20]"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-700">Abonné à la newsletter</label>
              </div>
            </div>

            <Button
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              className="w-full mt-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>

          {/* ZONE SENSIBLE */}
          {user.role !== "admin" && (
            <div className="border border-red-200 rounded-xl p-4 space-y-3 bg-red-50/40">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Zone sensible</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 gap-2 text-sm font-medium ${user.suspended
                    ? "border-green-400 text-green-700 hover:bg-green-50"
                    : "border-orange-400 text-orange-600 hover:bg-orange-50"}`}
                  onClick={() => updateMutation.mutate({ suspended: !user.suspended })}
                  disabled={updateMutation.isPending}
                >
                  {user.suspended
                    ? <><CheckCircle className="w-4 h-4" /> Réactiver le compte</>
                    : <><Ban className="w-4 h-4" /> Suspendre le compte</>}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-sm font-medium border-red-400 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(`Supprimer définitivement ${user.full_name || user.email} ? Cette action est irréversible.`)) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" /> Supprimer le compte
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}