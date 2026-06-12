import { ProductCard } from "@/components/product/product-card";
import { Product } from "@/types/product";

export type GridColumnsPerRow = 2 | 4;

type Props = {
  products: Product[];
  onAdd: (product: Product) => void;
  columnsPerRow: GridColumnsPerRow;
};

const columnsClassMap: Record<GridColumnsPerRow, string> = {
  2: "grid-cols-2",
  4: "grid-cols-2 xl:grid-cols-4",
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
