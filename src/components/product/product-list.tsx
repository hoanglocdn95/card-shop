import { ProductCard } from "@/components/product/product-card";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
  onAdd: (product: Product) => void;
};

export function ProductList({ products, onAdd }: Props) {
  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </section>
  );
}
