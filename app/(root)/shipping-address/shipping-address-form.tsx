"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { ShippingAddress } from "@/types";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { shippingAddressSchema } from "@/lib/validators";
import { ROUTES, shippingAddressDefaultValues } from "@/constants";
import { useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { updateUserAddress } from "@/lib/actions/user.actions";
import CheckoutSteps from "@/components/shared/checkout-steps";

export default function ShippingAddressForm({
  address,
}: {
  address: ShippingAddress | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const [isPending, startTransition] = useTransition();
  const onSubmit: SubmitHandler<ShippingAddress> = (values) => {
    startTransition(async () => {
      const res = await updateUserAddress(values);
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
        return;
      }
      router.push(ROUTES.paymentMethod);
    });
  };

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Shipping Address</h1>
        <p className="text-sm text-muted-foreground">
          Please enter the address that you want to ship to
        </p>
        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="fullName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<ShippingAddress, "fullName">;
                }) => (
                  <FormItem className="w-full">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="streetAddress"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    ShippingAddress,
                    "streetAddress"
                  >;
                }) => (
                  <FormItem className="w-full">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="city"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<ShippingAddress, "city">;
                }) => (
                  <FormItem className="w-full">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<ShippingAddress, "country">;
                }) => (
                  <FormItem className="w-full">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<ShippingAddress, "postalCode">;
                }) => (
                  <FormItem className="w-full">
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
