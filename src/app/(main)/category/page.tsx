// app/(main)/category/page.tsx   ← Server Component (ไม่ต้องใส่ 'use client')

import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { getCategories } from "@/lib/services/categories/get"; // ของคุณจริง ๆ

export const revalidate = 60; // optional: รีเฟรชทุก 60 วิ

export default async function CategoryPage() {
  let categories: any[] = [];

  try {
    const response = await getCategories();

    // รองรับทั้งกรณีที่ API ส่ง array ตรง ๆ หรือ { categories: [...] }
    if (Array.isArray(response)) {
      categories = response;
    } else if (response && Array.isArray(response.categories)) {
      categories = response.categories;
    } else if (response && Array.isArray(response.data)) {
      categories = response.data;
    }
    // ถ้าไม่ตรงรูปแบบไหนเลย → categories ยังเป็น [] อยู่ → ไม่ error
  } catch (error) {
    console.error("โหลดหมวดหมู่ล้มเหลว:", error);
    // ไม่ throw → หน้าเว็บยังโหลดได้
  }

  // สีสวย ๆ วนใช้
  const gradients = [
    "from-pink-500 to-rose-600",
    "from-blue-500 to-cyan-600",
    "from-purple-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-amber-500 to-yellow-600",
    "from-lime-500 to-green-600",
    "from-violet-500 to-fuchsia-600",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            หมวดหมู่สินค้า
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            เลือกดูสินค้าตามหมวดหมู่ที่คุณสนใจ
          </p>
        </div>

        {/* กรณีมีข้อมูลจริง */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.category_id}
                href={`/category/${category.category_id}`}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-4 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div
                  className={`aspect-square bg-gradient-to-br ${gradients[index % gradients.length]} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />

                  <div className="absolute inset-0 w-auto h-auto flex items-center justify-center">
                    <Package className="w-18 h-18 text-white/80 group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-sm mt-6 font-bold drop-shadow-2xl">
                      {category.category_name}
                    </h3>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    <ChevronRight className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* กรณีไม่มีข้อมูลจริงเลย (API ว่าง หรือ error) */
          <div className="text-center py-20">
            <Package className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
            <p className="text-2xl font-medium text-gray-600 dark:text-gray-400">
              ยังไม่มีหมวดหมู่สินค้า
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              เริ่มต้นเพิ่มหมวดหมู่ได้ที่หน้าแอดมิน
            </p>
          </div>
        )}

      </div>
    </div>
  );
}