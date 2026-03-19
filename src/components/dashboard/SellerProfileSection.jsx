import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SellerProfileSection({ user }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mon profil vendeur</h2>
        <p className="text-gray-600">Votre identité publique sur la marketplace</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 rounded-full bg-[#1B5E20] flex items-center justify-center text-white font-bold text-2xl">
            {user?.full_name?.[0] || "U"}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.full_name}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link to={createPageUrl("Profile") + `?id=${user?.id}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <p className="text-sm font-bold text-[#1B5E20]">Voir mon profil public</p>
            <p className="text-xs text-gray-600 mt-1">Comment les clients vous voient</p>
          </Link>
        </div>
      </div>
    </div>
  );
}