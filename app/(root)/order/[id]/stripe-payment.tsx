import { Button } from "@/components/ui/button";
import { SERVER_URL } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { useTheme } from "next-themes";
import { FormEvent, useState } from "react";

const StripePayment = ({
  priceInCents,
  orderId,
  clientSecret,
}: {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
}) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
  );
  const { theme, systemTheme } = useTheme();

  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [email, setEmail] = useState<string>();

    async function handleSubmit(e: FormEvent) {
      e.preventDefault();
      if (stripe === null || elements === null || email === null) {
        return;
      }
      setIsLoading(true);
      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          console.log("aaaa error", error);
          if (
            error?.type === "card_error" ||
            error?.type === "validation_error"
          ) {
            setErrorMessage(error?.message ?? "1an unknown error occured.");
          } else if (error) {
            setErrorMessage("2an unknown error occured.");
          }
        })
        .finally(() => setIsLoading(false));
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-xl">Stripe Checkout</div>
        {errorMessage && <div className="text-destructive">{errorMessage}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading
            ? "Purchasing..."
            : `Purchase - ${formatCurrency(priceInCents / 100)}`}
        </Button>
      </form>
    );
  };

  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme:
            theme === "dark"
              ? "night"
              : theme === "light"
                ? "stripe"
                : systemTheme === "light"
                  ? "stripe"
                  : "night",
        },
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;
