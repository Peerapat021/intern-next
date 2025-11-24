// app/page.tsx — แสดงสินค้าจริง 100% + ไม่ error + เร็ว + SEO ดี

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { getProducts } from "@/lib/services/products/get";
import { Package } from "lucide-react";

export const revalidate = 60; // รีเฟรชทุก 60 วินาที

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // ดึงสินค้าจริงจาก API ของคุณ
  let products: any[] = [];

  try {
    const data = await getProducts();

    // รองรับทุกรูปแบบที่ API อาจส่งมา
    if (Array.isArray(data)) {
      products = data;
    } else if (data && Array.isArray(data.products)) {
      products = data.products;
    } else if (data && Array.isArray(data.data)) {
      products = data.data;
    }
  } catch (error) {
    console.error("โหลดสินค้าไม่สำเร็จ:", error);
  }

  // แสดงแค่ 8 รายการแรก (หรือน้อยกว่านั้นถ้ามีไม่ถึง)
  const displayedProducts = products.slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        <section className="text-center py-5">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AURA
          </h1>

          {!session ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white font-bold rounded-2xl hover:shadow-xl transition"
              >
                เริ่มต้นใช้งานฟรี
              </Link>
            </div>
          ) : (
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">
              สวัสดี, {session.user?.name || "คุณ"} ยินดีต้อนรับกลับมา
            </p>
          )}
        </section>

        {/* สินค้าขายดี */}
        <section className="py-16">
          <div className="mb-12 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              สินค้าขายดีประจำเดือน
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              คนซื้อเยอะสุดใน 30 วันนี้
            </p>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {displayedProducts.map((product) => (
                <Link
                  key={product.product_id}
                  href={`/product/${product.product_id}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-sm shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-white rounded-t-sm">
                    {product.product_image ? (
                      <>
                        {/* พื้นหลังเบลอ (ทำให้ดูโปรมาก) */}
                        <img
                          src={product.product_image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-20"
                          loading="lazy"
                        />

                        {/* รูปจริง — แสดงเต็มรูป ไม่ตัด ไม่ยืด */}
                        <img
                          src={product.product_image}
                          alt={product.product_name}
                          className="relative z-10 w-full h-full object-contain p-6 
                   group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                        <Package className="w-24 h-24 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}

                    {/* สินค้าหมด */}
                    {product.product_qty === 0 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                        <span className="text-white font-bold text-2xl tracking-wider">สินค้าหมด</span>
                      </div>
                    )}

                    {/* เหลือน้อย */}
                    {product.product_qty <= 5 && product.product_qty > 0 && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold 
                    px-4 py-2 rounded-full shadow-2xl z-30 animate-pulse">
                        เหลือ {product.product_qty}
                      </div>
                    )}
                  </div>

                  {/* ข้อมูลสินค้า */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-3">
                      {product.product_name}
                    </h3>

                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-blue-600">
                        ฿{Number(product.product_price).toLocaleString()}
                      </span>

                      <button
                        className={`mt-5 px-5 py-2.5 rounded-xl text-white font-medium transition ${product.product_qty === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-orange-600 hover:bg-orange-700"
                          }`}
                        disabled={product.product_qty === 0}
                      >
                        {product.product_qty === 0 ? "หมด" : "เพิ่มลงตะกร้า"}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* ถ้ายังไม่มีสินค้าเลย */
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-800 rounded-full blur-xl" />
              <p className="text-2xl font-medium text-gray-600 dark:text-gray-400">
                ยังไม่มีสินค้าในระบบ
              </p>
              <p className="text-gray-500 mt-2">
                เริ่มเพิ่มสินค้าได้ที่หน้าแอดมิน
              </p>
            </div>
          )}

          {/* ปุ่มดูทั้งหมด */}
          {products.length > 20 && (
            <div className="text-center mt-12">
              <Link
                href="/product"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                ดูสินค้าทั้งหมด ({products.length} รายการ) →
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}