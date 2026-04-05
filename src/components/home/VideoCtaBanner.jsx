import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

export default function VideoCtaBanner() {
  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      <video
        src="https://pnhiuifejnnklbfpjmdr.supabase.co/storage/v1/object/public/products/13671387-hd_2048_1080_30fps.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
          Ne laissez pas votre<br />équipement dormir
        </h2>
        <p className="text-white/75 text-lg mb-8 max-w-xl">
          Donnez une seconde vie à votre matériel et gagnez de l'argent en quelques clics.
        </p>
        <Link to={createPageUrl("CreateListing")}>
          <button className="bg-[#C5A028] hover:bg-[#D4AF37] text-white font-bold rounded-full px-10 py-4 text-base flex items-center gap-2 transition-all shadow-xl hover:scale-105">
            Vendez maintenant <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
