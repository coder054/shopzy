import ProductImages from "@/components/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import ProductPrice from "@/components/shared/product/product-price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
export default async function ProductDetail(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const cart = await getMyCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 ">
      {/* Images Column */}
      <div className="col-span-2">
        <ProductImages images={product.images} />
      </div>
      {/* Details Column */}{" "}
      <div className="col-span-2 p-5">
        <div className="flex flex-col gap-6">
          <p>
            {product.brand} {product.category}
          </p>
          <h1 className="h3-bold">{product.name}</h1>
          <p>
            {product.rating} of {product.numReviews} reviews
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ProductPrice
              value={Number(product.price)}
              className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
            />
          </div>
        </div>
        <div className="mt-10">
          <p>Description:</p>
          <p>{product.description}</p>
        </div>
      </div>
      {/* Action Column */}
      <div>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex justify-between">
              <div>Price</div>
              <div>
                <ProductPrice value={Number(product.price)} />
              </div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>Status</div>
              {product.stock > 0 ? (
                <Badge variant="outline">In stock</Badge>
              ) : (
                <Badge variant="destructive">Unavailable</Badge>
              )}
            </div>
            {product.stock > 0 && (
              <div className=" flex-center">
                <AddToCart
                  item={{
                    image: product.images?.[0],
                    name: product.name,
                    price: Number(product.price),
                    productId: product.id,
                    qty: 1,
                    slug: product.slug,
                  }}
                  cart={cart}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>{" "}
    </div>
  );
}
