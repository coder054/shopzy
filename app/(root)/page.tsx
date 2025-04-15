import ProductList from "@/components/shared/product/product-list";
import { getLatestProduct } from "@/lib/actions/product.actions";
export default async function App() {
  const latestProducts = await getLatestProduct();
  return (
    <>
      <ProductList data={latestProducts} title="Newest arrival" />
    </>
  );
}
