import { Product } from "@/types";
import ProductCard from "./product-card";

export default function ProductList({
  data,
  title,
}: {
  data: Product[];
  title?: string;
}) {
  return (
    <div className="my-10 ">
      <h2 className="h2-bold mb-4 ">{title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {(data || []).map((o) => (
          <ProductCard product={o} key={o.name} />
        ))}
      </div>
    </div>
  );
}
