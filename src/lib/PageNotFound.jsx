import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full golf-gradient flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl font-bold">4</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-8">Cette page n'existe pas ou a été déplacée.</p>
        <Link to={createPageUrl("Home")}>
          <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full gap-2">
            <Home className="w-4 h-4" /> Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}