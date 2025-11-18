
import ProductTable from './ProductTable'
import { getProducts } from '@/lib/services/products/get'

export default async function UserPage() {
  const products = await getProducts();
  return (
    <section>
      <ProductTable products={products} />
    </section>
  )
}
