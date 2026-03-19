import React from "react";
import { ChevronLeft } from "lucide-react";

export default function MobileHeader({ title, showBack = true }) {
  return (
    <div className="md:hidden sticky top-0 bg-white border-b border-gray-100 mobile-safe-top z-40">
      <div className="flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 text-gray-600 hover:text-[#1B5E20] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="flex-1 text-base font-semibold text-gray-900 text-center -ml-10">
          {title}
        </h1>
        <div className="w-10"></div>
      </div>
    </div>
  );
}