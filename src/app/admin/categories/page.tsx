import CategoriesTable from "./CategoriesTable";
import { getCategories } from "@/lib/services/categories/get";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section>
      <CategoriesTable categories={categories} />
    </section>
  )
}
