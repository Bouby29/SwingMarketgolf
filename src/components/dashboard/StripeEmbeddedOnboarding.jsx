import React, { useEffect, useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { base44 } from "@/lib/supabase";

export default function StripeEmbeddedOnboarding({ onComplete }) {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      const response = await base44.functions.invoke("stripeAccountSession");
      return response.data.client_secret;
    };

    const instance = loadConnectAndInitialize({
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      fetchClientSecret,
      appearance: {
        variables: {
          colorPrimary: "#1B5E20",
          colorBackground: "#ffffff",
          colorText: "#1a1a1a",
          borderRadius: "12px",
        },
      },
    });

    setStripeConnectInstance(instance);
  }, []);

  if (!stripeConnectInstance) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#1B5E20] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <ConnectAccountOnboarding onExit={onComplete} />
    </ConnectComponentsProvider>
  );
}