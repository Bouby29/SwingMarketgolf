import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9998] animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm md:text-base text-gray-700">
            Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. 
            En acceptant, vous consentez à notre politique de confidentialité.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="flex-1 md:flex-none rounded-lg border-gray-300"
          >
            Refuser
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-[#1B5E20] hover:bg-[#2E7D32] rounded-lg"
          >
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}