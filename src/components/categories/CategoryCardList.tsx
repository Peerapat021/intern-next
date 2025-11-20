// CategoryCardList.tsx
import CategoryActions from "./CategoryActions";

interface Props {
  categories: any[];
  onDelete?: (id: number) => void | Promise<void>;
  onEdit?: (id: number) => void | Promise<void>;
}

export default function CategoryCardList({ categories, onDelete, onEdit }: Props) {
  return (
    <div className="md:hidden space-y-4">
      {categories.map((category) => (
        <div key={category.category_id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-800">{category.category_name || "ไม่ระบุชื่อ"}</h2>
            <CategoryActions
              onDelete={() => onDelete?.(category.category_id)}
              onEdit={() => onEdit?.(category.category_id)}
            />
          </div>
          <p className="text-sm text-gray-600 mb-1"><span className="font-medium">รหัสสินค้า:</span> {category.category_id}</p>
          <p className="text-sm text-gray-600 mb-1"><span className="font-medium">ชื่อสินค้า:</span> {category.category_name}</p>
          <p className="text-sm text-gray-600 mb-1"><span className="font-medium">วันที่เพิ่ม:</span> {category.create_at_category}</p>
        </div>
      ))}
    </div>
  );
}
