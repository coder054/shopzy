import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";
export default function App() {
  return (
    <>
      <ProductList data={sampleData.products} title="Newest arrival" />
    </>
  );
}
