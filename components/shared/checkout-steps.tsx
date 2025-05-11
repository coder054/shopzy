import { cn } from "@/lib/utils";
import { Fragment } from "react";

export default function CheckoutSteps({ current = 0 }) {
  return (
    <div className="flex-between flex-col md:flex-row space-x-2 space-y-2 mb-10 ">
      {["User login", "Shipping address", "Payment method", "Place order"].map(
        (step, index) => {
          return (
            <Fragment key={step}>
              <div
                className={cn(
                  "p-2 w-56 rounded-full text-center text-sm",
                  index === current ? "bg-secondary" : "",
                )}
              >
                {step}
              </div>
              {step !== "Place order" && (
                <hr className="w-16 border-t border-gray-300 mx-2" />
              )}
            </Fragment>
          );
        },
      )}
    </div>
  );
}
