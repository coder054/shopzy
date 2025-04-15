import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  return (
    <Card className="w-full max-w-sm ">
      <CardHeader className="p-0 items-center ">
        <Link href={ROUTES.product.detail(product.slug)}>
          <Image
            src={product.images[0]}
            alt={product.name}
            height={300}
            width={300}
            priority
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4 ">
        <div className="text-xs  ">{product.brand}</div>
        <Link href={ROUTES.product.detail(product.slug)}>
          <h2 className="text-sm font-medium ">{product.name}</h2>
        </Link>
        <div className="flex-between gap-4 ">
          <p className=" ">{product.rating} stars</p>
          {product.stock > 0 ? (
            <div className="font-bold ">${product.price}</div>
          ) : (
            <div className="text-destructive ">Out of stock</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
