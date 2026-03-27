import { ProductCard } from "@/components/product/product-card";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
  onAdd: (product: Product) => void;
  columnsPerRow: 2 | 3 | 4;
};

const columnsClassMap: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2 lg:grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export function ProductList({ products, onAdd, columnsPerRow }: Props) {
  return (
    <section className={`grid gap-4 ${columnsClassMap[columnsPerRow]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </section>
  );
}
