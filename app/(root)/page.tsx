import { ProductCarousel } from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductsButton from "@/components/view-all-products-button";

import {
  getFeaturedProducts,
  getLatestProduct,
} from "@/lib/actions/product.actions";

export default async function App() {
  const latestProducts = await getLatestProduct();
  const featuredProducts = await getFeaturedProducts();
  console.log("aaa NEXT_PUBLIC_SERVER_URL", process.env.NEXT_PUBLIC_SERVER_URL);

  return (
    <>
      <div className="hidden aaa">
        process.env.NEXT_PUBLIC_SERVER_URL:{" "}
        {process.env.NEXT_PUBLIC_SERVER_URL}{" "}
      </div>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts as any} title="Newest arrival" />
      <ViewAllProductsButton />
    </>
  );
}
