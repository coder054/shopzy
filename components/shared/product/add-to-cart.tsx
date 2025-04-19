"use client";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Cart, CartItem } from "@/types";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddToCart({
  item,
  cart,
}: {
  item: Omit<CartItem, "cartId">;
  cart?: Cart;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    if (!res.success) {
      return toast({
        variant: "destructive",
        description: res.message,
      });
    }

    return toast({
      description: res.message,
      action: (
        <ToastAction
          className="bg-primary text-white hover:bg-gray-800"
          onClick={() => router.push("/cart")}
          altText="Go to cart"
        >
          Go to cart
        </ToastAction>
      ),
    });
  };

  const handleRemoveFromCart = async () => {
    const res = await removeItemFromCart(item.productId);
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);
  return existItem ? (
    <div className=" ">
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      <Plus />
      Add to cart
    </Button>
  );
}
