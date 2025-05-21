import { ProductCarousel } from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";

import {
  getFeaturedProducts,
  getLatestProduct,
} from "@/lib/actions/product.actions";

export default async function App() {
  const latestProducts = await getLatestProduct();
  const featuredProducts = await getFeaturedProducts();
  console.log("aaa featured", featuredProducts);
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts as any} title="Newest arrival" />
    </>
  );
}
