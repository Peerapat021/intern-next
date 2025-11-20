import CategoryActions from "./CategoryActions";

interface Props {
  categories: any[];
  onDelete?: (id: number) => void | Promise<void>;
  onEdit?: (id: number) => void | Promise<void>;
}

export default function CategoryTable({ categories, onDelete, onEdit }: Props) {
  return (
    <div className="overflow-x-auto hidden md:block">
      <table className="w-full border border-gray-200 min-w-[600px]">
        <thead>
          <tr className="border-b-2 border-[#4e6cef] shadow-md bg-gray-50">
            <th className="p-4 text-left">รหัสหมวดหมู่</th>
            <th className="p-4 text-left">ชื่อหมวดหมู่</th>
            <th className="p-4 text-left">วันที่เพิ่ม</th>
            <th className="p-4 text-left">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.category_id} className="hover:bg-gray-50 transition duration-150">
              <td className="p-4">{category.category_id}</td>
              <td className="p-4">{category.category_name}</td>
              <td className="p-4">{category.create_at_category}</td>
              <td className="p-4">
                <CategoryActions
                  onEdit={() => onEdit?.(category.category_id)}
                  onDelete={() => onDelete?.(category.category_id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
