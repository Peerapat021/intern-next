// app/my-products/page.tsx   หรือวางที่ไหนก็ได้

import Link from "next/link";
import { Package, Edit, Trash2, Eye, Plus } from "lucide-react";

export default function MyProductsPage() {
  // ข้อมูลหลอกสุดสวย 15 รายการ
  const fakeProducts = [
    { id: "1", name: "เสื้อโปโล สีขาว พรีเมียมคอตตอน", price: 490, qty: 128, image: "shirt" },
    { id: "2", name: "กางเกงยีนส์ขาเดฟ ทรงสวย", price: 890, qty: 45, image: "jeans" },
    { id: "3", name: "รองเท้าผ้าใบ สีดำ สไตล์มินิมอล", price: 1290, qty: 3, image: "shoes" },
    { id: "4", name: "กระเป๋าสะพายข้าง หนังแท้", price: 2590, qty: 89, image: "bag" },
    { id: "5", name: "เสื้อยืดโอเวอร์ไซส์ Cotton 100%", price: 290, qty: 0, image: "tshirt" },
    { id: "6", name: "นาฬิกาข้อมือ Minimal สายสแตนเลส", price: 3890, qty: 12, image: "watch" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              รายการสินค้าของฉัน
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              ทั้งหมด {fakeProducts.length} รายการ • ยอดขายรวม 128,490 บาท
            </p>
          </div>
          <Link
            href="/my-products/add"
            className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            เพิ่มสินค้าใหม่
          </Link>
        </div>

        {/* Grid สินค้า */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {fakeProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* รูป (ใช้ placeholder สวย ๆ) */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden flex items-center justify-center">
                <Package className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                {product.qty === 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">สินค้าหมด</span>
                  </div>
                )}
                {product.qty <= 5 && product.qty > 0 && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                    เหลือ {product.qty}
                  </div>
                )}
              </div>

              {/* ข้อมูล */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-3">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ฿{product.price.toLocaleString()}
                  </span>
                  <span className={`text-sm font-medium ${product.qty === 0 ? "text-red-600" : "text-green-600"}`}>
                    {product.qty > 0 ? `เหลือ ${product.qty} ชิ้น` : "หมด"}
                  </span>
                </div>

                {/* ปุ่มจัดการ */}
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center gap-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-sm">
                    <Eye className="w-4 h-4" /> ดู
                  </button>
                  <button className="flex items-center justify-center gap-1 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 text-blue-700 dark:text-blue-400 rounded-lg transition text-sm">
                    <Edit className="w-4 h-4" /> แก้
                  </button>
                  <button className="flex items-center justify-center gap-1 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-400 rounded-lg transition text-sm">
                    <Trash2 className="w-4 h-4" /> ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}