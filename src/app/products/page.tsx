
import ProductCard from '@/components/product/ProductCard';
import { mockProducts } from '@/data/mock-products';

export default function ProductsPage() {
  return (
    <div className="flex flex-col items-start justify-start">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Products</h1>
      <p className="mt-2 mb-6 text-muted-foreground">Browse our available products.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
