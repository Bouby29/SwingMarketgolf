import React from "react";
import { Check, Clock, Package, Truck, Home, Star } from "lucide-react";
import { STATUS_CONFIG } from "./OrderStatusBadge";

const STEPS = [
  { key: "pending_validation", label: "Validation vendeur", icon: Clock },
  { key: "preparing",         label: "En préparation",     icon: Package },
  { key: "shipped",           label: "En livraison",       icon: Truck },
  { key: "delivered",         label: "Livré",              icon: Home },
  { key: "completed",         label: "Finalisé",           icon: Star },
];

export default function OrderProgress({ status }) {
  const currentStep = STATUS_CONFIG[status]?.step || 1;
  const isDisputed = status === "disputed";

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep && !isDisputed;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? "bg-[#1B5E20] border-[#1B5E20] text-white" :
                active ? "bg-white border-[#1B5E20] text-[#1B5E20]" :
                         "bg-white border-gray-200 text-gray-300"
              }`}>
                {done ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] text-center w-16 leading-tight ${
                done || active ? "text-gray-700 font-medium" : "text-gray-400"
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? "bg-[#1B5E20]" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}