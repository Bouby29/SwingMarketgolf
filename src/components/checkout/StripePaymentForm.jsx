import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield } from "lucide-react";

export default function StripePaymentForm({ onSuccess, processing, setProcessing }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message);
            setProcessing(false);
            return;
        }

        const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (confirmError) {
            setError(confirmError.message);
            setProcessing(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
            )}
            <Button
                type="submit"
                disabled={!stripe || processing}
                size="lg"
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full font-semibold"
            >
                <CreditCard className="w-4 h-4 mr-2" />
                {processing ? "Traitement..." : "Confirmer le paiement"}
            </Button>
            <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <Shield className="w-4 h-4 text-[#1B5E20]" />
                <span>Paiement 100% sécurisé par Stripe</span>
            </div>
        </form>
    );
}