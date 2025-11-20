import ProductLogTable from "./ProductLogTable";
import { getProductLogs } from "@/lib/services/productLog/get";

export default async function ProductLogPage() {
  const productLogs = await getProductLogs();
  return (
    <section>
      <ProductLogTable productLogs={productLogs} />
    </section>
  )
}
