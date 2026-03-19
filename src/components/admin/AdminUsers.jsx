import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Ban, Trash2, ChevronRight } from "lucide-react";
import UserDetailModal from "./UserDetailModal";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const newThisWeek = users.filter(u => {
    const d = new Date(u.created_date);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-xs text-gray-500">Total utilisateurs</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-green-600">{newThisWeek}</div>
          <div className="text-xs text-gray-500">Nouveaux cette semaine</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-red-500">{users.filter(u => u.suspended).length}</div>
          <div className="text-xs text-gray-500">Comptes suspendus</div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge className="self-center bg-blue-50 text-blue-700 border border-blue-100">{filtered.length} utilisateurs</Badge>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Utilisateur</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Rôle / Statut</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Inscription</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
              : filtered.map(user => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 cursor-pointer ${user.suspended ? "bg-red-50/40" : ""}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${user.suspended ? "bg-red-400" : "bg-[#1B5E20]"}`}>
                        {user.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-gray-900">{user.full_name || "Sans nom"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {user.role === "admin" ? (
                        <Badge className="bg-[#1B5E20] text-white gap-1 text-xs"><Shield className="w-3 h-3" /> Admin</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Utilisateur</Badge>
                      )}
                      {user.suspended && <Badge className="bg-red-100 text-red-700 text-xs gap-1"><Ban className="w-3 h-3" /> Suspendu</Badge>}
                      {user.is_pro && <Badge className="bg-blue-100 text-blue-700 text-xs">Pro</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(user.created_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end items-center gap-1" onClick={e => e.stopPropagation()}>
                      {user.role !== "admin" && (
                        <>
                          <Button
                            variant="ghost" size="sm"
                            title={user.suspended ? "Réactiver" : "Suspendre"}
                            className={user.suspended ? "text-green-600 hover:bg-green-50" : "text-orange-500 hover:bg-orange-50"}
                            onClick={() => updateMutation.mutate({ id: user.id, data: { suspended: !user.suspended } })}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => { if (confirm(`Supprimer ${user.full_name || user.email} ?`)) deleteMutation.mutate(user.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Aucun utilisateur trouvé</div>
        )}
      </div>

      <UserDetailModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}